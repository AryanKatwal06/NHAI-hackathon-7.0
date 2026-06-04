## Bulk file creation script for NHAI Attendance Phase 1 scaffolding.
## Creates all stub .ts, .tsx, .gitkeep, and README.md files in the src/ tree.

$root = "c:\Users\katwa\Hackathon\nhai-attendance"

# Helper: create file with content, creating parent dirs as needed
function New-StubFile {
    param([string]$Path, [string]$Content)
    $dir = Split-Path $Path -Parent
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    Set-Content -Path $Path -Value $Content -Encoding UTF8
}

# Helper: create a .ts stub
function New-TsStub {
    param([string]$RelPath, [string]$Desc, [int]$Phase)
    $fileName = Split-Path $RelPath -Leaf
    $content = @"
// $fileName
// $Desc
// This file will be fully implemented in Phase $Phase.
// DO NOT implement any logic in this file during Phase 1.

export {};
"@
    New-StubFile "$root\$RelPath" $content
}

# Helper: create a .tsx component stub
function New-TsxStub {
    param([string]$RelPath, [string]$CompName, [string]$Desc, [int]$Phase)
    $fileName = Split-Path $RelPath -Leaf
    $content = @"
// $fileName
// $Desc
// This file will be fully implemented in Phase $Phase.
// DO NOT implement any logic in this file during Phase 1.

import React from 'react';
import { View } from 'react-native';

const ${CompName}: React.FC = () => {
  return <View />;
};

export default $CompName;
"@
    New-StubFile "$root\$RelPath" $content
}

# Helper: create a styles stub
function New-StylesStub {
    param([string]$RelPath, [int]$Phase)
    $fileName = Split-Path $RelPath -Leaf
    $content = @"
// $fileName
// Styles for the associated component/screen.
// This file will be fully implemented in Phase $Phase.
// DO NOT implement any logic in this file during Phase 1.

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({});
"@
    New-StubFile "$root\$RelPath" $content
}

# Helper: create index.ts barrel export
function New-IndexStub {
    param([string]$RelPath)
    $content = @"
// index.ts
// Barrel export file. Re-exports will be added as implementations are completed.

export {};
"@
    New-StubFile "$root\$RelPath" $content
}

# Helper: create README
function New-Readme {
    param([string]$RelPath, [string]$Title, [string]$Body)
    $content = @"
# $Title

$Body
"@
    New-StubFile "$root\$RelPath" $content
}

# Helper: create .gitkeep
function New-Gitkeep {
    param([string]$RelPath)
    New-StubFile "$root\$RelPath" "# placeholder"
}

Write-Host "Creating components..."

# ─── COMPONENTS ────────────────────────────────────────────────────────────────

New-Readme "src\components\README.md" "Components" "This folder contains all reusable React Native UI components. Components are organized into subdirectories by domain: ``common/`` for shared UI primitives, ``camera/`` for camera-related views, ``liveness/`` for liveness challenge UI, and ``trust/`` for trust score display widgets.`n`nCommon components are implemented in **Phase 9** (UI Assembly). Domain-specific components are implemented in their respective phases (Camera: Phase 3, Liveness: Phase 4, Trust: Phase 5).`n`n**Architectural Rules:**`n- Every component lives in its own folder with Component.tsx, Component.styles.ts, and index.ts.`n- Components must not contain business logic — delegate to hooks and services.`n- All components must be typed with React.FC and proper prop interfaces."
New-IndexStub "src\components\index.ts"

# Common components
New-Readme "src\components\common\README.md" "Common Components" "This folder contains shared, reusable UI primitives used across multiple screens: Button, Card, LoadingOverlay, StatusBadge, and Typography. These are the building blocks of the application's design system.`n`nAll common components are implemented in **Phase 9** (UI Assembly).`n`n**Architectural Rules:**`n- Each component must accept a ``testID`` prop for Detox E2E testing.`n- Styles must use the theme tokens from ``@theme/`` — no hardcoded colors or spacing values.`n- Components should be pure (no side effects) and fully controlled by props."

