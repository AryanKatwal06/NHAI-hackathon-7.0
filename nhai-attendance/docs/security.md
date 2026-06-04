# Security Architecture: NHAI Hackathon Framework

## Threat Model & Mitigations

The NHAI offline attendance system operates in potentially hostile environments where field workers might attempt to subvert the attendance mechanism. The system mitigates these risks without requiring constant cloud verification.

| Threat                   | Attack Description                            | Detecting Signal    | Mitigation Strategy                                                                                   |
| ------------------------ | --------------------------------------------- | ------------------- | ----------------------------------------------------------------------------------------------------- |
| **Photo Spoofing**       | Attacker holds a photo of the enrolled worker | Liveness Score      | Randomized blink/smile/head-turn challenges ensure 3D dynamic movement.                               |
| **Screen Replay**        | Attacker plays a pre-recorded video           | Liveness Score      | EAR/MAR analysis of randomized challenges prevents static replay.                                     |
| **Proxy Attendance**     | Worker B logs in using Worker A's phone       | Device Trust Score  | Enrolled device fingerprint is hashed and checked; mismatches flag the attempt.                       |
| **GPS Spoofing**         | Attacker spoofs GPS on a rooted device        | Location Score      | Rooted devices result in low Device Trust. Location is merely one of 5 signals.                       |
| **Database Theft**       | Attacker steals the local SQLite database     | Database Encryption | Entire SQLite file is encrypted via SQLCipher AES-256; key is in Android Keystore/iOS Secure Enclave. |
| **Man-in-the-Middle**    | Attacker intercepts offline sync traffic      | Sync Encryption     | HTTPS mandatory + no biometric data synced (only aggregate scores are sent).                          |
| **Audit Tampering**      | Attacker modifies local audit logs            | Audit Integrity     | SHA-256 hashing per log entry detects manual modifications.                                           |
| **Signal Contradiction** | Perfect face match, but bad liveness          | Consensus Engine    | Contradictions automatically downgrade AUTHENTICATED to FLAGGED.                                      |

## Cryptographic Implementation

### Database Encryption at Rest

- **Engine:** SQLCipher
- **Algorithm:** AES-256-CBC
- **Key Generation:** A 256-bit cryptographically secure random key is generated on first launch.
- **Key Storage:** The key is stored in the device's hardware-backed keystore (Android Keystore System for Android 6+, Secure Enclave for iOS). It cannot be extracted by the OS or other apps.

### Embedding Encryption

- **Algorithm:** AES-256
- **Purpose:** Even if the database is decrypted, the raw face embeddings (Float32Arrays converted to base64) are individually encrypted before insertion.
- **Implementation:** `SecurityService.encryptEmbedding()` leverages React Native Keychain for cryptographic operations.

### Audit Log Integrity

- **Algorithm:** SHA-256
- **Purpose:** To prevent a malicious user with rooted access from silently modifying `auth_records` or `audit_logs` to simulate presence.
- **Formula:** `HASH = SHA-256(id + event_type + timestamp + details + PREVIOUS_HASH)` (chained integrity).

### Device Fingerprinting

- **Algorithm:** SHA-256
- **Purpose:** To verify that the device performing authentication is the same device that enrolled the worker.
- **Formula:** `Fingerprint = SHA-256(uniqueId || model || osVersion || brand)`
- **Privacy:** By storing only the hash, we avoid logging PII or trackable device parameters in plaintext.

## Zero Biometrics in Transit

A foundational security principle of this architecture is **Zero Biometrics in Transit**.

1. The face embedding is computed locally.
2. The comparison is done locally.
3. The raw image is immediately discarded from memory.
4. The offline sync payload contains ONLY the resulting `auth_record` (the final decision and the 5 signal scores: 88, 92, etc.).
5. Therefore, a network breach or Man-in-the-Middle attack cannot result in compromised biometric data.
