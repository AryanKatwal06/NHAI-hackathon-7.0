export interface DeviceTrustScore {
  score: number; // 0–100
  isRegistered: boolean;
  isPrimaryDevice: boolean;
  deviceFingerprint: string;
  reason: string;
}

export interface RegisteredDevice {
  id: string; // UUID
  workerId: string;
  deviceFingerprint: string; // SHA-256 hash (NOT the raw hardware ID)
  deviceModel: string;
  osVersion: string;
  registeredAt: string; // ISO 8601
  isPrimary: boolean;
  lastUsedAt?: string;
}
