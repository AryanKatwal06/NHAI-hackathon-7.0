import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../connection';
import type { Worker, WorkerEnrollmentInput, WorkerFaceEmbedding } from '@/types/worker.types';
import { TABLES } from '@constants/storage.constants';

/**
 * Called during the enrollment flow after the worker profile form is completed.
 *
 * @param input - Worker profile data from the enrollment form
 * @returns The created Worker object with generated ID and timestamps
 */
export async function createWorker(input: WorkerEnrollmentInput): Promise<Worker> {
  const db = getDatabase();
  const now = new Date().toISOString();
  const id = uuidv4();

  await db.executeAsync(
    `INSERT INTO ${TABLES.WORKERS} (
      id, employee_id, name, designation, phone_number, worksite_id,
      is_active, enrolled_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?);`,
    [
      id,
      input.employeeId,
      input.name,
      input.designation,
      input.phoneNumber ?? null,
      input.worksiteId,
      now,
      now,
    ],
  );

  return {
    id,
    isActive: true,
    enrolledAt: now,
    updatedAt: now,
    ...input,
  };
}

/**
 * The embedding is stored as an encrypted base64 string.
 * Called at the end of the face capture phase of enrollment.
 *
 * @param workerId - The worker's UUID
 * @param encryptedEmbedding - AES-256 encrypted, base64-encoded embedding
 * @param embeddingVersion - Model version identifier (e.g., "1.0.0-mobilefacenet-int8")
 */
export async function updateWorkerFaceEmbedding(
  workerId: string,
  encryptedEmbedding: string,
  embeddingVersion: string,
): Promise<void> {
  const db = getDatabase();
  const now = new Date().toISOString();

  await db.executeAsync(
    `UPDATE ${TABLES.WORKERS}
     SET face_embedding = ?, embedding_version = ?, updated_at = ?
     WHERE id = ?;`,
    [encryptedEmbedding, embeddingVersion, now, workerId],
  );
}

/**
 * Used during authentication to look up the worker attempting to check in.
 *
 * @param employeeId - The HR system employee identifier
 * @returns Worker object or null if not found
 */
export async function findWorkerByEmployeeId(employeeId: string): Promise<Worker | null> {
  const db = getDatabase();
  const result = await db.executeAsync(
    `SELECT * FROM ${TABLES.WORKERS} WHERE employee_id = ? AND is_active = 1;`,
    [employeeId],
  );

  const row = result.rows?._array?.[0] as Record<string, unknown> | undefined;
  if (!row) {
    return null;
  }

  return mapRowToWorker(row);
}

/**
 * Retrieves a worker's face embedding for verification.
 * Returns null if the worker has not completed face enrollment.
 *
 * @param workerId - The worker's UUID
 * @returns Encrypted embedding string or null
 */
export async function getWorkerFaceEmbedding(
  workerId: string,
): Promise<WorkerFaceEmbedding | null> {
  const db = getDatabase();
  const result = await db.executeAsync(
    `SELECT id, face_embedding, embedding_version, enrolled_at
     FROM ${TABLES.WORKERS}
     WHERE id = ? AND face_embedding IS NOT NULL;`,
    [workerId],
  );

  const row = result.rows?._array?.[0] as Record<string, unknown> | undefined;
  if (!row?.face_embedding) {
    return null;
  }

  return {
    workerId: row.id as string,
    embeddingData: row.face_embedding as string,
    embeddingVersion: row.embedding_version as string,
    captureCount: 5, // Fixed at ENROLLMENT_CAPTURE_COUNT
    createdAt: row.enrolled_at as string,
  };
}

/**
 * Used in the Supervisor Dashboard to display the worker list.
 */
export async function getWorkersByWorksite(worksiteId: string): Promise<Worker[]> {
  const db = getDatabase();
  const result = await db.executeAsync(
    `SELECT * FROM ${TABLES.WORKERS} WHERE worksite_id = ? AND is_active = 1 ORDER BY name ASC;`,
    [worksiteId],
  );

  return (result.rows?._array ?? []).map((row) => mapRowToWorker(row as Record<string, unknown>));
}

function mapRowToWorker(row: Record<string, unknown>): Worker {
  return {
    id: row.id as string,
    employeeId: row.employee_id as string,
    name: row.name as string,
    designation: row.designation as string,
    phoneNumber: row.phone_number as string | undefined,
    worksiteId: row.worksite_id as string,
    isActive: (row.is_active as number) === 1,
    enrolledDeviceId: row.enrollment_device_id as string | undefined,
    enrolledAt: row.enrolled_at as string,
    updatedAt: row.updated_at as string,
  };
}
