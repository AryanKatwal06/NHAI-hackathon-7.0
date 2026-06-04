export const v1Initial: string[] = [
  // ─── WORKERS TABLE ──────────────────────────────────────────────────────────
  // Stores enrolled worker profiles.
  // One row per worker. Face embeddings are stored in the separate
  // face_embeddings column (encrypted) to allow updates without touching the
  // rest of the worker record.
  `CREATE TABLE IF NOT EXISTS workers (
    id                  TEXT PRIMARY KEY NOT NULL,
    employee_id         TEXT NOT NULL UNIQUE,
    name                TEXT NOT NULL,
    designation         TEXT NOT NULL,
    phone_number        TEXT,
    worksite_id         TEXT NOT NULL,
    is_active           INTEGER NOT NULL DEFAULT 1,
    face_embedding      TEXT,
    embedding_version   TEXT,
    enrollment_device_id TEXT,
    enrolled_at         TEXT NOT NULL,
    updated_at          TEXT NOT NULL
  );`,

  'CREATE INDEX IF NOT EXISTS idx_workers_employee_id ON workers(employee_id);',
  'CREATE INDEX IF NOT EXISTS idx_workers_worksite    ON workers(worksite_id, is_active);',

  // ─── AUTH_RECORDS TABLE ──────────────────────────────────────────────────────
  // Records every authentication attempt — successful or not.
  // This is the primary audit trail for attendance.
  // Individual signal scores are stored as separate columns for queryability —
  // a supervisor can filter "show all flagged attempts where device_trust < 30".
  `CREATE TABLE IF NOT EXISTS auth_records (
    id                  TEXT PRIMARY KEY NOT NULL,
    worker_id           TEXT NOT NULL,
    worksite_id         TEXT NOT NULL,
    device_id           TEXT NOT NULL,
    decision            TEXT NOT NULL CHECK(decision IN ('AUTHENTICATED','FLAGGED','REJECTED')),
    trust_score         INTEGER NOT NULL CHECK(trust_score >= 0 AND trust_score <= 100),
    face_match_score    INTEGER NOT NULL CHECK(face_match_score >= 0 AND face_match_score <= 100),
    liveness_score      INTEGER NOT NULL CHECK(liveness_score >= 0 AND liveness_score <= 100),
    device_trust_score  INTEGER NOT NULL CHECK(device_trust_score >= 0 AND device_trust_score <= 100),
    behavioral_score    INTEGER NOT NULL CHECK(behavioral_score >= 0 AND behavioral_score <= 100),
    location_score      INTEGER NOT NULL CHECK(location_score >= 0 AND location_score <= 100),
    is_contradiction    INTEGER NOT NULL DEFAULT 0,
    contradiction_details TEXT,
    gps_latitude        REAL,
    gps_longitude       REAL,
    gps_accuracy        REAL,
    primary_reason      TEXT,
    attempted_at        TEXT NOT NULL,
    is_synced           INTEGER NOT NULL DEFAULT 0,
    synced_at           TEXT,
    supervisor_note     TEXT,
    supervisor_reviewed_at TEXT,
    FOREIGN KEY (worker_id) REFERENCES workers(id)
  );`,

  'CREATE INDEX IF NOT EXISTS idx_auth_worker_time  ON auth_records(worker_id, attempted_at DESC);',
  'CREATE INDEX IF NOT EXISTS idx_auth_decision     ON auth_records(decision, attempted_at DESC);',
  'CREATE INDEX IF NOT EXISTS idx_auth_unsynced     ON auth_records(is_synced) WHERE is_synced = 0;',
  'CREATE INDEX IF NOT EXISTS idx_auth_worksite     ON auth_records(worksite_id, attempted_at DESC);',

  // ─── DEVICES TABLE ───────────────────────────────────────────────────────────
  // Tracks registered devices for device trust scoring.
  // device_fingerprint is a SHA-256 hash — never the raw hardware identifier.
  `CREATE TABLE IF NOT EXISTS devices (
    id                  TEXT PRIMARY KEY NOT NULL,
    worker_id           TEXT NOT NULL,
    device_fingerprint  TEXT NOT NULL,
    device_model        TEXT NOT NULL,
    os_version          TEXT NOT NULL,
    is_primary          INTEGER NOT NULL DEFAULT 0,
    registered_at       TEXT NOT NULL,
    last_used_at        TEXT,
    FOREIGN KEY (worker_id) REFERENCES workers(id)
  );`,

  'CREATE INDEX IF NOT EXISTS idx_devices_worker      ON devices(worker_id);',
  'CREATE INDEX IF NOT EXISTS idx_devices_fingerprint ON devices(device_fingerprint);',
  'CREATE UNIQUE INDEX IF NOT EXISTS idx_devices_worker_fp ON devices(worker_id, device_fingerprint);',

  // ─── BEHAVIOR_HISTORY TABLE ──────────────────────────────────────────────────
  // Stores the last N successful authentication timestamps per worker.
  // Used by BehavioralService to compute the typical login time.
  // Limited to 30 records per worker (enforced by BehavioralRepository) to prevent unbounded growth.
  `CREATE TABLE IF NOT EXISTS behavior_history (
    id              TEXT PRIMARY KEY NOT NULL,
    worker_id       TEXT NOT NULL,
    login_timestamp TEXT NOT NULL,
    was_successful  INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (worker_id) REFERENCES workers(id)
  );`,

  'CREATE INDEX IF NOT EXISTS idx_behavior_worker_time ON behavior_history(worker_id, login_timestamp DESC);',

  // ─── AUDIT_LOGS TABLE ────────────────────────────────────────────────────────
  // Complete tamper-evident audit trail for all significant system events.
  // integrity_hash is SHA-256(id || event_type || timestamp || details).
  // A changed hash indicates that the log entry was tampered with after recording.
  `CREATE TABLE IF NOT EXISTS audit_logs (
    id              TEXT PRIMARY KEY NOT NULL,
    event_type      TEXT NOT NULL,
    worker_id       TEXT,
    device_id       TEXT NOT NULL,
    worksite_id     TEXT,
    details         TEXT NOT NULL,
    timestamp       TEXT NOT NULL,
    integrity_hash  TEXT NOT NULL
  );`,

  'CREATE INDEX IF NOT EXISTS idx_audit_timestamp  ON audit_logs(timestamp DESC);',
  'CREATE INDEX IF NOT EXISTS idx_audit_event_type ON audit_logs(event_type, timestamp DESC);',
  'CREATE INDEX IF NOT EXISTS idx_audit_worker     ON audit_logs(worker_id, timestamp DESC) WHERE worker_id IS NOT NULL;',

  // ─── SYNC_QUEUE TABLE ────────────────────────────────────────────────────────
  // Tracks which records are pending upload to AWS.
  // payload is the JSON-serialized SyncPayload — the sanitized, non-biometric
  // version of the auth record that is safe to transmit to the server.
  // The sync queue is separate from auth_records so that purging synced queue entries
  // does not delete the local attendance history.
  `CREATE TABLE IF NOT EXISTS sync_queue (
    id              TEXT PRIMARY KEY NOT NULL,
    record_type     TEXT NOT NULL DEFAULT 'AUTH_ATTEMPT',
    record_id       TEXT NOT NULL,
    payload         TEXT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING','IN_PROGRESS','SYNCED','FAILED','ABANDONED')),
    attempts        INTEGER NOT NULL DEFAULT 0,
    created_at      TEXT NOT NULL,
    last_attempt_at TEXT,
    last_error      TEXT,
    synced_at       TEXT
  );`,

  'CREATE INDEX IF NOT EXISTS idx_sync_status    ON sync_queue(status, created_at ASC);',
  'CREATE INDEX IF NOT EXISTS idx_sync_record_id ON sync_queue(record_id);',

  // ─── WORKSITE_CONFIG TABLE ───────────────────────────────────────────────────
  // Stores worksite configuration for offline use.
  // Populated during initial app setup or synced from server.
  `CREATE TABLE IF NOT EXISTS worksite_config (
    id              TEXT PRIMARY KEY NOT NULL,
    name            TEXT NOT NULL,
    latitude        REAL NOT NULL,
    longitude       REAL NOT NULL,
    radius_meters   REAL NOT NULL DEFAULT 100,
    shift_start_hour REAL NOT NULL DEFAULT 8.0,
    is_active       INTEGER NOT NULL DEFAULT 1,
    created_at      TEXT NOT NULL,
    updated_at      TEXT NOT NULL
  );`,
];
