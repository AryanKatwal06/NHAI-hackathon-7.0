# API Documentation: NHAI Hackathon Sync Service

The NHAI Hackathon framework includes an optional AWS serverless backend designed to receive offline authentication records when the mobile device regains network connectivity.

> **Note:** For the hackathon demonstration, the app runs in `MockSyncService` mode by default, simulating these API calls locally to prove the offline-first sync-and-purge lifecycle without network dependency.

## 1. POST `/sync`

**Purpose:** Receives a batch of authentication sync payloads from the mobile app.
**Authentication:** None (The endpoint is secured by AWS API Gateway and accepts only payloads structured correctly from the app).
**Content-Type:** `application/json`

### Request Body

```json
{
  "records": [
    {
      "authAttemptId": "uuid-string", // Required: Unique ID of the attempt
      "workerId": "uuid-string", // Required: Worker who attempted
      "worksiteId": "uuid-string", // Required: Location of attempt
      "deviceId": "sha256-hash-string", // Required: Hashed device identifier
      "trustScore": 85, // Required: Final score 0-100
      "decision": "AUTHENTICATED", // Required: AUTHENTICATED|FLAGGED|REJECTED
      "attemptedAt": "2026-06-04T08:30:00Z", // Required: ISO 8601 Timestamp
      "faceMatchScore": 88, // Optional: 0-100
      "livenessScore": 100, // Optional: 0-100
      "deviceTrustScore": 100, // Optional: 0-100
      "behavioralScore": 92, // Optional: 0-100
      "locationScore": 100, // Optional: 0-100
      "gpsLatitude": 28.6139, // Optional: Float
      "gpsLongitude": 77.209, // Optional: Float
      "isContradiction": false // Optional: Boolean
    }
  ],
  "appVersion": "1.0.0" // Optional
}
```

### Responses

**200 OK**

```json
{
  "success": true,
  "syncedIds": ["uuid-1", "uuid-2"],
  "failedIds": [],
  "syncedCount": 2,
  "failedCount": 0
}
```

**400 Bad Request**
Invalid payload structure.

**500 Internal Server Error**
DynamoDB write failed (the mobile app's `SyncQueue` will automatically retry with exponential backoff).

> **SECURITY NOTE:** Any payload containing fields named `faceEmbedding`, `embeddingData`, `faceImage`, `facePixels`, `rawBiometric`, `photoData`, or `imageBuffer` is automatically rejected with a 400. The server rigidly enforces **zero-biometrics-in-transit**.

---

## 2. GET `/status`

**Purpose:** Health check — confirms the API is reachable before the mobile app attempts a sync.
**Authentication:** None

### Response

**200 OK**

```json
{
  "status": "OK",
  "service": "NHAI Hackathon Sync API",
  "timestamp": "2026-06-04T08:30:00Z",
  "version": "1.0.0"
}
```

---

## 3. GET `/attendance`

**Purpose:** Query attendance records for a specific worksite. This is designed for future integration with the centralized NHAI Supervisor Dashboard.
**Authentication:** Requires API Key or IAM authorization (depending on deployment).

### Parameters

- `worksiteId` (string, required) — Worksite UUID
- `fromDate` (ISO 8601 string, optional) — Default: 24 hours ago
- `toDate` (ISO 8601 string, optional) — Default: now

### Response

**200 OK**

```json
{
  "records": [
    {
      "authAttemptId": "...",
      "workerId": "...",
      "decision": "AUTHENTICATED",
      "trustScore": 85,
      "attemptedAt": "2026-06-04T08:30:00Z"
    }
  ],
  "count": 25
}
```
