# System Architecture & Trust Engine

The NHAI Field Attendance System operates entirely offline via a multi-tiered architecture that separates biometric inference, cryptographic security, and signal processing.

## 1. Multi-Signal Trust Score Engine

Authentication is NOT a binary pass/fail based solely on facial recognition. It calculates a holistic Trust Score (0–100) using five independent weighted signals. This ensures high resilience against targeted spoofing attacks.

### Signal Weighting
The absolute contribution of each signal to the final score is strictly defined as follows:

| Signal | Weight | Description |
|--------|--------|-------------|
| **Face Match** | 40% | Cosine similarity between the live camera feed and encrypted enrollment embedding. |
| **Liveness** | 25% | Score derived from passing randomized, interactive anti-spoofing challenges (e.g., eye blink sequences). |
| **Device Trust** | 15% | Hardware fingerprinting to verify the worker is using an authorized or previously used device. |
| **Behavioral** | 10% | Circular statistical analysis of login times. Flags activity significantly deviating from the worker's historical norms. |
| **Location** | 10% | Haversine distance verification ensuring the login occurs within the worksite geofence. |

*Total Possible Score: 100*

### Decision Thresholds
- **`AUTHENTICATED` (Score >= 80)**: Complete confidence. The worker is marked present locally and synced to the cloud.
- **`FLAGGED` (Score >= 60 and < 80)**: Ambiguous confidence. The worker is allowed to proceed, but the record is flagged for supervisor review in the dashboard.
- **`REJECTED` (Score < 60)**: Low confidence. The authentication fails immediately and is logged as an unauthorized attempt.

## 2. Signal Consensus Engine

In advanced attack scenarios (such as GPS spoofing combined with stolen biometric data), individual signal thresholds might not catch the anomaly if the total score remains high. 

The **Signal Consensus Engine** runs *after* the initial score calculation to check for fundamental contradictions in the data.

### Exact Consensus Rules
A "Contradiction" is triggered when:
1. The **Face Match** signal is `HIGH_CONFIDENCE` (Score > 85).
2. **AND** at least **1** other signal is categorized as `LOW_TRUST` (Score < 30).

*Example Scenario:* A worker has a 95% Face Match and 100% Liveness, but is using an unrecognized device (Score: 20) and is outside the worksite (Score: 10). 
- *Weighted Score:* ~70.5 (Normally `FLAGGED`)
- *Consensus Rule Applied:* High Face Match + 2 Low Signals. The attempt is structurally contradictory (perfect biometrics, wrong place/device). 
- *Result:* If the score was initially high enough to be `AUTHENTICATED`, the Consensus Engine overrides and forcibly downgrades it to `FLAGGED` due to the detected contradiction.

## 3. Offline Sync Queue Mechanism

Since field locations frequently experience zero connectivity, the application is fundamentally "Offline-First". 

### Storage & Queueing
1. When an authentication is completed, the metadata is written to the local SQLite database (`auth_records` table) for immediate rendering on the Supervisor Dashboard.
2. Simultaneously, a data payload is generated and serialized into the `sync_queue` table. **Crucially, raw biometric data (images or embeddings) are NEVER included in the sync payload.** Only scalar scores and metadata are transmitted.
3. The queue record is marked with an `id`, `status` (`PENDING`), and `retry_count` (0).

### Synchronization Lifecycle
1. The `SyncService` monitors the device's `NetInfo` state. When internet connectivity is detected, it automatically invokes `triggerSync()`.
2. The service queries up to `SYNC_BATCH_SIZE` pending payloads and marks their status as `IN_PROGRESS`.
3. The batch is dispatched to the AWS backend via HTTPS (TLS 1.3).
4. **On Success:** 
   - The server acknowledges the received payloads.
   - The client marks the corresponding `sync_queue` items as `SYNCED` and updates the local `auth_records.is_synced` flag.
   - The `purgeSynced()` routine deletes completed payloads to free local storage.
5. **On Failure:**
   - The queue items are marked as `FAILED`.
   - The `retry_count` is incremented.
   - The payload will be re-attempted during the next connection window until a maximum retry threshold is reached (at which point it is flagged as `ABANDONED`).
