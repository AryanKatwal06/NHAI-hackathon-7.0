import { generateHash } from '../utils/hash.utils';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '@db/connection';
import { TABLES } from '@constants/storage.constants';
import type { AuditEventType } from '@/types/audit.types';

/**
 * Logs a significant system event with a tamper-detection hash.
 *
 * The integrity hash is generated from (id || eventType || timestamp || details).
 * Any modification to these fields after logging will produce a hash mismatch
 * that can be detected by verifyAuditIntegrity().
 */
export async function logEvent(
  eventType: AuditEventType,
  deviceId: string,
  details: object,
  workerId?: string,
  worksiteId?: string,
): Promise<void> {
  const id = uuidv4();
  const timestamp = new Date().toISOString();
  const detailsJson = JSON.stringify(details);


  const hashInput = `${id}${eventType}${timestamp}${detailsJson}`;
  const integrityHash = generateHash(hashInput);

  const db = getDatabase();
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
