// Scaffold script — creates all remaining stub files for Phase 1.
// Run: node scripts/create-stubs.js

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function mkfile(rel, content) {
  const full = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  if (!fs.existsSync(full)) {
    fs.writeFileSync(full, content, 'utf-8');
    console.log('  Created:', rel);
  } else {
    console.log('  Exists:', rel);
  }
}

function tsStub(rel, desc, phase) {
  const name = path.basename(rel);
  mkfile(rel, `// ${name}\n// ${desc}\n// This file will be fully implemented in Phase ${phase}.\n// DO NOT implement any logic in this file during Phase 1.\n\nexport {};\n`);
}

function tsxStub(rel, comp, desc, phase) {
  const name = path.basename(rel);
  mkfile(rel, `// ${name}\n// ${desc}\n// This file will be fully implemented in Phase ${phase}.\n// DO NOT implement any logic in this file during Phase 1.\n\nimport React from 'react';\nimport { View } from 'react-native';\n\nconst ${comp}: React.FC = () => {\n  return <View />;\n};\n\nexport default ${comp};\n`);
}

function stylesStub(rel, phase) {
  const name = path.basename(rel);
  mkfile(rel, `// ${name}\n// Styles for the associated component/screen.\n// This file will be fully implemented in Phase ${phase}.\n// DO NOT implement any logic in this file during Phase 1.\n\nimport { StyleSheet } from 'react-native';\n\nexport const styles = StyleSheet.create({});\n`);
}

function indexStub(rel) {
  mkfile(rel, `// index.ts\n// Barrel export file. Re-exports will be added as implementations are completed.\n\nexport {};\n`);
}

function readme(rel, title, body) {
  mkfile(rel, `# ${title}\n\n${body}\n`);
}

function gitkeep(rel) {
  mkfile(rel, '');
}

// ─── FACE RECOGNITION ML ──────────────────────────────────────────────────
readme('src/ml/faceRecognition/README.md', 'Face Recognition', 'MobileFaceNet pipeline: face detection, alignment, 128-dim embedding generation, cosine similarity comparison.\n\nImplemented in **Phase 3**.\n\n**Rules:** L2-normalize embeddings. Thresholds from face.constants.ts. 5-point landmark alignment.');
indexStub('src/ml/faceRecognition/index.ts');
tsStub('src/ml/faceRecognition/MobileFaceNet.ts', 'TensorFlow Lite model wrapper for MobileFaceNet face embedding generation.', 3);
tsStub('src/ml/faceRecognition/faceAlignment.ts', 'Face preprocessing: cropping, alignment using facial landmarks.', 3);
tsStub('src/ml/faceRecognition/embeddingUtils.ts', 'Cosine similarity calculation and L2 normalization of embeddings.', 3);
tsStub('src/ml/faceRecognition/types.ts', 'Type definitions for face recognition pipeline data structures.', 3);

// ─── LIVENESS DETECTION ML ────────────────────────────────────────────────
readme('src/ml/livenessDetection/README.md', 'Liveness Detection', 'MediaPipe Face Mesh liveness pipeline: blink (EAR), smile (MAR), head turn (yaw), random challenge sequencer.\n\nImplemented in **Phase 4**.\n\n**Rules:** Random challenge selection. Strict timeouts. Frame Processor worklets.');
indexStub('src/ml/livenessDetection/index.ts');
tsStub('src/ml/livenessDetection/FaceMeshProcessor.ts', 'MediaPipe Face Mesh wrapper for extracting 468 facial landmarks.', 4);
tsStub('src/ml/livenessDetection/blinkDetector.ts', 'Eye Aspect Ratio (EAR) based blink detection algorithm.', 4);
tsStub('src/ml/livenessDetection/smileDetector.ts', 'Mouth Aspect Ratio (MAR) based smile detection algorithm.', 4);
tsStub('src/ml/livenessDetection/headPoseEstimator.ts', 'Head pose estimation (yaw angle) for head turn challenge detection.', 4);
tsStub('src/ml/livenessDetection/challengeEngine.ts', 'Random challenge sequencer that selects and orders liveness challenges.', 4);
tsStub('src/ml/livenessDetection/types.ts', 'Type definitions for liveness detection data structures.', 4);

