import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

type SyncStatus = 'IDLE' | 'SYNCING' | 'SUCCESS' | 'FAILED';

interface SyncStore {
  isOnline: boolean;
  pendingSyncCount: number;
  lastSyncAt: string | null;
  lastSyncStatus: SyncStatus;
  lastSyncError: string | null;
  isSyncing: boolean;

  setOnline: (online: boolean) => void;
  setPendingCount: (count: number) => void;
  startSync: () => void;
  syncSucceeded: (syncedCount: number) => void;
  syncFailed: (error: string) => void;
  resetSyncState: () => void;
}

export const useSyncStore = create<SyncStore>()(
  immer((set) => ({
    isOnline: false,
    pendingSyncCount: 0,
    lastSyncAt: null,
    lastSyncStatus: 'IDLE',
    lastSyncError: null,
    isSyncing: false,

    setOnline: (online) =>
      set((state) => {
        state.isOnline = online;
      }),
    setPendingCount: (count) =>
      set((state) => {
        state.pendingSyncCount = count;
      }),

    startSync: () =>
      set((state) => {
        state.isSyncing = true;
        state.lastSyncStatus = 'SYNCING';
        state.lastSyncError = null;
      }),

    syncSucceeded: (syncedCount) =>
      set((state) => {
        state.isSyncing = false;
        state.lastSyncStatus = 'SUCCESS';
        state.lastSyncAt = new Date().toISOString();
        state.pendingSyncCount = Math.max(0, state.pendingSyncCount - syncedCount);
      }),

    syncFailed: (error) =>
      set((state) => {
        state.isSyncing = false;
        state.lastSyncStatus = 'FAILED';
        state.lastSyncError = error;
      }),

    resetSyncState: () =>
      set((state) => {
        state.isSyncing = false;
        state.lastSyncStatus = 'IDLE';
        state.lastSyncError = null;
      }),
  })),
);
