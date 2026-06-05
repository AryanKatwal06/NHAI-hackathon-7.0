
import type { SyncPayload } from '@/types/sync.types';

interface OfflineSyncResponse {
  success: boolean;
  syncedIds: string[];
  failedIds: string[];
  syncedCount: number;
  failedCount: number;
}

/**
 * Simulates sending a batch of sync payloads to AWS.
 * Introduces a realistic 1–2 second delay to mimic network latency.
 * Always succeeds (simulates a working network connection).
 *
 * In a real deployment, this function is replaced by the actual
 * AWS API Gateway POST call in src/api/awsSync.ts.
 */
export async function offlineSyncBatch(records: SyncPayload[]): Promise<OfflineSyncResponse> {
  // Simulate network latency: 1000ms base + up to 500ms jitter
  const latency = 1000 + Math.floor(Math.random() * 500);
  await new Promise<void>((resolve) => setTimeout(resolve, latency));

  // Every record succeeds in offline simulation
  const syncedIds = records.map((r) => r.authAttemptId);

  return {
    success: true,
    syncedIds,
    failedIds: [],
    syncedCount: syncedIds.length,
    failedCount: 0,
    };
}

export async function offlineCheckHealth(): Promise<boolean> {
  return true;
}