// ─── NAVIGATION ───────────────────────────────────────────────────────────
readme('src/navigation/README.md', 'Navigation', 'React Navigation v7 configuration: root navigator, auth stack, app stack, and typed navigation params.\n\nImplemented in **Phase 9** (UI Assembly).\n\n**Rules:** Route names from navigation.constants.ts. Strict RootStackParamList typing. No deep linking needed.');
indexStub('src/navigation/index.ts');
tsxStub('src/navigation/RootNavigator.tsx', 'RootNavigator', 'Root stack navigator switching between Auth and App stacks.', 9);
tsxStub('src/navigation/AuthNavigator.tsx', 'AuthNavigator', 'Navigation stack for unauthenticated flows (login, splash).', 9);
tsxStub('src/navigation/AppNavigator.tsx', 'AppNavigator', 'Navigation stack for authenticated flows (enrollment, auth, dashboard).', 9);
tsStub('src/navigation/types.ts', 'Navigation parameter type definitions (RootStackParamList etc.).', 9);

// ─── SCREENS ──────────────────────────────────────────────────────────────
readme('src/screens/README.md', 'Screens', 'All application screens. Each in its own folder with .tsx, .styles.ts, and index.ts. Screens are thin composites.\n\nImplemented in **Phase 9** (UI Assembly).\n\n**Rules:** No business logic. Unique testID on root View. Use theme system.');

const screens = [
  ['SplashScreen', 'Splash/loading screen shown on app startup.'],
  ['LoginScreen', 'Supervisor login screen for authenticating the app operator.'],
  ['EnrollmentScreen', 'Worker face enrollment screen for capturing face embeddings.'],
  ['AuthenticationScreen', 'Main attendance authentication screen with camera and trust score.'],
  ['LivenessScreen', 'Liveness challenge screen presenting random anti-spoof challenges.'],
  ['ResultsScreen', 'Authentication results screen showing trust score and decision.'],
  ['SupervisorDashboard', 'Dashboard for supervisors to view attendance records and flagged attempts.'],
  ['PendingSyncScreen', 'Screen showing records pending sync to AWS with sync controls.'],
  ['SettingsScreen', 'App settings screen for worksite configuration and preferences.'],
  ['AuditLogsScreen', 'Screen displaying the audit trail of all system events.'],
];

for (const [name, desc] of screens) {
  tsxStub(`src/screens/${name}/${name}.tsx`, name, desc, 9);
  stylesStub(`src/screens/${name}/${name}.styles.ts`, 9);
  indexStub(`src/screens/${name}/index.ts`);
}

// ─── SERVICES ─────────────────────────────────────────────────────────────
readme('src/services/README.md', 'Services', 'Business logic services. No React/UI imports. Database access through repositories only. Explicit return types.\n\nImplemented across **Phases 2-8**.');
indexStub('src/services/index.ts');

const services = [
  ['AuthenticationService.ts', 'Orchestrates the complete authentication flow collecting all trust signals.', 5],
  ['EnrollmentService.ts', 'Worker enrollment: face capture, embedding storage, device registration.', 3],
  ['DeviceTrustService.ts', 'Device fingerprinting and device trust score calculation.', 6],
  ['BehavioralService.ts', 'Behavioral pattern analysis: login time consistency, usage patterns.', 6],
  ['LocationService.ts', 'GPS-based location scoring against registered worksite coordinates.', 6],
  ['TrustScoreService.ts', 'Weighted aggregation of all trust signals into Dynamic Trust Score.', 5],
  ['ConsensusEngine.ts', 'Signal contradiction detection when high-confidence signals conflict.', 5],
  ['SyncService.ts', 'AWS sync orchestration: batching, uploading, error handling, retry logic.', 7],
  ['PurgeService.ts', 'Post-sync local data purge to free device storage.', 7],
  ['SecurityService.ts', 'Encryption/decryption wrapper using AES-256 and secure key management.', 2],
  ['AuditService.ts', 'Immutable audit event logging for compliance and forensic analysis.', 8],
  ['PerformanceMonitor.ts', 'Performance timing and monitoring for ML inference and critical paths.', 8],
];

for (const [file, desc, phase] of services) {
  tsStub(`src/services/${file}`, desc, phase);
}