# Button
New-TsxStub "src\components\common\Button\Button.tsx" "Button" "Reusable button component with variants (primary, secondary, danger, ghost)." 9
New-StylesStub "src\components\common\Button\Button.styles.ts" 9
New-IndexStub "src\components\common\Button\index.ts"

# Card
New-TsxStub "src\components\common\Card\Card.tsx" "Card" "Reusable card container component with shadow and border radius." 9
New-StylesStub "src\components\common\Card\Card.styles.ts" 9
New-IndexStub "src\components\common\Card\index.ts"

# LoadingOverlay
New-TsxStub "src\components\common\LoadingOverlay\LoadingOverlay.tsx" "LoadingOverlay" "Full-screen loading overlay with spinner and optional message." 9
New-IndexStub "src\components\common\LoadingOverlay\index.ts"

# StatusBadge
New-TsxStub "src\components\common\StatusBadge\StatusBadge.tsx" "StatusBadge" "Colored badge showing authentication status (Authenticated, Flagged, Rejected)." 9
New-IndexStub "src\components\common\StatusBadge\index.ts"

# Typography
New-TsxStub "src\components\common\Typography\Typography.tsx" "Typography" "Text component wrapping React Native Text with theme-based typography styles." 9
New-IndexStub "src\components\common\Typography\index.ts"

# Camera components
New-Readme "src\components\camera\README.md" "Camera Components" "This folder contains camera-related UI components: CameraView (Vision Camera wrapper), FaceOverlay (face detection bounding box overlay), and related camera UI. These components use react-native-vision-camera v4 Frame Processors API.`n`nAll camera components are implemented in **Phase 3** (Face Recognition Pipeline).`n`n**Architectural Rules:**`n- Camera components must handle permission states gracefully (no permission, denied, granted).`n- Frame processors must be worklets — do not run JS-thread blocking code in them.`n- Always release camera resources on unmount."
New-Gitkeep "src\components\camera\.gitkeep"

# Liveness components
New-Readme "src\components\liveness\README.md" "Liveness Components" "This folder contains UI components for the liveness detection challenge flow: LivenessChallenge (orchestrator), ChallengePrompt (individual challenge display), and animated feedback indicators.`n`nAll liveness components are implemented in **Phase 4** (Liveness Detection).`n`n**Architectural Rules:**`n- Challenge animations must use react-native-reanimated worklets for 60fps performance.`n- Challenge UI must be accessible and provide clear visual + text instructions.`n- Timer displays must be accurate to within 100ms."
New-Gitkeep "src\components\liveness\.gitkeep"

# Trust components
New-Readme "src\components\trust\README.md" "Trust Components" "This folder contains UI components for displaying the Dynamic Trust Score: TrustScoreGauge (animated circular gauge), ScoreBreakdown (per-signal detail view), and related visualization widgets.`n`nAll trust components are implemented in **Phase 5** (Trust Score Engine).`n`n**Architectural Rules:**`n- The gauge animation must smoothly animate from 0 to the final score.`n- Color coding must match TRUST_THRESHOLDS: green (>=80), yellow (>=60), red (<60).`n- Score breakdowns must show all 5 signal contributions."
New-Gitkeep "src\components\trust\.gitkeep"

Write-Host "Creating constants..."

# ─── CONSTANTS ─────────────────────────────────────────────────────────────────

New-Readme "src\constants\README.md" "Constants" "This folder contains all application-wide constant values organized by domain. Constants are pure TypeScript objects with ``as const`` assertions for type safety. They serve as the single source of truth for thresholds, weights, configuration values, and magic numbers used throughout the application.`n`nConstants are fully implemented in **Phase 1** (this phase). They are referenced by all subsequent phases.`n`n**Architectural Rules:**`n- All constants must use ``as const`` assertions for literal type inference.`n- Constants must not import from any module outside this folder (except react-native-config for env overrides).`n- Every constant must have a comment explaining its purpose and valid range."
New-IndexStub "src\constants\index.ts"

