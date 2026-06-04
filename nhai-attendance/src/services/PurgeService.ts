/* eslint-disable */
// PurgeService.ts

import { purgeSynced, getPending } from '@db/repositories/syncQueue.repository';
import { logEvent } from '@services/AuditService';
import { getCurrentDeviceFingerprint } from '@services/DeviceTrustService';

/**
 * Purges all synced records from the sync queue.
 * Called automatically after a successful sync cycle.
 *
 * @returns Number of records purged
 */
export async function purgeCompletedSyncRecords(): Promise<number> {
  const deviceFingerprint = await getCurrentDeviceFingerprint().catch(() => 'unknown');

  try {
    const purgedCount = await purgeSynced();

    if (purgedCount > 0) {
      await logEvent('PURGE_COMPLETED', deviceFingerprint, {
        purgedCount,
        timestamp: new Date().toISOString(),
      });
      console.info(`[PurgeService] Purged ${purgedCount} synced records from queue`);
    }

    return purgedCount;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[PurgeService] Purge failed:', errorMsg);
    await logEvent('PURGE_FAILED', deviceFingerprint, { error: errorMsg }).catch(() => {});
    throw error;
  }
}

/**
 * Returns the current sync queue statistics.
 */
export async function getSyncQueueStats(): Promise<{
  pendingCount: number;
  totalQueued: number;
}> {
  const pending = await getPending(10000);
  return {
    pendingCount: pending.length,
    totalQueued: pending.length,
  };
}

/**
 * Checks whether a purge is needed (i.e., there are synced records to clean up).
 */
export async function isPurgeNeeded(): Promise<boolean> {
  // purgeSynced is idempotent — if there are no SYNCED records, it returns 0
  // We just check if there are pending records that might become purgeable
  const pending = await getPending(1);
  return pending.length > 0;
}
