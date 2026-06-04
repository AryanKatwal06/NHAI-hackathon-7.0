import { getDatabase } from '../connection';
import { TABLES } from '@constants/storage.constants';
import { v4 as uuidv4 } from 'uuid';
import type { LoginHistoryEntry } from '@services/BehavioralService';

export async function recordLogin(
  workerId: string,
  timestamp: string,
  wasSuccessful: boolean,
): Promise<void> {
  const db = getDatabase();
  await db.executeAsync(
    `INSERT INTO ${TABLES.BEHAVIOR_HISTORY} (id, worker_id, login_timestamp, was_successful)
     VALUES (?, ?, ?, ?);`,
    [uuidv4(), workerId, timestamp, wasSuccessful ? 1 : 0],
  );

  await db.executeAsync(
    `DELETE FROM ${TABLES.BEHAVIOR_HISTORY} WHERE id NOT IN (
       SELECT id FROM ${TABLES.BEHAVIOR_HISTORY} WHERE worker_id = ? ORDER BY login_timestamp DESC LIMIT 30
     ) AND worker_id = ?;`,
    [workerId, workerId],
  );
}

export async function getLoginHistory(
  workerId: string,
  dayLimit?: number,
): Promise<LoginHistoryEntry[]> {
  const db = getDatabase();
  const { rows } = await db.executeAsync(
    `SELECT * FROM ${TABLES.BEHAVIOR_HISTORY} WHERE worker_id = ? ORDER BY login_timestamp DESC;`,
    [workerId],
  );

  let history = (rows?._array ?? []).map((row) => {
    const r = row as Record<string, unknown>;
    return {
      timestamp: r.login_timestamp as string,
      wasSuccessful: (r.was_successful as number) === 1,
    };
  });

  if (dayLimit) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - dayLimit);
    const cutoffIso = cutoff.toISOString();
    history = history.filter((h) => h.timestamp >= cutoffIso);
  }

  return history;
}
