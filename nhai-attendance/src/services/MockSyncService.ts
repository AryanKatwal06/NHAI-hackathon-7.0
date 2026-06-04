// MockSyncService.ts

import type { SyncPayload } from '@/types/sync.types';

interface MockSyncResponse {
  success: boolean;
  syncedIds: string[];
  failedIds: string[];
  syncedCount: number;
  failedCount: number;
  isMocked: boolean;
}

/**
 * Simulates sending a batch of sync payloads to AWS.
 * Introduces a realistic 1–2 second delay to mimic network latency.
 * Always succeeds (simulates a working network connection).
 *
 * In a real deployment, this function is replaced by the actual
 * AWS API Gateway POST call in src/api/awsSync.ts.
 */
export async function mockSyncBatch(records: SyncPayload[]): Promise<MockSyncResponse> {
  // Simulate network latency: 1000ms base + up to 500ms jitter
  const latency = 1000 + Math.floor(Math.random() * 500);
  await new Promise<void>((resolve) => setTimeout(resolve, latency));

  // Mock: every record succeeds
  const syncedIds = records.map((r) => r.authAttemptId);

  return {
    success: true,
    syncedIds,
    failedIds: [],
    syncedCount: syncedIds.length,
    failedCount: 0,
    isMocked: true,
  };
}

/**
 * Simulates the health check endpoint.
 * Returns 'OK' with a 200ms delay.
 */
export async function mockCheckHealth(): Promise<boolean> {
  await new Promise<void>((resolve) => setTimeout(resolve, 200));
  return true;
}
