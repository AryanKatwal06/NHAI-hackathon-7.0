# Database Schema: NHAI Hackathon Framework

## Overview

The NHAI Hackathon framework uses a local, encrypted SQLite database (SQLCipher AES-256) to ensure total offline functionality while rigorously protecting biometric and personal data.

The schema is composed of 8 tables. Data flows from enrollment (`workers`) through to authentication (`auth_records`, `behavior_history`, `audit_logs`). Offline synchronization is managed via the `sync_queue` table, which queues records for AWS transmission. The entire database is encrypted using a 256-bit key securely stored in the Android Keystore / iOS Secure Enclave.

## Complete Table Schemas

### 1. `workers`

Stores enrolled field personnel profiles and their encrypted face embeddings.

- **id** (TEXT, PRIMARY KEY): UUIDv4
- **employee_id** (TEXT, UNIQUE): HR system identifier
- **name** (TEXT, NOT NULL): Worker's full name
- **designation** (TEXT): Worker's job title
- **phone_number** (TEXT): Contact number
- **worksite_id** (TEXT, NOT NULL): Current assigned worksite
- **face_embedding** (TEXT): AES-256 encrypted base64 embedding
- **embedding_version** (TEXT): Model version identifier
- **enrollment_device_id** (TEXT): Device used for enrollment
- **is_active** (INTEGER): 1 = active, 0 = inactive
- **enrolled_at** (TEXT): ISO-8601 timestamp
- **updated_at** (TEXT): ISO-8601 timestamp

_Example row:_
| id | employee_id | name | designation | worksite_id | is_active | face_embedding |
|----|-------------|------|-------------|-------------|-----------|----------------|
| `uuid-1` | `EMP001` | `Raj Kumar` | `Foreman` | `site-a` | `1` | `U2Fsd...` |

### 2. `auth_records`

Maintains the complete authentication attempt history including all 5 signal scores.

- **id** (TEXT, PRIMARY KEY): UUIDv4
- **worker_id** (TEXT, NOT NULL): Foreign key to workers(id)
- **worksite_id** (TEXT, NOT NULL): Location of attempt
- **device_id** (TEXT, NOT NULL): Device executing the attempt
- **face_match_score** (REAL): 0-100 similarity
- **liveness_score** (REAL): 0-100 challenge success
- **device_trust_score** (REAL): 0-100 fingerprint match
- **behavioral_score** (REAL): 0-100 cadence alignment
- **location_score** (REAL): 0-100 geofence match
- **final_trust_score** (REAL): 0-100 weighted consensus
- **decision** (TEXT): AUTHENTICATED, FLAGGED, or REJECTED
- **is_synced** (INTEGER): 1 = synced, 0 = pending
- **attempted_at** (TEXT): ISO-8601 timestamp
- **synced_at** (TEXT): ISO-8601 timestamp (nullable)

_Example row:_
| id | worker_id | face_match_score | decision | is_synced |
|----|-----------|------------------|----------|-----------|
| `uuid-2` | `uuid-1` | `89.5` | `AUTHENTICATED` | `0` |

### 3. `devices`

Registers device fingerprints for calculating device trust.

- **id** (TEXT, PRIMARY KEY): UUIDv4
- **device_fingerprint** (TEXT, UNIQUE): SHA-256 hash of device hardware info
- **registered_at** (TEXT): ISO-8601 timestamp
- **last_seen_at** (TEXT): ISO-8601 timestamp
- **is_trusted** (INTEGER): 1 = trusted, 0 = revoked

_Example row:_
| id | device_fingerprint | is_trusted |
|----|--------------------|------------|
| `uuid-3` | `a3b2c1...` | `1` |

### 4. `behavior_history`

Tracks login time history for behavioral cadence analysis. Capped at 30 records per worker.

- **id** (TEXT, PRIMARY KEY): UUIDv4
- **worker_id** (TEXT, NOT NULL): Foreign key to workers(id)
- **timestamp** (TEXT, NOT NULL): ISO-8601 login time
- **was_successful** (INTEGER): 1 = yes, 0 = no

