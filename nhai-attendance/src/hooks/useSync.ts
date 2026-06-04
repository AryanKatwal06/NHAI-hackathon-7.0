// src/hooks/useSync.ts
import { useCallback } from 'react';
import { useSyncStore } from '@store/syncStore';
import { triggerSync, refreshPendingCount } from '@services/SyncService';

export function useSync() {
  const { isSyncing, lastSyncAt, lastSyncStatus, pendingSyncCount, isOnline } = useSyncStore();

  const handleTriggerSync = useCallback(async () => {
    await triggerSync();
    await refreshPendingCount();
  }, []);

  return {
    triggerSync: handleTriggerSync,
    refreshPendingCount,
    isSyncing,
    lastSyncAt,
    lastSyncStatus,
    pendingSyncCount,
    isOnline,
  };
}