Write-Host "Creating db..."

# ─── DB ────────────────────────────────────────────────────────────────────────

New-Readme "src\db\README.md" "Database" "This folder contains the SQLite database layer: connection initialization, schema definitions, migrations, and repository classes. The app uses react-native-quick-sqlite (or op-sqlite) with optional SQLCipher encryption for on-device encrypted storage.`n`nThe database layer is implemented in **Phase 2** (Database Schema & Encryption).`n`n**Architectural Rules:**`n- All database access must go through repository classes — no raw SQL in screens or services.`n- Migrations must be idempotent and versioned sequentially.`n- All sensitive data (face embeddings, auth records) must be stored in encrypted columns."
New-IndexStub "src\db\index.ts"
New-TsStub "src\db\schema.ts" "All SQLite table CREATE statements for the attendance database." 2
New-TsStub "src\db\connection.ts" "SQLite database connection initialization and encryption setup." 2

# Migrations
New-Readme "src\db\migrations\README.md" "Migrations" "This folder contains versioned database migration scripts. Each migration file exports an ``up()`` and ``down()`` function. Migrations run automatically on app startup and are tracked in a ``_migrations`` meta-table to prevent re-execution.`n`nMigrations are implemented starting in **Phase 2** (Database Schema).`n`n**Architectural Rules:**`n- Migrations must be idempotent — running them twice must not cause errors.`n- Never modify an existing migration after it has been released — create a new one.`n- Migration filenames must follow the pattern ``v{N}_{description}.ts``."
New-TsStub "src\db\migrations\v1_initial.ts" "Initial database schema migration creating all core tables." 2

# Repositories
New-Readme "src\db\repositories\README.md" "Repositories" "This folder contains data access objects (DAOs / repositories) for each database table. Repositories encapsulate all SQL queries for their respective tables and expose typed async methods. Screens and services never write raw SQL — they call repository methods.`n`nRepositories are implemented in **Phase 2** (Database Schema).`n`n**Architectural Rules:**`n- Each repository handles exactly one table or closely related set of tables.`n- All methods must be async and return typed results.`n- Repositories must not contain business logic — only data access."
New-IndexStub "src\db\repositories\index.ts"
New-TsStub "src\db\repositories\workers.repository.ts" "Data access for the workers table (enrolled personnel records)." 2
New-TsStub "src\db\repositories\authRecords.repository.ts" "Data access for authentication attempt records." 2
New-TsStub "src\db\repositories\devices.repository.ts" "Data access for registered device fingerprints." 2
New-TsStub "src\db\repositories\behaviorHistory.repository.ts" "Data access for behavioral pattern history (login times, patterns)." 2
New-TsStub "src\db\repositories\auditLogs.repository.ts" "Data access for the audit log table." 2
New-TsStub "src\db\repositories\syncQueue.repository.ts" "Data access for the sync queue (records pending upload to AWS)." 2

Write-Host "Creating hooks..."

# ─── HOOKS ─────────────────────────────────────────────────────────────────────

