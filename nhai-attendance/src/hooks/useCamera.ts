// src/hooks/useCamera.ts
import { useState, useCallback } from 'react';
import { Platform, Linking } from 'react-native';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  type PermissionStatus,
} from 'react-native-permissions';

export type CameraStatus = 'checking' | 'granted' | 'denied' | 'blocked';

export function useCamera() {
  const [status, setStatus] = useState<CameraStatus>('checking');

  const checkPermission = useCallback(async (): Promise<CameraStatus> => {
    const permission = Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA;
    const result: PermissionStatus = await check(permission);
    const mapped: CameraStatus =
      result === RESULTS.GRANTED ? 'granted' : result === RESULTS.DENIED ? 'denied' : 'blocked';
    setStatus(mapped);
    return mapped;
  }, []);

  const requestPermission = useCallback(async (): Promise<CameraStatus> => {
    const current = await checkPermission();
    if (current !== 'denied') {
      return current;
    }
    const permission = Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA;
    const result = await request(permission);
    const mapped: CameraStatus = result === RESULTS.GRANTED ? 'granted' : 'blocked';
    setStatus(mapped);
    return mapped;
  }, [checkPermission]);

  const openSettings = useCallback(async () => {
    await Linking.openSettings();
  }, []);

  return { status, requestPermission, openSettings };
}
