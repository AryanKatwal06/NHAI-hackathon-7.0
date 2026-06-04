import { open, QuickSQLiteConnection } from 'react-native-quick-sqlite';
import Keychain from 'react-native-keychain';
import { DB_NAME, KEYCHAIN_KEYS } from '@constants/storage.constants';

let dbConnection: QuickSQLiteConnection | null = null;

/**
 * Retrieves or generates the database encryption key.
 *
 * On first launch: generates a 256-bit random key, stores it in the secure keychain.
 * On subsequent launches: retrieves the stored key.
 *
 * The key is base64-encoded for storage in the keychain.
 *
 * @returns The 32-byte AES-256 key as a hex string (64 characters)
 */
async function getOrCreateEncryptionKey(): Promise<string> {
  const existingCredentials = await Keychain.getGenericPassword({
    service: KEYCHAIN_KEYS.DB_ENCRYPTION_KEY,
  });

  if (existingCredentials !== false) {
    return existingCredentials.password;
  }

  // Generate a new 256-bit random key
  // In React Native/Hermes, we use a combination of crypto.getRandomValues
  // to generate cryptographically secure random bytes
  const randomBytes = new Uint8Array(32);
  // Hermes exposes crypto.getRandomValues as a global
  (globalThis as any).crypto?.getRandomValues(randomBytes);

  // Convert to hex string (SQLCipher expects hex key for PRAGMA key)
  const hexKey = Array.from(randomBytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

  // Store in secure keychain (Android Keystore / iOS Secure Enclave)
  await Keychain.setGenericPassword('nhai_db_key', hexKey, {
    service: KEYCHAIN_KEYS.DB_ENCRYPTION_KEY,
    // Android: store in hardware-backed Android Keystore
    // iOS: store in Secure Enclave (hardware-backed on A7+ devices)
    accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE,
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });

  return hexKey;
}

/**
 * Opens and initializes the SQLite database connection.
 *
 * This function is idempotent — calling it multiple times returns the same connection.
 * It must be called once at app startup before any repository operations.
 *
 * Sequence:
 * 1. Retrieve encryption key from secure keychain (generates new key on first launch)
 * 2. Open SQLite database with SQLCipher encryption
 * 3. Run schema migrations if needed
 * 4. Enable WAL (Write-Ahead Logging) mode for better concurrent read performance
 */
export async function openDatabase(): Promise<QuickSQLiteConnection> {
  if (dbConnection !== null) {
    return dbConnection;
  }

  const encryptionKey = await getOrCreateEncryptionKey();

  // Open with SQLCipher encryption
  dbConnection = open({
    name: DB_NAME,
    encryptionKey, // SQLCipher AES-256 encryption key
  } as any);

  // Enable WAL mode for better performance
  // WAL allows concurrent reads while a write is in progress
  await dbConnection.executeAsync('PRAGMA journal_mode=WAL;');

  // Set page size for better performance with binary data (embeddings)
  await dbConnection.executeAsync('PRAGMA page_size=4096;');

  // Enable foreign key constraints
  await dbConnection.executeAsync('PRAGMA foreign_keys=ON;');

  // Run migrations
  await runMigrations(dbConnection);

  return dbConnection;
}

/**
 * Returns the active database connection.
 * Throws if openDatabase() has not been called.
 */
export function getDatabase(): QuickSQLiteConnection {
  if (dbConnection === null) {
    throw new Error(
      'Database connection not initialized. Call openDatabase() at app startup before using repositories.',
    );
  }
  return dbConnection;
}

/**
 * Closes the database connection and clears the cached instance.
 * Call this when the app goes to background to release native resources.
 */
export function closeDatabase(): void {
  if (dbConnection !== null) {
    dbConnection.close();
    dbConnection = null;
  }
}

/**
 * Runs all pending database migrations in order.
 * Uses a simple version table to track which migrations have been applied.
 */
async function runMigrations(db: QuickSQLiteConnection): Promise<void> {
  // Create migrations tracking table if it doesn't exist
  await db.executeAsync(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL
    );
  `);

  const { rows } = await db.executeAsync(
    'SELECT MAX(version) as current_version FROM schema_migrations;',
  );
  const currentVersion =
    (rows?._array?.[0] as { current_version: number | null } | undefined)?.current_version ?? 0;

  if (currentVersion < 1) {
    await applyMigrationV1(db);
    await db.executeAsync('INSERT INTO schema_migrations (version, applied_at) VALUES (1, ?);', [
      new Date().toISOString(),
    ]);
  }
  // Future migrations: if (currentVersion < 2) { await applyMigrationV2(db); ... }
}

async function applyMigrationV1(db: QuickSQLiteConnection): Promise<void> {
  const { v1Initial } = await import('./migrations/v1_initial');
  for (const statement of v1Initial) {
    await db.executeAsync(statement);
  }
}