New-Readme "src\hooks\README.md" "Hooks" "This folder contains custom React hooks that encapsulate reusable stateful logic. Hooks bridge the gap between UI components and backend services/stores. Each hook focuses on a single concern: camera, location, face recognition, liveness, trust scoring, sync, network state, or audit logging.`n`nHooks are implemented across multiple phases as their underlying services are built.`n`n**Architectural Rules:**`n- Hooks must follow React's Rules of Hooks (no conditional calls).`n- Hooks should compose from Zustand stores and service modules — not contain business logic directly.`n- All hooks must have proper cleanup in useEffect return functions."
New-IndexStub "src\hooks\index.ts"
New-TsStub "src\hooks\useCamera.ts" "Custom hook for camera permission handling and Vision Camera lifecycle." 3
New-TsStub "src\hooks\useLocation.ts" "Custom hook for GPS coordinate acquisition with timeout handling." 6
New-TsStub "src\hooks\useFaceRecognition.ts" "Custom hook orchestrating the face detection and embedding pipeline." 3
New-TsStub "src\hooks\useLiveness.ts" "Custom hook for liveness challenge orchestration and result tracking." 4
New-TsStub "src\hooks\useTrustScore.ts" "Custom hook for computing the Dynamic Trust Score from all signals." 5
New-TsStub "src\hooks\useSync.ts" "Custom hook for triggering and monitoring AWS sync operations." 7
New-TsStub "src\hooks\useNetworkState.ts" "Custom hook for detecting online/offline connectivity state." 7
New-TsStub "src\hooks\useAuditLog.ts" "Custom hook for writing audit log entries from UI events." 8

Write-Host "Creating ml..."

# ─── ML ────────────────────────────────────────────────────────────────────────

New-Readme "src\ml\README.md" "Machine Learning" "This folder contains all on-device ML pipeline code: face recognition (MobileFaceNet via TFLite) and liveness detection (MediaPipe Face Mesh). All inference runs entirely on-device with no internet dependency. Models are loaded from the assets/models/ directory.`n`nFace recognition is implemented in **Phase 3**. Liveness detection is implemented in **Phase 4**.`n`n**Architectural Rules:**`n- All ML inference must run on-device — zero network calls for ML.`n- Models must be loaded lazily (not at app startup) to minimize cold start time.`n- All preprocessing (alignment, normalization) must match the model's training pipeline exactly."
New-IndexStub "src\ml\index.ts"
New-TsStub "src\ml\types.ts" "Shared type definitions for ML pipeline inputs and outputs." 3

# Face Recognition
New-Readme "src\ml\faceRecognition\README.md" "Face Recognition" "This folder implements the face recognition pipeline using MobileFaceNet (TFLite). It handles face detection (via MLKit), face alignment/preprocessing, embedding generation (128-dimensional vectors), and cosine similarity comparison for identity verification.`n`nFully implemented in **Phase 3** (Face Recognition Pipeline).`n`n**Architectural Rules:**`n- Embeddings must be L2-normalized before comparison.`n- Cosine similarity threshold is defined in face.constants.ts — do not hardcode.`n- Face alignment must use the 5-point landmark alignment (eyes, nose, mouth corners)."
New-IndexStub "src\ml\faceRecognition\index.ts"
New-TsStub "src\ml\faceRecognition\MobileFaceNet.ts" "TensorFlow Lite model wrapper for MobileFaceNet face embedding generation." 3
New-TsStub "src\ml\faceRecognition\faceAlignment.ts" "Face preprocessing: cropping, alignment using facial landmarks." 3
New-TsStub "src\ml\faceRecognition\embeddingUtils.ts" "Utilities for cosine similarity calculation and L2 normalization of embeddings." 3
New-TsStub "src\ml\faceRecognition\types.ts" "Type definitions for face recognition pipeline data structures." 3

