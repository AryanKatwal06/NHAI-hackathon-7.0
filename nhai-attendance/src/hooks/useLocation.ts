// src/hooks/useLocation.ts
import { useState, useCallback } from 'react';
import { acquireCurrentPosition } from '@services/LocationService';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  isLoading: boolean;
  error: string | null;
}

export function useLocation(): LocationState & { acquire: () => Promise<void> } {
  const [state, setState] = useState<LocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    isLoading: false,
    error: null,
  });

  const acquire = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const pos = await acquireCurrentPosition();
      setState({
        latitude: pos.latitude,
        longitude: pos.longitude,
        accuracy: pos.accuracy,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      setState((s) => ({
        ...s,
        isLoading: false,
        error: err instanceof Error ? err.message : 'GPS failed',
      }));
    }
  }, []);

  return { ...state, acquire };
}
