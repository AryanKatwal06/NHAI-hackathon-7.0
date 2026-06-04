## Creates all remaining stub files for the NHAI Attendance scaffolding.
## Run from the nhai-attendance root directory.

$root = $PSScriptRoot | Split-Path -Parent

function MakeFile([string]$rel, [string]$content) {
    $full = Join-Path $root $rel
    $dir = Split-Path $full -Parent
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    [System.IO.File]::WriteAllText($full, $content, [System.Text.Encoding]::UTF8)
}

function TsStub([string]$rel, [string]$desc, [int]$phase) {
    $name = Split-Path $rel -Leaf
    MakeFile $rel "// $name`n// $desc`n// This file will be fully implemented in Phase $phase.`n// DO NOT implement any logic in this file during Phase 1.`n`nexport {};`n"
}

function TsxStub([string]$rel, [string]$comp, [string]$desc, [int]$phase) {
    $name = Split-Path $rel -Leaf
    MakeFile $rel "// $name`n// $desc`n// This file will be fully implemented in Phase $phase.`n// DO NOT implement any logic in this file during Phase 1.`n`nimport React from 'react';`nimport { View } from 'react-native';`n`nconst ${comp}: React.FC = () => {`n  return <View />;`n};`n`nexport default $comp;`n"
}

function StylesStub([string]$rel, [int]$phase) {
    $name = Split-Path $rel -Leaf
    MakeFile $rel "// $name`n// Styles for the associated component/screen.`n// This file will be fully implemented in Phase $phase.`n// DO NOT implement any logic in this file during Phase 1.`n`nimport { StyleSheet } from 'react-native';`n`nexport const styles = StyleSheet.create({});`n"
}

function IndexStub([string]$rel) {
    MakeFile $rel "// index.ts`n// Barrel export file. Re-exports will be added as implementations are completed.`n`nexport {};`n"
}

function Readme([string]$rel, [string]$title, [string]$body) {
    MakeFile $rel "# $title`n`n$body`n"
}

function Gitkeep([string]$rel) { MakeFile $rel "# placeholder`n" }

# ─── DB ────────────────────────────────────────────────────────────────────────
Readme "src\db\README.md" "Database" "This folder contains the SQLite database layer: connection initialization, schema definitions, migrations, and repository classes. The app uses react-native-quick-sqlite with optional SQLCipher encryption for on-device storage.`n`nImplemented in **Phase 2** (Database Schema & Encryption).`n`n**Rules:** All access through repositories. Migrations must be idempotent. Sensitive data encrypted."
IndexStub "src\db\index.ts"
TsStub "src\db\schema.ts" "All SQLite table CREATE statements for the attendance database." 2
TsStub "src\db\connection.ts" "SQLite database connection initialization and encryption setup." 2
Readme "src\db\migrations\README.md" "Migrations" "Versioned database migration scripts. Each exports up() and down(). Migrations auto-run on startup and are tracked in _migrations table.`n`nImplemented starting in **Phase 2**.`n`n**Rules:** Idempotent. Never modify released migrations. Pattern: v{N}_{description}.ts."
TsStub "src\db\migrations\v1_initial.ts" "Initial database schema migration creating all core tables." 2
Readme "src\db\repositories\README.md" "Repositories" "Data access objects for each database table. Repositories encapsulate SQL queries and expose typed async methods. No raw SQL in screens or services.`n`nImplemented in **Phase 2**.`n`n**Rules:** One table per repository. All methods async with typed results. No business logic."
IndexStub "src\db\repositories\index.ts"
TsStub "src\db\repositories\workers.repository.ts" "Data access for the workers table (enrolled personnel records)." 2
TsStub "src\db\repositories\authRecords.repository.ts" "Data access for authentication attempt records." 2
TsStub "src\db\repositories\devices.repository.ts" "Data access for registered device fingerprints." 2
TsStub "src\db\repositories\behaviorHistory.repository.ts" "Data access for behavioral pattern history (login times, patterns)." 2
TsStub "src\db\repositories\auditLogs.repository.ts" "Data access for the audit log table." 2
TsStub "src\db\repositories\syncQueue.repository.ts" "Data access for the sync queue (records pending upload to AWS)." 2