# Liveness Detection
New-Readme "src\ml\livenessDetection\README.md" "Liveness Detection" "This folder implements the liveness detection pipeline using MediaPipe Face Mesh landmarks. It detects blinks (Eye Aspect Ratio), smiles (Mouth Aspect Ratio), and head turns (yaw estimation). The challengeEngine randomizes which challenges are presented per session.`n`nFully implemented in **Phase 4** (Liveness Detection Pipeline).`n`n**Architectural Rules:**`n- Challenges must be randomly selected from the pool to prevent replay attacks.`n- Each challenge has a strict timeout defined in liveness.constants.ts.`n- All landmark processing must happen in Vision Camera Frame Processors (worklets)."
New-IndexStub "src\ml\livenessDetection\index.ts"
New-TsStub "src\ml\livenessDetection\FaceMeshProcessor.ts" "MediaPipe Face Mesh wrapper for extracting 468 facial landmarks." 4
New-TsStub "src\ml\livenessDetection\blinkDetector.ts" "Eye Aspect Ratio (EAR) based blink detection algorithm." 4
New-TsStub "src\ml\livenessDetection\smileDetector.ts" "Mouth Aspect Ratio (MAR) based smile detection algorithm." 4
New-TsStub "src\ml\livenessDetection\headPoseEstimator.ts" "Head pose estimation (yaw angle) for head turn challenge detection." 4
New-TsStub "src\ml\livenessDetection\challengeEngine.ts" "Random challenge sequencer that selects and orders liveness challenges." 4
New-TsStub "src\ml\livenessDetection\types.ts" "Type definitions for liveness detection data structures." 4

Write-Host "Creating navigation..."

# ─── NAVIGATION ────────────────────────────────────────────────────────────────

New-Readme "src\navigation\README.md" "Navigation" "This folder contains the React Navigation v7 configuration: root navigator, authenticated stack, unauthenticated stack, and navigation type definitions. The app uses native stack navigators for optimal performance on both platforms.`n`nNavigation is implemented in **Phase 9** (UI Assembly & Navigation).`n`n**Architectural Rules:**`n- All route names must be defined as constants in navigation.constants.ts.`n- Navigation param types must be strictly typed using RootStackParamList.`n- Deep linking is not required for this app (offline-first, no web URLs)."
New-IndexStub "src\navigation\index.ts"
New-TsxStub "src\navigation\RootNavigator.tsx" "RootNavigator" "Root stack navigator that switches between Auth and App stacks." 9
New-TsxStub "src\navigation\AuthNavigator.tsx" "AuthNavigator" "Navigation stack for unauthenticated flows (login, splash)." 9
New-TsxStub "src\navigation\AppNavigator.tsx" "AppNavigator" "Navigation stack for authenticated flows (enrollment, auth, dashboard)." 9
New-TsStub "src\navigation\types.ts" "Navigation parameter type definitions (RootStackParamList etc.)." 9

Write-Host "Creating screens..."

# ─── SCREENS ───────────────────────────────────────────────────────────────────

New-Readme "src\screens\README.md" "Screens" "This folder contains all application screens. Each screen lives in its own folder with the screen component (.tsx), its styles (.styles.ts), and a barrel export (index.ts). Screens are thin — they compose UI from components and delegate logic to hooks and services.`n`nScreens are implemented in **Phase 9** (UI Assembly).`n`n**Architectural Rules:**`n- Screens must not contain business logic — use hooks and services.`n- Each screen must have a unique testID on its root View for E2E testing.`n- Screens should use the theme system for all visual styling."

$screens = @(
    @{Name="SplashScreen"; Desc="Splash/loading screen shown on app startup during initialization."; Phase=9},
    @{Name="LoginScreen"; Desc="Supervisor login screen for authenticating the app operator."; Phase=9},
    @{Name="EnrollmentScreen"; Desc="Worker face enrollment screen for capturing face embeddings."; Phase=9},
    @{Name="AuthenticationScreen"; Desc="Main attendance authentication screen with camera and trust score."; Phase=9},
    @{Name="LivenessScreen"; Desc="Liveness challenge screen presenting random anti-spoof challenges."; Phase=9},
    @{Name="ResultsScreen"; Desc="Authentication results screen showing trust score and decision."; Phase=9},
    @{Name="SupervisorDashboard"; Desc="Dashboard for supervisors to view attendance records and flagged attempts."; Phase=9},
    @{Name="PendingSyncScreen"; Desc="Screen showing records pending sync to AWS with sync controls."; Phase=9},
    @{Name="SettingsScreen"; Desc="App settings screen for worksite configuration and preferences."; Phase=9},
    @{Name="AuditLogsScreen"; Desc="Screen displaying the audit trail of all system events."; Phase=9}
)

