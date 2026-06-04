import type { TrustScoreResult } from './trust.types';

export interface AuthenticationAttempt {
  id: string;
  workerId: string;
  worksiteId: string;
  deviceId: string;
  trustResult: TrustScoreResult;
  gpsLatitude?: number;
  gpsLongitude?: number;
  gpsAccuracy?: number;
  attemptedAt: string;
  syncedAt?: string;
  isSynced: boolean;
  supervisorReviewNote?: string;
  supervisorReviewedAt?: string;
  primaryReason?: string;
}

export type AuthStep =
  | 'IDLE'
  | 'ACQUIRING_GPS'
  | 'FACE_DETECTION'
  | 'LIVENESS_CHALLENGE'
  | 'COMPUTING_TRUST'
  | 'COMPLETE'
  | 'FAILED';

export interface AuthenticationSession {
  sessionId: string;
  workerId?: string;
  startedAt: string;
  completedAt?: string;
  currentStep: AuthStep;
  isComplete: boolean;
  faceMatchScore?: number;
  livenessScore?: number;
  deviceTrustScore?: number;
  locationScore?: number;
  behavioralScore?: number;
}