// ─── STORE ────────────────────────────────────────────────────────────────
readme('src/store/README.md', 'Store', 'Zustand v5 state management. Separate store per domain. Zero boilerplate, immer middleware for complex updates.\n\nImplemented across **Phases 2-9**.\n\n**Rules:** Separate create() per store. Use immer for nested updates. Persist middleware for survival across restarts.');
indexStub('src/store/index.ts');
tsStub('src/store/authStore.ts', 'Zustand store for authentication session state.', 5);
tsStub('src/store/enrollmentStore.ts', 'Zustand store for enrollment flow state.', 3);
tsStub('src/store/syncStore.ts', 'Zustand store for sync queue state.', 7);
tsStub('src/store/settingsStore.ts', 'Zustand store for app settings.', 9);
tsStub('src/store/types.ts', 'Type definitions for all Zustand store state shapes and actions.', 2);

// ─── THEME ────────────────────────────────────────────────────────────────
readme('src/theme/README.md', 'Theme', 'Design system tokens: color palette (dark-first), typography, spacing scale, shadows.\n\nImplemented in **Phase 9** (UI Assembly).\n\n**Rules:** All components reference theme tokens. WCAG AA contrast. Changes centralized here only.');
indexStub('src/theme/index.ts');
tsStub('src/theme/colors.ts', 'Color palette definitions for the dark-first design system.', 9);
tsStub('src/theme/typography.ts', 'Typography scale: font sizes, weights, line heights, and font families.', 9);
tsStub('src/theme/spacing.ts', 'Spacing scale based on 4px base unit (4, 8, 12, 16, 24, 32, 48, 64).', 9);
tsStub('src/theme/shadows.ts', 'Shadow presets for elevation levels on iOS and Android.', 9);
tsStub('src/theme/theme.ts', 'Assembled theme object combining colors, typography, spacing, and shadows.', 9);

// ─── TYPES ────────────────────────────────────────────────────────────────
readme('src/types/README.md', 'Types', 'Shared TypeScript type definitions by domain. Pure type files only.\n\nDefined in **Phase 1** (stubs), refined in subsequent phases.\n\n**Rules:** Types only, no runtime values. Prefer interfaces. String enums for debuggability.');
indexStub('src/types/index.ts');
tsStub('src/types/worker.types.ts', 'Type definitions for worker/personnel data models.', 2);
tsStub('src/types/auth.types.ts', 'Type definitions for authentication attempt data structures.', 2);
tsStub('src/types/trust.types.ts', 'Type definitions for trust signals, scores, and decision results.', 5);
tsStub('src/types/liveness.types.ts', 'Type definitions for liveness challenges and detection results.', 4);
tsStub('src/types/device.types.ts', 'Type definitions for device fingerprint data structures.', 6);
tsStub('src/types/location.types.ts', 'Type definitions for GPS coordinates and worksite boundaries.', 6);
tsStub('src/types/sync.types.ts', 'Type definitions for sync queue entries and AWS payload structures.', 7);
tsStub('src/types/audit.types.ts', 'Type definitions for audit log events and compliance records.', 8);
tsStub('src/types/navigation.types.ts', 'Navigation type re-exports from the navigation module.', 9);

// ─── UTILS ────────────────────────────────────────────────────────────────
readme('src/utils/README.md', 'Utilities', 'Pure utility functions: crypto, validation, formatting, geometry, logging, performance.\n\nImplemented across **Phases 2-8**.\n\n**Rules:** Pure functions. Explicit types. Logger stripped in production.');
indexStub('src/utils/index.ts');
tsStub('src/utils/crypto.utils.ts', 'SHA-256 hashing and AES-256 encryption/decryption helpers.', 2);
tsStub('src/utils/validation.utils.ts', 'Zod schema validators for runtime data validation.', 2);
tsStub('src/utils/formatting.utils.ts', 'Date, number, and string formatting utilities using date-fns.', 9);
tsStub('src/utils/geometry.utils.ts', 'Haversine distance calculation and GPS coordinate math.', 6);
tsStub('src/utils/logger.utils.ts', 'Debug logger for development, stripped from production builds.', 2);
tsStub('src/utils/performance.utils.ts', 'Performance timing utilities for ML inference and critical paths.', 8);

// ─── TESTS ────────────────────────────────────────────────────────────────
readme('__tests__/README.md', 'Tests', 'All test suites: unit, integration, and E2E (Detox).\n\nCreated in **Phase 10** (Testing & QA).');
readme('__tests__/unit/README.md', 'Unit Tests', 'Unit tests for individual functions and pure logic. Fast, isolated.\n\nCreated in **Phase 10**.');
gitkeep('__tests__/unit/.gitkeep');
readme('__tests__/integration/README.md', 'Integration Tests', 'Integration tests verifying multiple modules together.\n\nCreated in **Phase 10**.');
gitkeep('__tests__/integration/.gitkeep');
readme('__tests__/e2e/README.md', 'E2E Tests', 'Detox E2E tests on real devices. Complete user flows.\n\nCreated in **Phase 10**.');
gitkeep('__tests__/e2e/.gitkeep');

