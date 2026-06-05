import { useState, useEffect } from 'react';

export function useDeviceInfo() {
  const [deviceId, setDeviceId] = useState<string>('device-unknown');

  useEffect(() => {
    // In a real app, this would use react-native-device-info
    setDeviceId(`device-${Math.floor(Math.random() * 1000)}`);
  }, []);

  return { deviceId };
}
