import { getDatabase } from '../connection';
import { TABLES } from '@constants/storage.constants';
import { v4 as uuidv4 } from 'uuid';
import type { SyncPayload, SyncQueueItem } from '@/types/sync.types';

export async function enqueue(recordId: string, payload: SyncPayload): Promise<void> {
  const db = getDatabase();
  await db.executeAsync(
    `INSERT INTO ${TABLES.SYNC_QUEUE} (id, record_type, record_id, payload, status, attempts, created_at)
     VALUES (?, ?, ?, ?, ?, 0, ?);`,
    [
      uuidv4(),
      'AUTH_ATTEMPT',
      recordId,
      JSON.stringify(payload),
      'PENDING',
      new Date().toISOString(),
    ],
  );
}

export async function getPending(limit: number = 50): Promise<SyncQueueItem[]> {
  const db = getDatabase();
  const { rows } = await db.executeAsync(
    `SELECT * FROM ${TABLES.SYNC_QUEUE} WHERE status IN ('PENDING', 'FAILED') AND attempts < 3 ORDER BY created_at ASC LIMIT ?;`,
    [limit],
  );
  return (rows?._array ?? []).map((row) => {
    const r = row as Record<string, unknown>;
    return {
      id: r.id as string,
      recordType: r.record_type as 'AUTH_ATTEMPT',
      recordId: r.record_id as string,
      payload: JSON.parse(r.payload as string),
      status: r.status as 'PENDING' | 'IN_PROGRESS' | 'SYNCED' | 'FAILED' | 'ABANDONED',
      attempts: r.attempts as number,
      createdAt: r.created_at as string,
      lastAttemptAt: r.last_attempt_at as string | undefined,
      lastError: r.last_error as string | undefined,
      syncedAt: r.synced_at as string | undefined,
    };
  });
}

export async function markInProgress(itemId: string): Promise<void> {
  const db = getDatabase();
  await db.executeAsync(
    `UPDATE ${TABLES.SYNC_QUEUE} SET status = 'IN_PROGRESS', last_attempt_at = ? WHERE id = ?;`,
    [new Date().toISOString(), itemId],
  );
}

export async function markSynced(itemId: string): Promise<void> {
  const db = getDatabase();
  await db.executeAsync(
    `UPDATE ${TABLES.SYNC_QUEUE} SET status = 'SYNCED', synced_at = ? WHERE id = ?;`,
    [new Date().toISOString(), itemId],
  );
}

export async function markFailed(itemId: string, error: string): Promise<void> {
  const db = getDatabase();
  await db.executeAsync(
    `UPDATE ${TABLES.SYNC_QUEUE} SET status = 'FAILED', attempts = attempts + 1, last_error = ? WHERE id = ?;`,
    [error, itemId],
  );
}

export async function abandonExhausted(): Promise<number> {
  const db = getDatabase();
  const { rowsAffected } = await db.executeAsync(
    `UPDATE ${TABLES.SYNC_QUEUE} SET status = 'ABANDONED' WHERE status = 'FAILED' AND attempts >= 3;`,
  );
  return rowsAffected ?? 0;
}

export async function purgeSynced(): Promise<number> {
  const db = getDatabase();
  const { rowsAffected } = await db.executeAsync(
    `DELETE FROM ${TABLES.SYNC_QUEUE} WHERE status = 'SYNCED';`,
  );
  return rowsAffected ?? 0;
}
