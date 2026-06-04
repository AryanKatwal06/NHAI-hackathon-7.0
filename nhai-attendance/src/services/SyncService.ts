/* eslint-disable */
// SyncService.ts

import NetInfo from '@react-native-community/netinfo';
import {
  syncBatch as awsSyncBatch,
  checkApiHealth as awsCheckHealth,
  SyncApiError,
} from '@api/awsSync';
import { mockSyncBatch, mockCheckHealth } from '@services/MockSyncService';
import Config from 'react-native-config';
import {
  getPending,
  markInProgress,
  markSynced,
  markFailed,
  abandonExhausted,
  purgeSynced,
} from '@db/repositories/syncQueue.repository';

// Determine whether to use real AWS or mock sync
const USE_REAL_AWS = Boolean(
  Config.AWS_API_GATEWAY_URL &&
  Config.AWS_API_GATEWAY_URL !== 'https://your-api-id.execute-api.ap-south-1.amazonaws.com/prod',
);

// Use real AWS if configured, mock otherwise
const syncBatch = USE_REAL_AWS ? awsSyncBatch : mockSyncBatch;
const checkApiHealth = USE_REAL_AWS ? awsCheckHealth : mockCheckHealth;

// Log which mode is active so the demo clearly shows
console.info(`[SyncService] Sync mode: ${USE_REAL_AWS ? 'REAL AWS' : 'MOCK (demo mode)'}`);
import { markAsSynced as markAuthRecordSynced } from '@db/repositories/authRecords.repository';
import { logEvent } from '@services/AuditService';
import { getCurrentDeviceFingerprint } from '@services/DeviceTrustService';
import { useSyncStore } from '@store/syncStore';
import { SYNC_CONFIG } from '@constants/app.constants';

let isSyncInProgress = false;
let netInfoUnsubscribe: (() => void) | null = null;

/**
 * Computes exponential backoff delay.
 */
/**
 * Starts listening for network connectivity changes.
 * Automatically triggers sync when connectivity is restored.
 */
export function startNetworkListener(): void {
  if (netInfoUnsubscribe !== null) {
    return;
  }

  netInfoUnsubscribe = NetInfo.addEventListener((state) => {
    const isOnline = (state.isConnected ?? false) && (state.isInternetReachable ?? false);
    useSyncStore.getState().setOnline(isOnline);

    if (isOnline && !isSyncInProgress) {
      setTimeout(() => {
        void triggerSync();
      }, 2000);
    }
  });
}

/**
 * Stops the network listener.
 */
export function stopNetworkListener(): void {
  if (netInfoUnsubscribe !== null) {
    netInfoUnsubscribe();
    netInfoUnsubscribe = null;
  }
}

/**
 * Main sync trigger. Safe to call multiple times — concurrent sync prevented.
 */
export async function triggerSync(): Promise<number> {
  if (isSyncInProgress) {
    console.info('[SyncService] Sync already in progress — skipping');
    return 0;
  }

  const { startSync, syncSucceeded, syncFailed } = useSyncStore.getState();
  isSyncInProgress = true;
  startSync();

  const deviceFingerprint = await getCurrentDeviceFingerprint().catch(() => 'unknown');

  try {
    await logEvent('SYNC_STARTED', deviceFingerprint, { trigger: 'auto' });

    const isHealthy = await checkApiHealth();
    if (!isHealthy) {
      throw new SyncApiError('API_UNREACHABLE', 'API health check failed — aborting sync.');
    }

    const abandonedCount = await abandonExhausted();
    if (abandonedCount > 0) {
      console.warn(`[SyncService] ${abandonedCount} records abandoned after max retries`);
    }

    let totalSynced = 0;
    let hasMore = true;

    while (hasMore) {
      const pending = await getPending(SYNC_CONFIG.SYNC_BATCH_SIZE);
      if (pending.length === 0) {
        hasMore = false;
        break;
      }

      await Promise.all(pending.map((item) => markInProgress(item.id)));
      const payloads = pending.map((item) => item.payload);

      try {
        const result = await syncBatch(payloads);

        await Promise.all([
          ...result.syncedIds.map(async (authAttemptId) => {
            const queueItem = pending.find((p) => p.payload.authAttemptId === authAttemptId);
            if (queueItem) {
              await markSynced(queueItem.id);
              await markAuthRecordSynced(authAttemptId);
            }
          }),
          ...result.failedIds.map(async (authAttemptId) => {
            const queueItem = pending.find((p) => p.payload.authAttemptId === authAttemptId);
            if (queueItem) {
              await markFailed(queueItem.id, 'Server rejected this record');
            }
          }),
        ]);

        totalSynced += result.syncedCount;
        if (pending.length < SYNC_CONFIG.SYNC_BATCH_SIZE) {
          hasMore = false;
        }
      } catch (batchError) {
        await Promise.all(
          pending.map((item) =>
            markFailed(
              item.id,
              batchError instanceof Error ? batchError.message : 'Batch sync failed',
            ),
          ),
        );
        throw batchError;
      }
    }

    const purgedCount = await purgeSynced();
    console.info(`[SyncService] Sync complete. Synced: ${totalSynced}, Purged: ${purgedCount}`);
    await logEvent('SYNC_COMPLETED', deviceFingerprint, { syncedCount: totalSynced, purgedCount });
    syncSucceeded(totalSynced);
    return totalSynced;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[SyncService] Sync failed:', errorMessage);
    await logEvent('SYNC_FAILED', deviceFingerprint, { error: errorMessage }).catch(() => {});
    syncFailed(errorMessage);
    return 0;
  } finally {
    isSyncInProgress = false;
  }
}

/**
 * Updates the pending sync count in the store.
 */
export async function refreshPendingCount(): Promise<void> {
  const pending = await getPending(1000);
  useSyncStore.getState().setPendingCount(pending.length);
}