// ─── SCRIPTS ──────────────────────────────────────────────────────────────
readme('scripts/README.md', 'Scripts', 'Shell scripts for dev workflow: setup, model downloads, type generation.\n\nMaintained throughout all phases.\n\n**Rules:** Idempotent. Check prerequisites. Clear output.');

// ─── DOCS ─────────────────────────────────────────────────────────────────
readme('docs/README.md', 'Documentation', 'Project documentation: architecture, API, database, security, deployment, integration.\n\nUpdated incrementally across all phases.');
mkfile('docs/architecture.md', '# Architecture\n\nSystem architecture document. To be written as the system is built across phases.\n');
mkfile('docs/api.md', '# API Documentation\n\nAPI documentation for AWS sync endpoints. To be written in Phase 7.\n');
mkfile('docs/database.md', '# Database Schema\n\nDatabase schema documentation. To be written in Phase 2.\n');
mkfile('docs/security.md', '# Security\n\nSecurity model documentation: encryption, key management, data protection. To be written in Phase 2.\n');
mkfile('docs/deployment.md', '# Deployment\n\nDeployment guide for Android and iOS builds. To be written in Phase 11.\n');
mkfile('docs/integration.md', '# Datalake 3.0 Integration\n\nGuide for integrating this attendance module into the existing Datalake 3.0 React Native app. To be written in Phase 12.\n');

// ─── SETUP SCRIPTS ───────────────────────────────────────────────────────
mkfile('scripts/setup.sh', `#!/bin/bash
# setup.sh — One-command development environment setup.
# Run this script after cloning the repository.
# Prerequisites: Node.js 18+, npm, Android SDK (for Android), Xcode (for iOS).

set -e

echo "=== NHAI Hackathon — Development Setup ==="

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "ERROR: Node.js 18+ required. Current: $(node -v)"
  exit 1
fi
echo "✓ Node.js $(node -v)"

# Install dependencies
echo "Installing npm dependencies..."
npm install
echo "✓ Dependencies installed"

# Download ML models
echo "Downloading ML models..."
bash scripts/download-models.sh
echo "✓ Models downloaded"

# Setup Husky git hooks
echo "Setting up git hooks..."
npx husky
echo "✓ Git hooks configured"

echo ""
echo "=== Setup complete! ==="
echo "Run 'npm run android' or 'npm run ios' to start the app."
`);

mkfile('scripts/download-models.sh', `#!/bin/bash
# download-models.sh — Downloads MobileFaceNet TFLite model for on-device face recognition.
# This script is idempotent — it will skip download if the model already exists.
# The model is NOT committed to git (it's in .gitignore).

set -e

MODEL_DIR="src/assets/models"
MODEL_FILE="$MODEL_DIR/mobilefacenet.tflite"

echo "=== Downloading ML Models ==="

if [ -f "$MODEL_FILE" ]; then
  echo "✓ MobileFaceNet model already exists at $MODEL_FILE"
  exit 0
fi

mkdir -p "$MODEL_DIR"

# TODO: Replace with actual model download URL in Phase 3
# The MobileFaceNet model will be sourced from an open-source repository.
echo "⚠ Model download URL will be configured in Phase 3."
echo "  Placeholder file created at $MODEL_FILE"
touch "$MODEL_FILE"

echo "=== Model download complete ==="
`);

mkfile('scripts/generate-types.sh', `#!/bin/bash
# generate-types.sh — Future: generates TypeScript types from database schemas.
# This script will be implemented when needed.

echo "Type generation not yet implemented. This script is a Phase 1 placeholder."
`);

// ─── HUSKY ────────────────────────────────────────────────────────────────
mkfile('.husky/pre-commit', `#!/bin/sh
# pre-commit hook — runs lint-staged on all staged files.
# This ensures all committed code passes linting and formatting checks.

npx lint-staged
`);

mkfile('.husky/commit-msg', `#!/bin/sh
# commit-msg hook — runs commitlint to enforce Conventional Commits.
# See .commitlintrc.js for the full rule configuration.

npx --no -- commitlint --edit "$1"
`);

console.log('\n=== All stub files created successfully! ===');