# ─── HOOKS ─────────────────────────────────────────────────────────────────────
Readme "src\hooks\README.md" "Hooks" "Custom React hooks bridging UI components and backend services/stores. Each hook focuses on a single concern.`n`nImplemented across multiple phases as underlying services are built.`n`n**Rules:** Follow Rules of Hooks. Compose from stores and services. Proper cleanup in useEffect returns."
IndexStub "src\hooks\index.ts"
TsStub "src\hooks\useCamera.ts" "Custom hook for camera permission handling and Vision Camera lifecycle." 3
TsStub "src\hooks\useLocation.ts" "Custom hook for GPS coordinate acquisition with timeout handling." 6
TsStub "src\hooks\useFaceRecognition.ts" "Custom hook orchestrating the face detection and embedding pipeline." 3
TsStub "src\hooks\useLiveness.ts" "Custom hook for liveness challenge orchestration and result tracking." 4
TsStub "src\hooks\useTrustScore.ts" "Custom hook for computing the Dynamic Trust Score from all signals." 5
TsStub "src\hooks\useSync.ts" "Custom hook for triggering and monitoring AWS sync operations." 7
TsStub "src\hooks\useNetworkState.ts" "Custom hook for detecting online/offline connectivity state." 7
TsStub "src\hooks\useAuditLog.ts" "Custom hook for writing audit log entries from UI events." 8

# ─── ML ────────────────────────────────────────────────────────────────────────
Readme "src\ml\README.md" "Machine Learning" "On-device ML pipelines: face recognition (MobileFaceNet/TFLite) and liveness detection (MediaPipe Face Mesh). All inference on-device, zero network calls.`n`nFace recognition: **Phase 3**. Liveness detection: **Phase 4**.`n`n**Rules:** On-device only. Lazy model loading. Preprocessing must match training pipeline."
IndexStub "src\ml\index.ts"
TsStub "src\ml\types.ts" "Shared type definitions for ML pipeline inputs and outputs." 3
Readme "src\ml\faceRecognition\README.md" "Face Recognition" "MobileFaceNet pipeline: face detection, alignment, 128-dim embedding generation, cosine similarity comparison.`n`nImplemented in **Phase 3**.`n`n**Rules:** L2-normalize embeddings. Thresholds from face.constants.ts. 5-point landmark alignment."
IndexStub "src\ml\faceRecognition\index.ts"
TsStub "src\ml\faceRecognition\MobileFaceNet.ts" "TensorFlow Lite model wrapper for MobileFaceNet face embedding generation." 3
TsStub "src\ml\faceRecognition\faceAlignment.ts" "Face preprocessing: cropping, alignment using facial landmarks." 3
TsStub "src\ml\faceRecognition\embeddingUtils.ts" "Cosine similarity calculation and L2 normalization of embeddings." 3
TsStub "src\ml\faceRecognition\types.ts" "Type definitions for face recognition pipeline data structures." 3
Readme "src\ml\livenessDetection\README.md" "Liveness Detection" "MediaPipe Face Mesh liveness pipeline: blink (EAR), smile (MAR), head turn (yaw), random challenge sequencer.`n`nImplemented in **Phase 4**.`n`n**Rules:** Random challenge selection. Strict timeouts. Frame Processor worklets."
IndexStub "src\ml\livenessDetection\index.ts"
TsStub "src\ml\livenessDetection\FaceMeshProcessor.ts" "MediaPipe Face Mesh wrapper for extracting 468 facial landmarks." 4
TsStub "src\ml\livenessDetection\blinkDetector.ts" "Eye Aspect Ratio (EAR) based blink detection algorithm." 4
TsStub "src\ml\livenessDetection\smileDetector.ts" "Mouth Aspect Ratio (MAR) based smile detection algorithm." 4
TsStub "src\ml\livenessDetection\headPoseEstimator.ts" "Head pose estimation (yaw angle) for head turn challenge detection." 4
TsStub "src\ml\livenessDetection\challengeEngine.ts" "Random challenge sequencer that selects and orders liveness challenges." 4
TsStub "src\ml\livenessDetection\types.ts" "Type definitions for liveness detection data structures." 4

# ─── NAVIGATION ────────────────────────────────────────────────────────────────
Readme "src\navigation\README.md" "Navigation" "React Navigation v7 configuration: root navigator, auth stack, app stack, and typed navigation params.`n`nImplemented in **Phase 9** (UI Assembly).`n`n**Rules:** Route names from navigation.constants.ts. Strict RootStackParamList typing. No deep linking needed."
IndexStub "src\navigation\index.ts"
TsxStub "src\navigation\RootNavigator.tsx" "RootNavigator" "Root stack navigator switching between Auth and App stacks." 9
TsxStub "src\navigation\AuthNavigator.tsx" "AuthNavigator" "Navigation stack for unauthenticated flows (login, splash)." 9
TsxStub "src\navigation\AppNavigator.tsx" "AppNavigator" "Navigation stack for authenticated flows (enrollment, auth, dashboard)." 9
TsStub "src\navigation\types.ts" "Navigation parameter type definitions (RootStackParamList etc.)." 9

# ─── SCREENS ───────────────────────────────────────────────────────────────────
Readme "src\screens\README.md" "Screens" "All application screens. Each in its own folder with .tsx, .styles.ts, and index.ts. Screens are thin composites of components + hooks.`n`nImplemented in **Phase 9** (UI Assembly).`n`n**Rules:** No business logic in screens. Unique testID on root View. Use theme system for all styling."