_Example row:_
| id | worker_id | timestamp | was_successful |
|----|-----------|-----------|----------------|
| `uuid-4` | `uuid-1` | `2026-06-04T08:00:00Z` | `1` |

### 5. `audit_logs`

A tamper-evident event log with SHA-256 integrity hashing.

- **id** (TEXT, PRIMARY KEY): UUIDv4
- **event_type** (TEXT, NOT NULL): e.g., ENROLLMENT, AUTH_ATTEMPT
- **entity_id** (TEXT): Related record ID
- **entity_type** (TEXT): Related record table
- **details** (TEXT): JSON payload
- **timestamp** (TEXT, NOT NULL): ISO-8601 timestamp
- **integrity_hash** (TEXT, NOT NULL): SHA-256 of (id + event_type + timestamp + details)

_Example row:_
| id | event_type | entity_type | integrity_hash |
|----|------------|-------------|----------------|
| `uuid-5` | `AUTH_ATTEMPT` | `auth_records` | `f8e7d...` |

### 6. `sync_queue`

Manages offline synchronization to AWS with exponential backoff.

- **id** (TEXT, PRIMARY KEY): UUIDv4
- **payload_type** (TEXT, NOT NULL): e.g., AUTH_RECORD
- **payload_data** (TEXT, NOT NULL): JSON serialized data
- **status** (TEXT, NOT NULL): PENDING, IN_FLIGHT, FAILED, DEAD_LETTER
- **retry_count** (INTEGER): Defaults to 0
- **next_retry_at** (TEXT): ISO-8601 timestamp
- **created_at** (TEXT): ISO-8601 timestamp
- **updated_at** (TEXT): ISO-8601 timestamp

_Example row:_
| id | payload_type | status | retry_count |
|----|--------------|--------|-------------|
| `uuid-6` | `AUTH_RECORD` | `PENDING` | `0` |

### 7. `worksite_config`

Stores the active worksite's geofence boundaries.

- **id** (TEXT, PRIMARY KEY): UUIDv4
- **name** (TEXT, NOT NULL): E.g., "NH-44 Section A"
- **latitude** (REAL, NOT NULL): GPS Lat
- **longitude** (REAL, NOT NULL): GPS Lng
- **radius_meters** (INTEGER, NOT NULL): Allowed geofence
- **updated_at** (TEXT): ISO-8601 timestamp

_Example row:_
| id | name | latitude | longitude | radius_meters |
|----|------|----------|-----------|---------------|
| `site-a` | `Delhi-Meerut` | `28.6139` | `77.2090` | `200` |

### 8. `schema_migrations`

Tracks applied database migrations to handle upgrades.

- **version** (INTEGER, PRIMARY KEY): Migration number
- **name** (TEXT, NOT NULL): Migration file name
- **applied_at** (TEXT, NOT NULL): ISO-8601 timestamp

_Example row:_
| version | name | applied_at |
|---------|------|------------|
| `1` | `v1_initial` | `2026-06-04T00:00:00Z` |

## Query Patterns

- **Pending Sync Records:** `SELECT * FROM sync_queue WHERE status = 'PENDING' OR (status = 'FAILED' AND next_retry_at <= ?)`
- **Worker Behavior History:** `SELECT * FROM behavior_history WHERE worker_id = ? ORDER BY timestamp DESC LIMIT 30`
- **Authentication Summary:** `SELECT decision, COUNT(*) as count FROM auth_records WHERE date(attempted_at) = date('now') GROUP BY decision`
- **Audit Integrity Verification:** Iterate through `audit_logs` and recompute the SHA-256 hash to detect manual tampering.

## Data Retention Policy

- **`behavior_history`:** Maximum 30 records per worker. Oldest deleted on insert via database triggers/repository logic.
- **`sync_queue`:** Records purged immediately upon successful transmission. Failed records kept for 30 days before moving to DEAD_LETTER or deletion.
- **`audit_logs`:** Kept indefinitely to ensure a persistent chain of custody.
- **`auth_records`:** Local copies marked `is_synced = 1` are periodically purged after 90 days to free space.
