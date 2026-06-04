import { getDatabase } from '../connection';
import { TABLES } from '@constants/storage.constants';

export async function registerDevice(deviceId: string, deviceInfo: string): Promise<void> {
  const db = getDatabase();
  await db.executeAsync(
    `INSERT OR REPLACE INTO ${TABLES.DEVICES} (id, worker_id, device_fingerprint, device_model, os_version, registered_at, is_primary) VALUES (?, ?, ?, ?, ?, ?, 1);`,
    [deviceId, 'temp_worker', deviceId, deviceInfo, 'unknown', new Date().toISOString()],
  );
}

export async function getDevice(deviceId: string) {
  const db = getDatabase();
  const { rows } = await db.executeAsync(
    `SELECT * FROM ${TABLES.DEVICES} WHERE device_fingerprint = ?;`,
    [deviceId],
  );
  return rows?._array?.[0] ?? null;
}