$screenData = @(
    @("SplashScreen","Splash/loading screen shown on app startup during initialization."),
    @("LoginScreen","Supervisor login screen for authenticating the app operator."),
    @("EnrollmentScreen","Worker face enrollment screen for capturing face embeddings."),
    @("AuthenticationScreen","Main attendance authentication screen with camera and trust score."),
    @("LivenessScreen","Liveness challenge screen presenting random anti-spoof challenges."),
    @("ResultsScreen","Authentication results screen showing trust score and decision."),
    @("SupervisorDashboard","Dashboard for supervisors to view attendance records and flagged attempts."),
    @("PendingSyncScreen","Screen showing records pending sync to AWS with sync controls."),
    @("SettingsScreen","App settings screen for worksite configuration and preferences."),
    @("AuditLogsScreen","Screen displaying the audit trail of all system events.")
)

foreach ($s in $screenData) {
    TsxStub "src\screens\$($s[0])\$($s[0]).tsx" $s[0] $s[1] 9
    StylesStub "src\screens\$($s[0])\$($s[0]).styles.ts" 9
    IndexStub "src\screens\$($s[0])\index.ts"
}

# ─── SERVICES ──────────────────────────────────────────────────────────────────
Readme "src\services\README.md" "Services" "Business logic services: authentication, enrollment, device trust, behavioral analysis, location, trust scoring, consensus, sync, purge, security, audit, performance.`n`nImplemented across **Phases 2-8**.`n`n**Rules:** No React/UI imports. Database access through repositories only. Explicit return types."
IndexStub "src\services\index.ts"
TsStub "src\services\AuthenticationService.ts" "Orchestrates the complete authentication flow collecting all trust signals." 5
TsStub "src\services\EnrollmentService.ts" "Worker enrollment: face capture, embedding storage, device registration." 3
TsStub "src\services\DeviceTrustService.ts" "Device fingerprinting and device trust score calculation." 6
TsStub "src\services\BehavioralService.ts" "Behavioral pattern analysis: login time consistency, usage patterns." 6
TsStub "src\services\LocationService.ts" "GPS-based location scoring against registered worksite coordinates." 6
TsStub "src\services\TrustScoreService.ts" "Weighted aggregation of all trust signals into Dynamic Trust Score." 5
TsStub "src\services\ConsensusEngine.ts" "Signal contradiction detection when high-confidence signals conflict." 5
TsStub "src\services\SyncService.ts" "AWS sync orchestration: batching, uploading, error handling, retry logic." 7
TsStub "src\services\PurgeService.ts" "Post-sync local data purge to free device storage." 7
TsStub "src\services\SecurityService.ts" "Encryption/decryption wrapper using AES-256 and secure key management." 2
TsStub "src\services\AuditService.ts" "Immutable audit event logging for compliance and forensic analysis." 8
TsStub "src\services\PerformanceMonitor.ts" "Performance timing and monitoring for ML inference and critical paths." 8

# ─── STORE ─────────────────────────────────────────────────────────────────────
Readme "src\store\README.md" "Store" "Zustand v5 state management stores. Separate store per domain: auth, enrollment, sync, settings. Zero boilerplate, immer middleware for complex updates.`n`nImplemented across **Phases 2-9**.`n`n**Rules:** Separate create() per store. Use immer for nested updates. Persist middleware for survival across restarts."
IndexStub "src\store\index.ts"
TsStub "src\store\authStore.ts" "Zustand store for authentication session state." 5
TsStub "src\store\enrollmentStore.ts" "Zustand store for enrollment flow state." 3
TsStub "src\store\syncStore.ts" "Zustand store for sync queue state." 7
TsStub "src\store\settingsStore.ts" "Zustand store for app settings." 9
TsStub "src\store\types.ts" "Type definitions for all Zustand store state shapes and actions." 2

# ─── THEME ─────────────────────────────────────────────────────────────────────
Readme "src\theme\README.md" "Theme" "Design system tokens: color palette (dark-first), typography, spacing scale, shadows, assembled theme object.`n`nImplemented in **Phase 9** (UI Assembly).`n`n**Rules:** All components reference theme tokens. WCAG AA contrast. Changes centralized here only."
IndexStub "src\theme\index.ts"
TsStub "src\theme\colors.ts" "Color palette definitions for the dark-first design system." 9
TsStub "src\theme\typography.ts" "Typography scale: font sizes, weights, line heights, and font families." 9
TsStub "src\theme\spacing.ts" "Spacing scale based on 4px base unit (4, 8, 12, 16, 24, 32, 48, 64)." 9
TsStub "src\theme\shadows.ts" "Shadow presets for elevation levels on iOS and Android." 9
TsStub "src\theme\theme.ts" "Assembled theme object combining colors, typography, spacing, and shadows." 9

