import { getDatabase } from '../connection';
import { TABLES } from '@constants/storage.constants';

export async function saveEnrollmentPhoto(workerId: string, photoPath: string): Promise<void> {
  const db = getDatabase();
  await db.executeAsync(
    `INSERT INTO ${TABLES.ENROLLMENT_PHOTOS} (id, worker_id, photo_path, created_at) VALUES (?, ?, ?, ?);`,
    [`photo_${Date.now()}`, workerId, photoPath, new Date().toISOString()],
  );
}

export async function getEnrollmentPhotos(workerId: string) {
  const db = getDatabase();
  const { rows } = await db.executeAsync(
    `SELECT * FROM ${TABLES.ENROLLMENT_PHOTOS} WHERE worker_id = ? ORDER BY created_at DESC;`,
    [workerId],
  );
  return rows?._array ?? [];
}
