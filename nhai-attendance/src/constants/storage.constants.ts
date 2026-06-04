// storage.constants.ts
// Constants for the database layer and local storage.
// Defines database name, table names, key names, and retention policies.

import Config from 'react-native-config';

// ─── DATABASE ─────────────────────────────────────────────────────────────────
// SQLite database filename. Stored in the app's private documents directory.
export const DB_NAME = Config.DB_NAME ?? 'nhai_hackathon.db';

// Database version — used by the migration system to determine which
// migrations need to run. Increment when adding new migrations.
export const DB_VERSION = 1;

// ─── TABLE NAMES ──────────────────────────────────────────────────────────────
// All table names as constants to prevent typos and enable refactoring.
export const TABLES = {
  WORKERS: 'workers',
  AUTH_RECORDS: 'auth_records',
  DEVICES: 'devices',
  BEHAVIOR_HISTORY: 'behavior_history',
  AUDIT_LOGS: 'audit_logs',
  SYNC_QUEUE: 'sync_queue',
  MIGRATIONS: '_migrations',
  ENROLLMENT_PHOTOS: 'enrollment_photos',
} as const;

// ─── KEYCHAIN KEYS ────────────────────────────────────────────────────────────
// Keys used with react-native-keychain for secure storage.
// These store encryption keys and sensitive credentials.
export const KEYCHAIN_KEYS = {
  DB_ENCRYPTION_KEY: 'nhai.db.encryption.key',
  SESSION_TOKEN: 'nhai.session.token',
  DEVICE_FINGERPRINT: 'nhai.device.fingerprint',
  FACE_EMBEDDING_KEY: 'nhai.face.embedding.key',
} as const;

// ─── ENCRYPTED STORAGE KEYS ──────────────────────────────────────────────────
// Keys used with react-native-encrypted-storage for AES-256 encrypted preferences.
export const ENCRYPTED_STORAGE_KEYS = {
  SUPERVISOR_CREDENTIALS: 'nhai.supervisor.credentials',
  WORKSITE_CONFIG: 'nhai.worksite.config',
  LAST_SYNC_TIMESTAMP: 'nhai.sync.last_timestamp',
} as const;

// ─── RETENTION POLICIES ──────────────────────────────────────────────────────
// How long local data is retained before purge.
export const RETENTION = {
  // Synced records are purged after this many hours
  SYNCED_RECORD_TTL_HOURS: 24,
  // Audit logs are retained locally for this many days before sync+purge
  AUDIT_LOG_TTL_DAYS: 30,
  // Maximum number of auth records to keep locally (oldest purged first)
  MAX_LOCAL_AUTH_RECORDS: 10000,
} as const;
