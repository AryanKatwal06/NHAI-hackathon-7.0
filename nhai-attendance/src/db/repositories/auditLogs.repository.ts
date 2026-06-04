import { getDatabase } from '../connection';
import { TABLES } from '@constants/storage.constants';
import { v4 as uuidv4 } from 'uuid';
import { generateHash } from '../../utils/hash.utils';
import type { AuditEventType, AuditLogEntry } from '@/types/audit.types';

export async function logEvent(
  eventType: AuditEventType,
  deviceId: string,
  details: object,
  workerId?: string,
  worksiteId?: string,
): Promise<void> {
  const db = getDatabase();
  const id = uuidv4();
  const timestamp = new Date().toISOString();
  const detailsJson = JSON.stringify(details);

  const hashInput = `${id}${eventType}${timestamp}${detailsJson}`;
  const integrityHash = generateHash(hashInput);

  await db.executeAsync(
    `INSERT INTO ${TABLES.AUDIT_LOGS} (id, event_type, worker_id, device_id, worksite_id, details, timestamp, integrity_hash)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      id,
      eventType,
      workerId ?? null,
      deviceId,
      worksiteId ?? null,
      detailsJson,
      timestamp,
      integrityHash,
    ],
  );
}

export async function getAuditLog(filters?: {
  eventType?: AuditEventType;
  workerId?: string;
  limit?: number;
}): Promise<AuditLogEntry[]> {
  const db = getDatabase();
  let query = `SELECT * FROM ${TABLES.AUDIT_LOGS} WHERE 1=1`;
  const params: unknown[] = [];

  if (filters?.eventType) {
    query += ' AND event_type = ?';
    params.push(filters.eventType);
  }
  if (filters?.workerId) {
    query += ' AND worker_id = ?';
    params.push(filters.workerId);
  }

  query += ' ORDER BY timestamp DESC';
  if (filters?.limit) {
    query += ' LIMIT ?';
    params.push(filters.limit);
  }

  const { rows } = await db.executeAsync(query, params);
  return (rows?._array ?? []).map((row) => {
    const r = row as Record<string, unknown>;
    return {
      id: r.id as string,
      eventType: r.event_type as AuditEventType,
      workerId: r.worker_id as string | undefined,
      deviceId: r.device_id as string,
      worksiteId: r.worksite_id as string | undefined,
      details: JSON.parse(r.details as string),
      timestamp: r.timestamp as string,
      integrityHash: r.integrity_hash as string,
    };
  });
}

export async function verifyIntegrity(entryId: string): Promise<boolean> {
  const db = getDatabase();
  const { rows } = await db.executeAsync(`SELECT * FROM ${TABLES.AUDIT_LOGS} WHERE id = ?;`, [
    entryId,
  ]);
  if (!rows?._array || rows._array.length === 0) {
    return false;
  }

  const r = rows._array[0] as Record<string, unknown>;
  const hashInput = `${r.id}${r.event_type}${r.timestamp}${r.details}`;
  const computedHash = generateHash(hashInput);

  return computedHash === r.integrity_hash;
}

export async function verifyAllIntegrity(): Promise<{
  totalChecked: number;
  tampered: number;
  tamperedIds: string[];
}> {
  const db = getDatabase();
  const { rows } = await db.executeAsync(
    `SELECT id, event_type, timestamp, details, integrity_hash FROM ${TABLES.AUDIT_LOGS};`,
  );
  const logs = rows?._array ?? [];

  const tamperedIds: string[] = [];
  for (const log of logs) {
    const r = log as Record<string, unknown>;
    const hashInput = `${r.id}${r.event_type}${r.timestamp}${r.details}`;
    const computedHash = generateHash(hashInput);
    if (computedHash !== r.integrity_hash) {
      tamperedIds.push(r.id as string);
    }
  }

  return {
    totalChecked: logs.length,
    tampered: tamperedIds.length,
    tamperedIds,
  };
}