foreach ($screen in $screens) {
    $n = $screen.Name
    $d = $screen.Desc
    $p = $screen.Phase
    New-TsxStub "src\screens\$n\$n.tsx" $n $d $p
    New-StylesStub "src\screens\$n\$n.styles.ts" $p
    New-IndexStub "src\screens\$n\index.ts"
}

Write-Host "Creating services..."

# ─── SERVICES ──────────────────────────────────────────────────────────────────

New-Readme "src\services\README.md" "Services" "This folder contains all business logic services. Services are pure TypeScript classes/modules that orchestrate operations: authentication workflows, enrollment, device trust scoring, behavioral analysis, location scoring, trust score aggregation, consensus detection, AWS sync, post-sync purge, encryption, audit logging, and performance monitoring.`n`nServices are implemented across **Phases 2-8** depending on their domain.`n`n**Architectural Rules:**`n- Services must not import from React or any UI library — they are pure logic.`n- Services communicate with the database through repositories only.`n- All service methods must be typed with explicit return types."
New-IndexStub "src\services\index.ts"

$services = @(
    @{File="AuthenticationService.ts"; Desc="Orchestrates the complete authentication flow collecting all trust signals."; Phase=5},
    @{File="EnrollmentService.ts"; Desc="Orchestrates worker enrollment: face capture, embedding storage, device registration."; Phase=3},
    @{File="DeviceTrustService.ts"; Desc="Device fingerprinting and device trust score calculation."; Phase=6},
    @{File="BehavioralService.ts"; Desc="Behavioral pattern analysis: login time consistency, usage patterns."; Phase=6},
    @{File="LocationService.ts"; Desc="GPS-based location scoring against registered worksite coordinates."; Phase=6},
    @{File="TrustScoreService.ts"; Desc="Weighted aggregation of all trust signals into the Dynamic Trust Score."; Phase=5},
    @{File="ConsensusEngine.ts"; Desc="Signal contradiction detection when high-confidence signals conflict."; Phase=5},
    @{File="SyncService.ts"; Desc="AWS sync orchestration: batching, uploading, error handling, retry logic."; Phase=7},
    @{File="PurgeService.ts"; Desc="Post-sync local data purge to free device storage after successful sync."; Phase=7},
    @{File="SecurityService.ts"; Desc="Encryption/decryption wrapper using AES-256 and secure key management."; Phase=2},
    @{File="AuditService.ts"; Desc="Immutable audit event logging for compliance and forensic analysis."; Phase=8},
    @{File="PerformanceMonitor.ts"; Desc="Performance timing and monitoring for ML inference and critical paths."; Phase=8}
)

foreach ($svc in $services) {
    New-TsStub "src\services\$($svc.File)" $svc.Desc $svc.Phase
}

Write-Host "Creating store..."

# ─── STORE ─────────────────────────────────────────────────────────────────────

New-Readme "src\store\README.md" "Store" "This folder contains Zustand v5 state management stores. Each domain has its own store slice: auth session state, enrollment flow state, sync queue state, and app settings. Zustand was chosen over Redux for zero boilerplate, no Provider wrapping, built-in persistence middleware, and excellent TypeScript inference.`n`nStores are implemented across **Phases 2-9** as features are built.`n`n**Architectural Rules:**`n- Each store must be a separate Zustand create() call — no monolithic store.`n- Use immer middleware for complex nested state updates.`n- Persist middleware must be used for stores that need to survive app restart."
New-IndexStub "src\store\index.ts"
New-TsStub "src\store\authStore.ts" "Zustand store for authentication session state (current user, session, trust score)." 5
New-TsStub "src\store\enrollmentStore.ts" "Zustand store for enrollment flow state (capture progress, embedding data)." 3
New-TsStub "src\store\syncStore.ts" "Zustand store for sync queue state (pending count, last sync time, connectivity)." 7
New-TsStub "src\store\settingsStore.ts" "Zustand store for app settings (worksite config, thresholds, preferences)." 9
New-TsStub "src\store\types.ts" "Type definitions for all Zustand store state shapes and actions." 2

