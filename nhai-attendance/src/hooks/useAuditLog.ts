// src/hooks/useAuditLog.ts
import { useCallback } from 'react';
import { logEvent } from '@services/AuditService';
import { getCurrentDeviceFingerprint } from '@services/DeviceTrustService';
import { useSettingsStore } from '@store/settingsStore';
import type { AuditEventType } from '@/types/audit.types';

export function useAuditLog() {
  const { worksite } = useSettingsStore();

  const log = useCallback(
    async (eventType: AuditEventType, details: object, workerId?: string) => {
      const deviceId = await getCurrentDeviceFingerprint();
      await logEvent(eventType, deviceId, details, workerId, worksite?.id);
    },
    [worksite?.id],
  );

  return { log };
}
