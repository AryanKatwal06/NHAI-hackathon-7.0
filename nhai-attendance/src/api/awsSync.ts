// src/api/awsSync.ts
// AWS API Gateway client for the mobile application.
// ONLY place in the codebase that makes network calls.
// CRITICAL: NEVER sends face embeddings, images, or biometric data.

import Config from 'react-native-config';
import { SYNC_CONFIG } from '@constants/app.constants';
import type { SyncPayload } from '@/types/sync.types';

interface SyncRequest {
  records: SyncPayload[];
  appVersion: string;
}

interface SyncResponse {
  success: boolean;
  syncedIds: string[];
  failedIds: string[];
  syncedCount: number;
  failedCount: number;
}

interface StatusResponse {
  status: 'OK' | 'ERROR';
  service: string;
  timestamp: string;
  version: string;
}

export type SyncErrorType =
  | 'NETWORK_UNAVAILABLE'
  | 'API_UNREACHABLE'
  | 'REQUEST_TIMEOUT'
  | 'VALIDATION_ERROR'
  | 'SERVER_ERROR'
  | 'UNKNOWN';

export class SyncApiError extends Error {
  constructor(
    public readonly type: SyncErrorType,
    message: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = 'SyncApiError';
  }
}

function getBaseUrl(): string {
  const baseURL = Config.AWS_API_GATEWAY_URL;
  if (!baseURL || baseURL === 'https://your-api-id.execute-api.ap-south-1.amazonaws.com/prod') {
    throw new SyncApiError(
      'API_UNREACHABLE',
      'AWS_API_GATEWAY_URL is not configured. Update .env.development with the real API Gateway URL.',
    );
  }
  return baseURL ?? 'https://your-api-id.execute-api.ap-south-1.amazonaws.com/prod';
}

/**
 * Checks if the AWS API is reachable.
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const baseUrl = getBaseUrl();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(`${baseUrl}/status`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!response.ok) {
      return false;
    }
    const data: StatusResponse = await response.json();
    return data.status === 'OK';
  } catch {
    return false;
  }
}

/**
 * Sends a batch of sync payloads to the AWS API.
 * NEVER sends biometric data — only aggregate scores and metadata.
 */
export async function syncBatch(records: SyncPayload[]): Promise<SyncResponse> {
  if (records.length === 0) {
    return { success: true, syncedIds: [], failedIds: [], syncedCount: 0, failedCount: 0 };
  }

  if (records.length > SYNC_CONFIG.SYNC_BATCH_SIZE) {
    throw new SyncApiError(
      'VALIDATION_ERROR',
      `Batch size ${records.length} exceeds maximum ${SYNC_CONFIG.SYNC_BATCH_SIZE}.`,
    );
  }

  // Biometric data safety check
  const prohibited = ['faceEmbedding', 'embeddingData', 'faceImage', 'facePixels', 'rawBiometric'];
  for (const record of records) {
    for (const field of prohibited) {
      if (field in record) {
        throw new SyncApiError(
          'VALIDATION_ERROR',
          `CRITICAL: Biometric field "${field}" found in sync payload. Sync aborted.`,
        );
      }
    }
  }

  try {
    const baseUrl = getBaseUrl();
    const requestBody: SyncRequest = { records, appVersion: '1.0.0' };
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(`${baseUrl}/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-App-Version': '1.0.0' },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      const errorData = await response.text();
      if (response.status === 400) {
        throw new SyncApiError('VALIDATION_ERROR', `API rejected payload: ${errorData}`, 400);
      }
      throw new SyncApiError(
        'SERVER_ERROR',
        `Server error ${response.status}: ${errorData}`,
        response.status,
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof SyncApiError) {
      throw error;
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw new SyncApiError('REQUEST_TIMEOUT', 'Request timed out after 30 seconds.');
    }
    throw new SyncApiError(
      'NETWORK_UNAVAILABLE',
      error instanceof Error ? error.message : String(error),
    );
  }
}
