import { getDatabase } from '../connection';
import type { AuthenticationAttempt } from '@/types/auth.types';
import { TABLES } from '@constants/storage.constants';

export async function createAuthRecord(attempt: AuthenticationAttempt): Promise<void> {
  const db = getDatabase();
  const tr = attempt.trustResult;
  await db.executeAsync(
    `INSERT INTO ${TABLES.AUTH_RECORDS} (
      id, worker_id, worksite_id, device_id, decision, trust_score,
      face_match_score, liveness_score, device_trust_score, behavioral_score,
      location_score, is_contradiction, contradiction_details,
      gps_latitude, gps_longitude, gps_accuracy, primary_reason,
      attempted_at, is_synced
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0);`,
    [
      attempt.id,
      attempt.workerId,
      attempt.worksiteId,
      attempt.deviceId,
      tr.decision,
      tr.weightedScore,
      tr.signals.faceMatchScore,
      tr.signals.livenessScore,
      tr.signals.deviceTrustScore,
      tr.signals.behavioralScore,
      tr.signals.locationScore,
      tr.isContradiction ? 1 : 0,
      tr.contradictionDetails ?? null,
      attempt.gpsLatitude ?? null,
      attempt.gpsLongitude ?? null,
      attempt.gpsAccuracy ?? null,
      attempt.primaryReason ?? null,
      attempt.attemptedAt,
    ],
  );
}

function mapRowToAuthAttempt(row: Record<string, unknown>): AuthenticationAttempt {
  return {
    id: row.id as string,
    workerId: row.worker_id as string,
    worksiteId: row.worksite_id as string,
    deviceId: row.device_id as string,
    trustResult: {
      signals: {
        faceMatchScore: row.face_match_score as number,
        livenessScore: row.liveness_score as number,
        deviceTrustScore: row.device_trust_score as number,
        behavioralScore: row.behavioral_score as number,
        locationScore: row.location_score as number,
      },
      weightedScore: row.trust_score as number,
      decision: row.decision as 'AUTHENTICATED' | 'FLAGGED' | 'REJECTED',
      isContradiction: (row.is_contradiction as number) === 1,
      contradictionDetails: row.contradiction_details as string | undefined,
      computedAt: row.attempted_at as string,
    },
    gpsLatitude: row.gps_latitude as number | undefined,
    gpsLongitude: row.gps_longitude as number | undefined,
    gpsAccuracy: row.gps_accuracy as number | undefined,
    primaryReason: row.primary_reason as string | undefined,
    attemptedAt: row.attempted_at as string,
    isSynced: (row.is_synced as number) === 1,
    syncedAt: row.synced_at as string | undefined,
  };
}

export async function getAuthRecordsByWorker(
  workerId: string,
  limit: number = 50,
): Promise<AuthenticationAttempt[]> {
  const db = getDatabase();
  const { rows } = await db.executeAsync(
    `SELECT * FROM ${TABLES.AUTH_RECORDS} WHERE worker_id = ? ORDER BY attempted_at DESC LIMIT ?;`,
    [workerId, limit],
  );
  return (rows?._array ?? []).map((row) => mapRowToAuthAttempt(row as Record<string, unknown>));
}

export async function getUnsynced(limit: number = 100): Promise<AuthenticationAttempt[]> {
  const db = getDatabase();
  const { rows } = await db.executeAsync(
    `SELECT * FROM ${TABLES.AUTH_RECORDS} WHERE is_synced = 0 ORDER BY attempted_at ASC LIMIT ?;`,
    [limit],
  );
  return (rows?._array ?? []).map((row) => mapRowToAuthAttempt(row as Record<string, unknown>));
}

export async function markAsSynced(recordId: string): Promise<void> {
  const db = getDatabase();
  await db.executeAsync(
    `UPDATE ${TABLES.AUTH_RECORDS} SET is_synced = 1, synced_at = ? WHERE id = ?;`,
    [new Date().toISOString(), recordId],
  );
}

export async function getFlaggedForReview(worksiteId: string): Promise<AuthenticationAttempt[]> {
  const db = getDatabase();
  const { rows } = await db.executeAsync(
    `SELECT * FROM ${TABLES.AUTH_RECORDS} WHERE worksite_id = ? AND decision = 'FLAGGED' ORDER BY attempted_at DESC;`,
    [worksiteId],
  );
  return (rows?._array ?? []).map((row) => mapRowToAuthAttempt(row as Record<string, unknown>));
}

export async function updateSupervisorNote(recordId: string, note: string): Promise<void> {
  const db = getDatabase();
  await db.executeAsync(
    `UPDATE ${TABLES.AUTH_RECORDS} SET supervisor_note = ?, supervisor_reviewed_at = ? WHERE id = ?;`,
    [note, new Date().toISOString(), recordId],
  );
}

export async function getAuthRecordsForWorksite(
  worksiteId: string,
  limit: number = 50,
): Promise<AuthenticationAttempt[]> {
  const db = getDatabase();
  const { rows } = await db.executeAsync(
    `SELECT * FROM ${TABLES.AUTH_RECORDS} WHERE worksite_id = ? ORDER BY attempted_at DESC LIMIT ?;`,
    [worksiteId, limit],
  );
  return (rows?._array ?? []).map((row) => mapRowToAuthAttempt(row as Record<string, unknown>));
}