Write-Host "Creating theme..."

# ─── THEME ─────────────────────────────────────────────────────────────────────

New-Readme "src\theme\README.md" "Theme" "This folder contains the application's design system tokens: color palette, typography scales, spacing scale, shadow presets, and the assembled theme object. The design follows a dark-first approach suitable for outdoor use at construction sites.`n`nThe theme is implemented in **Phase 9** (UI Assembly).`n`n**Architectural Rules:**`n- All components must reference theme tokens — no hardcoded colors, sizes, or spacing.`n- The color palette must maintain WCAG AA contrast ratios for accessibility.`n- Theme changes must be centralized here — never in individual component styles."
New-IndexStub "src\theme\index.ts"
New-TsStub "src\theme\colors.ts" "Color palette definitions for the dark-first design system." 9
New-TsStub "src\theme\typography.ts" "Typography scale: font sizes, weights, line heights, and font families." 9
New-TsStub "src\theme\spacing.ts" "Spacing scale based on 4px base unit (4, 8, 12, 16, 24, 32, 48, 64)." 9
New-TsStub "src\theme\shadows.ts" "Shadow presets for elevation levels on iOS and Android." 9
New-TsStub "src\theme\theme.ts" "Assembled theme object combining colors, typography, spacing, and shadows." 9

Write-Host "Creating types..."

# ─── TYPES ─────────────────────────────────────────────────────────────────────

New-Readme "src\types\README.md" "Types" "This folder contains all shared TypeScript type definitions organized by domain. These are pure type files with interfaces, type aliases, and enums — no runtime code. They define the data shapes used across services, stores, repositories, and components.`n`nTypes are defined in **Phase 1** (stubs) and refined in subsequent phases.`n`n**Architectural Rules:**`n- Type files must contain ONLY type definitions — no runtime values, no functions.`n- Prefer interfaces over type aliases for object shapes (enables declaration merging).`n- All enums must be string enums for debuggability (not numeric)."
New-IndexStub "src\types\index.ts"
New-TsStub "src\types\worker.types.ts" "Type definitions for worker/personnel data models." 2
New-TsStub "src\types\auth.types.ts" "Type definitions for authentication attempt data structures." 2
New-TsStub "src\types\trust.types.ts" "Type definitions for trust signals, scores, and decision results." 5
New-TsStub "src\types\liveness.types.ts" "Type definitions for liveness challenges and detection results." 4
New-TsStub "src\types\device.types.ts" "Type definitions for device fingerprint data structures." 6
New-TsStub "src\types\location.types.ts" "Type definitions for GPS coordinates, worksite boundaries, and proximity scores." 6
New-TsStub "src\types\sync.types.ts" "Type definitions for sync queue entries and AWS payload structures." 7
New-TsStub "src\types\audit.types.ts" "Type definitions for audit log events and compliance records." 8
New-TsStub "src\types\navigation.types.ts" "Navigation type re-exports from the navigation module." 9

Write-Host "Creating utils..."

# ─── UTILS ─────────────────────────────────────────────────────────────────────