# ─── TYPES ─────────────────────────────────────────────────────────────────────
Readme "src\types\README.md" "Types" "Shared TypeScript type definitions by domain. Pure type files only (interfaces, type aliases, string enums). No runtime code.`n`nDefined in **Phase 1** (stubs), refined in subsequent phases.`n`n**Rules:** Types only, no runtime values. Prefer interfaces. String enums for debuggability."
IndexStub "src\types\index.ts"
TsStub "src\types\worker.types.ts" "Type definitions for worker/personnel data models." 2
TsStub "src\types\auth.types.ts" "Type definitions for authentication attempt data structures." 2
TsStub "src\types\trust.types.ts" "Type definitions for trust signals, scores, and decision results." 5
TsStub "src\types\liveness.types.ts" "Type definitions for liveness challenges and detection results." 4
TsStub "src\types\device.types.ts" "Type definitions for device fingerprint data structures." 6
TsStub "src\types\location.types.ts" "Type definitions for GPS coordinates, worksite boundaries, proximity scores." 6
TsStub "src\types\sync.types.ts" "Type definitions for sync queue entries and AWS payload structures." 7
TsStub "src\types\audit.types.ts" "Type definitions for audit log events and compliance records." 8
TsStub "src\types\navigation.types.ts" "Navigation type re-exports from the navigation module." 9

# ─── UTILS ─────────────────────────────────────────────────────────────────────
Readme "src\utils\README.md" "Utilities" "Pure utility functions: crypto (hashing, AES-256), validation (Zod schemas), formatting (dates/numbers), geometry (GPS distance), logging (dev-only), performance timing.`n`nImplemented across **Phases 2-8**.`n`n**Rules:** Pure functions (no side effects except logger). Explicit types. Logger stripped in production."
IndexStub "src\utils\index.ts"
TsStub "src\utils\crypto.utils.ts" "SHA-256 hashing and AES-256 encryption/decryption helpers." 2
TsStub "src\utils\validation.utils.ts" "Zod schema validators for runtime data validation." 2
TsStub "src\utils\formatting.utils.ts" "Date, number, and string formatting utilities using date-fns." 9
TsStub "src\utils\geometry.utils.ts" "Haversine distance calculation and GPS coordinate math." 6
TsStub "src\utils\logger.utils.ts" "Debug logger for development, stripped from production builds." 2
TsStub "src\utils\performance.utils.ts" "Performance timing utilities for ML inference and critical paths." 8

# ─── TESTS ─────────────────────────────────────────────────────────────────────
Readme "__tests__\README.md" "Tests" "All test suites: unit, integration, and E2E (Detox). Unit/integration use Jest + @testing-library/react-native.`n`nCreated in **Phase 10** (Testing & QA).`n`n**Rules:** Pattern *.test.ts(x). Unit tests isolated. Integration may use in-memory SQLite. E2E on device."
Readme "__tests__\unit\README.md" "Unit Tests" "Unit tests for individual functions and pure logic modules. Fast, isolated, no RN runtime or DB needed.`n`nCreated in **Phase 10**.`n`n**Rules:** Mock all externals. Test edge cases and error paths."
Gitkeep "__tests__\unit\.gitkeep"
Readme "__tests__\integration\README.md" "Integration Tests" "Integration tests verifying multiple modules working together. May use real in-memory SQLite and render components.`n`nCreated in **Phase 10**.`n`n**Rules:** Minimal mocking. Realistic data flows."
Gitkeep "__tests__\integration\.gitkeep"
Readme "__tests__\e2e\README.md" "E2E Tests" "Detox end-to-end tests on real devices/emulators. Complete user flows: enrollment, auth, sync, supervisor review.`n`nCreated in **Phase 10**.`n`n**Rules:** Deterministic. Idempotent. Clean up test data."
Gitkeep "__tests__\e2e\.gitkeep"

# ─── SCRIPTS ───────────────────────────────────────────────────────────────────
Readme "scripts\README.md" "Scripts" "Shell scripts for dev workflow: one-command setup, ML model downloads, type generation.`n`nMaintained throughout all phases.`n`n**Rules:** Idempotent. Check prerequisites. Clear success/failure output."

# ─── DOCS ──────────────────────────────────────────────────────────────────────
Readme "docs\README.md" "Documentation" "Project documentation: architecture, API specs, database schema, security model, deployment guide, Datalake 3.0 integration.`n`nUpdated incrementally across all phases.`n`n**Rules:** Keep in sync with code. Use Mermaid diagrams for architecture."

Write-Host "Done! All remaining stub files created."
