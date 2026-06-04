import { getDatabase } from '../connection';
import { TABLES } from '@constants/storage.constants';
import { v4 as uuidv4 } from 'uuid';
import type { RegisteredDevice } from '@/types/device.types';

export async function registerDevice(
  workerId: string,
  fingerprint: string,
  model: string,
  os: string,
  isPrimary: boolean,
): Promise<void> {
  const db = getDatabase();
  const now = new Date().toISOString();
  await db.executeAsync(
    `INSERT INTO ${TABLES.DEVICES} (id, worker_id, device_fingerprint, device_model, os_version, is_primary, registered_at, last_used_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(worker_id, device_fingerprint) DO UPDATE SET last_used_at = ?;`,
    [uuidv4(), workerId, fingerprint, model, os, isPrimary ? 1 : 0, now, now, now],
  );
}

export async function getDevicesForWorker(workerId: string): Promise<RegisteredDevice[]> {
  const db = getDatabase();
  const { rows } = await db.executeAsync(
    `SELECT * FROM ${TABLES.DEVICES} WHERE worker_id = ? ORDER BY registered_at DESC;`,
    [workerId],
  );
  return (rows?._array ?? []).map((row) => {
    const r = row as Record<string, unknown>;
    return {
      id: r.id as string,
      workerId: r.worker_id as string,
      deviceFingerprint: r.device_fingerprint as string,
      deviceModel: r.device_model as string,
      osVersion: r.os_version as string,
      registeredAt: r.registered_at as string,
      isPrimary: (r.is_primary as number) === 1,
      lastUsedAt: r.last_used_at as string | undefined,
    };
  });
}

export async function getDeviceFingerprintsForWorker(workerId: string): Promise<string[]> {
  const devices = await getDevicesForWorker(workerId);
  return devices.map((d) => d.deviceFingerprint);
}

export async function updateLastUsed(deviceId: string): Promise<void> {
  const db = getDatabase();
  await db.executeAsync(`UPDATE ${TABLES.DEVICES} SET last_used_at = ? WHERE id = ?;`, [
    new Date().toISOString(),
    deviceId,
  ]);
}
