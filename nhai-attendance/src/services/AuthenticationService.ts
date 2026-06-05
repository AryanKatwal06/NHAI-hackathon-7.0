import { acquireCurrentPosition, computeLocationTrustScore } from './LocationService';
import { getCurrentDeviceFingerprint, computeDeviceTrustScore } from './DeviceTrustService';
import { computeBehavioralScore } from './BehavioralService';
import { computeTrustScore, generateExplainableResult } from './TrustScoreService';
import { PerformanceMonitor } from './PerformanceMonitor';
import { getDeviceFingerprintsForWorker } from '@db/repositories/devices.repository';
import { getLoginHistory } from '@db/repositories/behaviorHistory.repository';
import { createAuthRecord } from '@db/repositories/authRecords.repository';
import { findWorkerByEmployeeId, createWorker } from '@db/repositories/workers.repository';
import { enqueue } from '@db/repositories/syncQueue.repository';
import { logEvent } from '@db/repositories/auditLogs.repository';
import { useSettingsStore } from '@store/settingsStore';
import type { TrustSignals, TrustScoreResult, ExplainableAuthResult } from '@/types/trust.types';
import type { AuthenticationAttempt } from '@/types/auth.types';
import type { SyncPayload } from '@/types/sync.types';
import { v4 as uuidv4 } from 'uuid';

export interface PipelinePrecomputedSignals {
  locationScore: number;
  locationDetails: string;
  deviceScore: number;
  deviceDetails: string;
  deviceFingerprint: string;
  gpsLatitude?: number | undefined;
  gpsLongitude?: number | undefined;
  gpsAccuracy?: number | undefined;
}

/**
 * Pre-computes the signals that don't require camera input.
 * Call this as soon as the authentication screen mounts to minimize total pipeline time.
 * GPS and device fingerprint are the slowest operations — starting them immediately
 * means by the time the face is detected, these are already complete.
 *
 * @param workerId - The worker attempting authentication (identified from QR/ID first)
 * @returns Pre-computed location and device signals
 */
export async function precomputeBackgroundSignals(
  workerId: string,
): Promise<PipelinePrecomputedSignals> {
  const worksite = useSettingsStore.getState().worksite;

  // Run GPS and device fingerprint concurrently — they don't depend on each other
  const [positionResult, deviceFingerprintResult, registeredDevicesResult] =
    await Promise.allSettled([
      acquireCurrentPosition(),
      getCurrentDeviceFingerprint(),
      getDeviceFingerprintsForWorker(workerId),
    ]);

  const deviceFingerprint =
    deviceFingerprintResult.status === 'fulfilled' ? deviceFingerprintResult.value : 'unknown';
  const registeredFingerprints =
    registeredDevicesResult.status === 'fulfilled' ? registeredDevicesResult.value : [];
  const deviceTrust = computeDeviceTrustScore(deviceFingerprint, registeredFingerprints);

  let locationScore = 10; // Default low score if GPS fails
  let gpsLatitude: number | undefined;
  let gpsLongitude: number | undefined;
  let gpsAccuracy: number | undefined;
  let locationDetails = 'GPS acquisition failed — location unverified.';

  if (positionResult.status === 'fulfilled' && worksite !== null) {
    const pos = positionResult.value;
    gpsLatitude = pos.latitude;
    gpsLongitude = pos.longitude;
    gpsAccuracy = pos.accuracy;

    const locationTrust = computeLocationTrustScore(pos.latitude, pos.longitude, worksite);
    locationScore = locationTrust.score;
    locationDetails = locationTrust.reason;
  } else if (worksite === null) {
    locationDetails = 'No worksite configured. Configure worksite in Settings.';
  }

  return {
    locationScore,
    locationDetails,
    deviceScore: deviceTrust.score,
    deviceDetails: deviceTrust.reason,
    deviceFingerprint,
    gpsLatitude,
    gpsLongitude,
    gpsAccuracy,
  };
}

/**
 * Completes the authentication pipeline once face and liveness scores are available.
 * Called by the UI after face recognition and liveness detection are complete.
 *
 * @param workerId - Identified worker UUID
 * @param faceMatchScore - Score from face recognition module (0–100)
 * @param livenessScore - Score from liveness detection module (0–100)
 * @param precomputed - The pre-computed background signals from precomputeBackgroundSignals()
 * @param pipelineStartTime - performance.now() timestamp from when the pipeline started
 * @returns Complete authentication result with explainability
 */
export async function completePipeline(
  workerId: string,
  faceMatchScore: number,
  livenessScore: number,
  precomputed: PipelinePrecomputedSignals,
  pipelineStartTime: number,
): Promise<{ trustResult: TrustScoreResult; explainable: ExplainableAuthResult }> {
  // Ensure worker exists to satisfy SQLite foreign key constraints
  let worker = await findWorkerByEmployeeId(workerId);
  const worksite = useSettingsStore.getState().worksite;
  if (!worker) {
    worker = await createWorker({
      employeeId: workerId,
      name: 'Auto-Enrolled Worker',
      designation: 'Engineer',
      worksiteId: worksite?.id ?? 'default_worksite',
    });
  }
  const dbWorkerId = worker.id;

  const loginHistory = await getLoginHistory(dbWorkerId, 30);
  const behavioralResult = computeBehavioralScore(
    new Date().toISOString(),
    loginHistory,
    worksite?.shiftStartHour ?? 8.0,
  );

  const signals: TrustSignals = {
    faceMatchScore,
    livenessScore,
    deviceTrustScore: precomputed.deviceScore,
    behavioralScore: behavioralResult.score,
    locationScore: precomputed.locationScore,
  };

  const trustResult = computeTrustScore(signals);
  const explainable = generateExplainableResult(trustResult);

  const totalPipelineMs = performance.now() - pipelineStartTime;
  PerformanceMonitor.record('total_authentication', totalPipelineMs);

  const attemptId = uuidv4();
  const attempt: AuthenticationAttempt = {
    id: attemptId,
    workerId: dbWorkerId,
    worksiteId: worksite?.id ?? 'unknown',
    deviceId: precomputed.deviceFingerprint,
    trustResult,
    gpsLatitude: precomputed.gpsLatitude,
    gpsLongitude: precomputed.gpsLongitude,
    gpsAccuracy: precomputed.gpsAccuracy,
    attemptedAt: new Date().toISOString(),
    isSynced: false,
  };

  await createAuthRecord(attempt);

  // Enqueue for AWS sync (only non-biometric payload)
  const syncPayload: SyncPayload = {
    authAttemptId: attemptId,
    workerId: dbWorkerId,
    worksiteId: attempt.worksiteId,
    deviceId: precomputed.deviceFingerprint,
    trustScore: trustResult.weightedScore,
    decision: trustResult.decision,
    attemptedAt: attempt.attemptedAt,
    faceMatchScore,
    livenessScore,
    deviceTrustScore: precomputed.deviceScore,
    behavioralScore: behavioralResult.score,
    locationScore: precomputed.locationScore,
    gpsLatitude: precomputed.gpsLatitude,
    gpsLongitude: precomputed.gpsLongitude,
    isContradiction: trustResult.isContradiction,
  };
  await enqueue(attemptId, syncPayload);

  await logEvent(
    'AUTH_ATTEMPT_COMPLETED',
    precomputed.deviceFingerprint,
    {
      decision: trustResult.decision,
      trustScore: trustResult.weightedScore,
      signals,
      pipelineMs: totalPipelineMs,
    },
    dbWorkerId,
    attempt.worksiteId,
  );

  return { trustResult, explainable };
}
