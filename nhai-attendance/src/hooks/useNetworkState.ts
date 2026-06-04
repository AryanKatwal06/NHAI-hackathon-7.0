// src/hooks/useNetworkState.ts
import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useSyncStore } from '@store/syncStore';

export function useNetworkState(): {
  isOnline: boolean;
  isSyncing: boolean;
  pendingSyncCount: number;
} {
  const { isOnline, isSyncing, pendingSyncCount, setOnline } = useSyncStore();

  useEffect(() => {
    void NetInfo.fetch().then((state) => {
      const online = (state.isConnected ?? false) && (state.isInternetReachable ?? false);
      setOnline(online);
    });
  }, [setOnline]);

  return { isOnline, isSyncing, pendingSyncCount };
}