New-Readme "src\utils\README.md" "Utilities" "This folder contains pure utility functions organized by category: cryptographic helpers (hashing, AES-256), validation (Zod schemas), formatting (dates, numbers, strings), geometry (GPS distance calculations), logging (dev-only debug logger), and performance timing utilities.`n`nUtilities are implemented across **Phases 2-8** as needed.`n`n**Architectural Rules:**`n- All utility functions must be pure (no side effects except the logger).`n- Every function must have explicit TypeScript parameter and return types.`n- The logger must be completely stripped from production builds."
New-IndexStub "src\utils\index.ts"
New-TsStub "src\utils\crypto.utils.ts" "Cryptographic utilities: SHA-256 hashing, AES-256 encryption/decryption helpers." 2
New-TsStub "src\utils\validation.utils.ts" "Zod schema validators for runtime data validation across all data models." 2
New-TsStub "src\utils\formatting.utils.ts" "Date, number, and string formatting utilities using date-fns." 9
New-TsStub "src\utils\geometry.utils.ts" "Haversine distance calculation and GPS coordinate math utilities." 6
New-TsStub "src\utils\logger.utils.ts" "Debug logger for development. Stripped from production builds via env check." 2
New-TsStub "src\utils\performance.utils.ts" "Performance timing utilities for measuring ML inference and critical paths." 8

Write-Host "Creating tests..."

# ─── TESTS ─────────────────────────────────────────────────────────────────────

New-Readme "__tests__\README.md" "Tests" "This folder contains all test suites organized by type: unit tests, integration tests, and end-to-end (E2E) tests. Unit and integration tests use Jest with @testing-library/react-native. E2E tests use Detox.`n`nTest suites are created in **Phase 10** (Testing & Quality Assurance).`n`n**Architectural Rules:**`n- Test files must follow the naming pattern ``*.test.ts`` or ``*.test.tsx``.`n- Unit tests must not depend on external services or the database.`n- Integration tests may use an in-memory SQLite database.`n- E2E tests run on actual device/emulator and test complete user flows."

New-Readme "__tests__\unit\README.md" "Unit Tests" "This folder contains unit tests for individual functions, utilities, and pure logic modules. Unit tests are fast, isolated, and do not require the React Native runtime or database connections.`n`nUnit tests are created in **Phase 10**.`n`n**Rules:** Mock all external dependencies. Test edge cases and error paths."
New-Gitkeep "__tests__\unit\.gitkeep"

New-Readme "__tests__\integration\README.md" "Integration Tests" "This folder contains integration tests that verify multiple modules working together. Integration tests may use real (in-memory) SQLite databases and may render React components with providers.`n`nIntegration tests are created in **Phase 10**.`n`n**Rules:** Use minimal mocking. Test realistic data flows between services."
New-Gitkeep "__tests__\integration\.gitkeep"

New-Readme "__tests__\e2e\README.md" "E2E Tests" "This folder contains Detox end-to-end tests that run on real devices or emulators. E2E tests verify complete user flows: enrollment, authentication, sync, and supervisor review.`n`nE2E tests are created in **Phase 10**.`n`n**Rules:** Tests must be deterministic and idempotent. Clean up test data after each run."
New-Gitkeep "__tests__\e2e\.gitkeep"

Write-Host "Creating scripts..."

# ─── SCRIPTS ───────────────────────────────────────────────────────────────────

New-Readme "scripts\README.md" "Scripts" "This folder contains shell scripts for development workflow automation: one-command setup, ML model downloads, and type generation. Scripts are designed to run on macOS, Linux, and Windows (via Git Bash or WSL).`n`nScripts are maintained throughout all phases.`n`n**Architectural Rules:**`n- Scripts must be idempotent — running them twice must not cause errors.`n- All scripts must check for prerequisites before executing.`n- Scripts must provide clear output indicating success or failure."

Write-Host "Creating docs..."

# ─── DOCS ──────────────────────────────────────────────────────────────────────

New-Readme "docs\README.md" "Documentation" "This folder contains project documentation: system architecture, API specifications, database schema, security model, deployment guide, and Datalake 3.0 integration guide. Documentation is written in Markdown and kept in sync with implementation.`n`nDocumentation is updated incrementally across all phases.`n`n**Rules:** Keep docs in sync with code. Use Mermaid diagrams for architecture visuals."

Write-Host "All files created successfully!"
