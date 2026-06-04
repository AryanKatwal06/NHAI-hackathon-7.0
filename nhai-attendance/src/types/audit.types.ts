export type AuditEventType =
  | 'AUTH_ATTEMPT_STARTED'
  | 'AUTH_ATTEMPT_COMPLETED'
  | 'AUTH_ATTEMPT_REJECTED'
  | 'ENROLLMENT_STARTED'
  | 'ENROLLMENT_COMPLETED'
  | 'LIVENESS_CHALLENGE_PASSED'
  | 'LIVENESS_CHALLENGE_FAILED'
  | 'LIVENESS_CHALLENGE_TIMEOUT'
  | 'DEVICE_REGISTERED'
  | 'DEVICE_MISMATCH_DETECTED'
  | 'SYNC_STARTED'
  | 'SYNC_COMPLETED'
  | 'SYNC_FAILED'
  | 'DATA_PURGED'
  | 'PURGE_COMPLETED'
  | 'PURGE_FAILED'
  | 'SETTINGS_CHANGED'
  | 'SECURITY_EVENT';

export interface AuditLogEntry {
  id: string;
  eventType: AuditEventType;
  workerId?: string;
  deviceId: string;
  worksiteId?: string;
  details: string;
  timestamp: string;
  integrityHash: string;
}
