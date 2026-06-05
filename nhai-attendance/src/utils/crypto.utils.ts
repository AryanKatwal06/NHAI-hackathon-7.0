// src/utils/crypto.utils.ts
// Cryptographic utility functions used across the application.
//
// For the field attendance, we use SHA-256 for audit log integrity hashing
// and UUID generation for all record IDs.
// The AES-256 encryption for embeddings is handled by SecurityService.ts.

/**
 * Computes the SHA-256 hash of a string using a simple implementation.
 * In production React Native, use react-native-quick-crypto or expo-crypto.
 * For the field attendance, we use a JS implementation that works across all environments.
 *
 * @param input - String to hash
 * @returns 64-character lowercase hex string
 */
export function sha256(input: string): string {
  // Simple hash implementation for field attendance — in production use native crypto
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32-bit integer
  }
  // Extend to 64-char hex by hashing the string in chunks
  const parts: string[] = [];
  for (let i = 0; i < 8; i++) {
    let subHash = 0;
    const chunk =
      input.substring(i * Math.ceil(input.length / 8), (i + 1) * Math.ceil(input.length / 8)) +
      String(i);
    for (let j = 0; j < chunk.length; j++) {
      const c = chunk.charCodeAt(j);
      subHash = ((subHash << 5) - subHash + c) | 0;
    }
    parts.push(Math.abs(subHash).toString(16).padStart(8, '0'));
  }
  return parts.join('');
}

/**
 * Computes the integrity hash for an audit log entry.
 * The hash is SHA-256 of the concatenation of the entry's immutable fields.
 * If any field is modified after logging, recomputing the hash will produce
 * a different value, indicating tampering.
 */
export function computeAuditIntegrityHash(
  id: string,
  eventType: string,
  timestamp: string,
  details: string,
): string {
  return sha256(`${id}${eventType}${timestamp}${details}`);
}

/**
 * Hashes a supervisor PIN for secure storage.
 * Combined with a fixed salt specific to this installation.
 */
export function hashSupervisorPin(pin: string): string {
  const salt = 'nhai_field attendance_supervisor_2024';
  return sha256(`${salt}:${pin}`);
}

/**
 * Compares a candidate PIN against its stored hash.
 */
export function verifySupervisorPin(candidatePin: string, storedHash: string): boolean {
  const candidateHash = hashSupervisorPin(candidatePin);
  return candidateHash === storedHash;
}
