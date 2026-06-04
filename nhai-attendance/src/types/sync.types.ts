export type SyncStatus = 'PENDING' | 'IN_PROGRESS' | 'SYNCED' | 'FAILED' | 'ABANDONED';

export interface SyncPayload {
  authAttemptId: string;
  workerId: string;
  worksiteId: string;
  deviceId: string;
  trustScore: number;
  decision: string;
  attemptedAt: string;
  faceMatchScore: number;
  livenessScore: number;
  deviceTrustScore: number;
  behavioralScore: number;
  locationScore: number;
  gpsLatitude?: number;
  gpsLongitude?: number;
  isContradiction: boolean;
}

export interface SyncQueueItem {
  id: string;
  recordType: 'AUTH_ATTEMPT';
  recordId: string;
  payload: SyncPayload;
  status: SyncStatus;
  createdAt: string;
  attempts: number;
  lastAttemptAt?: string;
  lastError?: string;
  syncedAt?: string;
}
