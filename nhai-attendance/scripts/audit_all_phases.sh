#!/usr/bin/env bash
# scripts/audit_all_phases.sh
# Comprehensive audit script — Verifies all Phase 1, 2, and 3 deliverables.
# Run from project root: bash scripts/audit_all_phases.sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASS=0
FAIL=0
WARN=0

check() {
  local description="$1"
  local condition="$2"
  if eval "$condition"; then
    echo -e "  ${GREEN}✓${NC} $description"
    PASS=$((PASS + 1))
  else
    echo -e "  ${RED}✗${NC} $description"
    FAIL=$((FAIL + 1))
  fi
}

warn_check() {
  local description="$1"
  local condition="$2"
  if eval "$condition"; then
    echo -e "  ${GREEN}✓${NC} $description"
    PASS=$((PASS + 1))
  else
    echo -e "  ${YELLOW}⚠${NC} $description (optional)"
    WARN=$((WARN + 1))
  fi
}

echo "=============================================="
echo "  NHAI Hackathon — Full Phase Audit"
echo "=============================================="
echo ""

# ── PHASE 1: DATABASE ──────────────────────────────────────────
echo "── Phase 1: Database (8 Tables) ──"
check "Migration file exists" "test -f src/db/migrations/v1_initial.ts"
check "Database connection" "test -f src/db/connection.ts"
check "workers.repository" "test -f src/db/repositories/workers.repository.ts"
check "authRecords.repository" "test -f src/db/repositories/authRecords.repository.ts"
check "syncQueue.repository" "test -f src/db/repositories/syncQueue.repository.ts"
check "enrollmentPhotos.repository" "test -f src/db/repositories/enrollmentPhotos.repository.ts"
check "auditLogs.repository" "test -f src/db/repositories/auditLogs.repository.ts"
check "deviceRegistry.repository" "test -f src/db/repositories/deviceRegistry.repository.ts"
echo ""

# ── PHASE 1: ML PIPELINE ──────────────────────────────────────
echo "── Phase 1: ML Pipeline ──"
check "MobileFaceNet loader" "test -f src/ml/faceRecognition.ts"
check "Liveness detection" "test -f src/ml/livenessDetection.ts"
check "Embedding utilities" "test -f src/ml/embeddingUtils.ts"
warn_check "Model file exists (>100KB)" "test -f src/assets/models/mobilefacenet.tflite && test $(wc -c < src/assets/models/mobilefacenet.tflite) -gt 100000"
echo ""

# ── PHASE 2: SERVICES ─────────────────────────────────────────
echo "── Phase 2: Services ──"
check "AuthenticationService" "test -f src/services/AuthenticationService.ts"
check "DeviceTrustService" "test -f src/services/DeviceTrustService.ts"
check "LocationService" "test -f src/services/LocationService.ts"
check "BehavioralService" "test -f src/services/BehavioralService.ts"
check "TrustScoreService" "test -f src/services/TrustScoreService.ts"
check "SyncService" "test -f src/services/SyncService.ts"
check "OfflineSyncService" "test -f src/services/OfflineSyncService.ts"
check "PurgeService (not stub)" "grep -q 'purgeCompletedSyncRecords' src/services/PurgeService.ts"
check "AuditService" "test -f src/services/AuditService.ts"
echo ""

# ── PHASE 2: STORES ───────────────────────────────────────────
echo "── Phase 2: Zustand Stores ──"
check "authStore" "test -f src/store/authStore.ts"
check "enrollmentStore" "test -f src/store/enrollmentStore.ts"
check "syncStore" "test -f src/store/syncStore.ts"
check "settingsStore" "test -f src/store/settingsStore.ts"
echo ""

# ── PHASE 2: HOOKS ─────────────────────────────────────────────
echo "── Phase 2: Hooks ──"
check "useCamera" "test -f src/hooks/useCamera.ts"
check "useFaceDetection" "test -f src/hooks/useFaceDetection.ts"
check "useLivenessDetection" "test -f src/hooks/useLivenessDetection.ts"
check "useLocation" "test -f src/hooks/useLocation.ts"
check "useDeviceInfo" "test -f src/hooks/useDeviceInfo.ts"
check "useNetworkStatus" "test -f src/hooks/useNetworkStatus.ts"
check "useTrustScore" "test -f src/hooks/useTrustScore.ts"
check "useAuthentication" "test -f src/hooks/useAuthentication.ts"
echo ""

# ── PHASE 2: UTILITIES ────────────────────────────────────────
echo "── Phase 2: Utilities ──"
check "formatting.utils (not stub)" "grep -q 'formatRelativeTime' src/utils/formatting.utils.ts"
check "geometry.utils (not stub)" "grep -q 'haversineDistance' src/utils/geometry.utils.ts"
check "validation.utils (not stub)" "grep -q 'WorkerProfileSchema' src/utils/validation.utils.ts"
check "crypto.utils" "test -f src/utils/crypto.utils.ts"
echo ""

# ── PHASE 3: SCREENS ──────────────────────────────────────────
echo "── Phase 3: All 10 Screens ──"
check "SplashScreen" "test -f src/screens/SplashScreen/SplashScreen.tsx"
check "LoginScreen" "test -f src/screens/LoginScreen/LoginScreen.tsx"
check "AuthenticationScreen" "test -f src/screens/AuthenticationScreen/AuthenticationScreen.tsx"
check "LivenessScreen" "test -f src/screens/LivenessScreen/LivenessScreen.tsx"
check "ResultsScreen" "test -f src/screens/ResultsScreen/ResultsScreen.tsx"
check "EnrollmentScreen" "test -f src/screens/EnrollmentScreen/EnrollmentScreen.tsx"
check "SupervisorDashboard" "test -f src/screens/SupervisorDashboard/SupervisorDashboard.tsx"
check "PendingSyncScreen" "test -f src/screens/PendingSyncScreen/PendingSyncScreen.tsx"
check "SettingsScreen" "test -f src/screens/SettingsScreen/SettingsScreen.tsx"
check "AuditLogsScreen" "test -f src/screens/AuditLogsScreen/AuditLogsScreen.tsx"
echo ""

# ── THEME SYSTEM ───────────────────────────────────────────────
echo "── Theme System ──"
check "ThemeProvider" "test -f src/theme/ThemeProvider.tsx"
check "DarkColors + LightColors" "grep -q 'DarkColors' src/theme/colors.ts && grep -q 'LightColors' src/theme/colors.ts"
check "useTheme hook" "grep -q 'useTheme' src/theme/ThemeProvider.tsx"
check "Screens use useTheme()" "grep -rq 'useTheme' src/screens/"
echo ""

# ── UI COMPONENTS ──────────────────────────────────────────────
echo "── UI Components ──"
check "Button" "test -f src/components/common/Button/Button.tsx"
check "Card" "test -f src/components/common/Card/Card.tsx"
check "GlassCard" "test -f src/components/common/GlassCard/GlassCard.tsx"
check "GradientButton" "test -f src/components/common/GradientButton/GradientButton.tsx"
check "LoadingOverlay" "test -f src/components/common/LoadingOverlay/LoadingOverlay.tsx"
check "StatusBadge" "test -f src/components/common/StatusBadge/StatusBadge.tsx"
check "ThemeToggle" "test -f src/components/common/ThemeToggle/ThemeToggle.tsx"
check "Typography" "test -f src/components/common/Typography/Typography.tsx"
check "TrustScoreRing" "test -f src/components/trust/TrustScoreRing/TrustScoreRing.tsx"
check "ScoreBreakdown" "test -f src/components/trust/ScoreBreakdown/ScoreBreakdown.tsx"
echo ""

# ── NAVIGATION ─────────────────────────────────────────────────
echo "── Navigation ──"
check "RootNavigator" "test -f src/navigation/RootNavigator.tsx"
check "Navigation types" "test -f src/navigation/types.ts"
check "Route constants" "test -f src/constants/navigation.constants.ts"
echo ""

# ── AWS TEMPLATES ──────────────────────────────────────────────
echo "── AWS Templates ──"
check "SAM template" "test -f aws/template.yaml"
check "Sync Lambda" "test -f aws/functions/sync/index.js"
check "Status Lambda" "test -f aws/functions/status/index.js"
check "GetAttendance Lambda" "test -f aws/functions/getAttendance/index.js"
echo ""

# ── E2E TEST SCENARIOS ─────────────────────────────────────────
echo "── E2E Test Scenarios ──"
check "Scenario 1: Legitimate User" "test -f __tests__/e2e/scenario1_legitimateUser.e2e.ts"
check "Scenario 2: Photo Attack" "test -f __tests__/e2e/scenario2_photoAttack.e2e.ts"
check "Scenario 3: Wrong Device" "test -f __tests__/e2e/scenario3_wrongDevice.e2e.ts"
check "Scenario 4: Wrong Location" "test -f __tests__/e2e/scenario4_wrongLocation.e2e.ts"
check "Scenario 5: Signal Contradiction" "test -f __tests__/e2e/scenario5_signalContradiction.e2e.ts"
echo ""

# ── MOCK SYNC ──────────────────────────────────────────────────
echo "── Mock Sync Fallback ──"
check "OfflineSyncService exists" "test -f src/services/OfflineSyncService.ts"
check "SyncService imports OfflineSyncService" "grep -q 'OfflineSyncService' src/services/SyncService.ts"
check "SyncService checks AWS_API_GATEWAY_URL" "grep -q 'USE_REAL_AWS' src/services/SyncService.ts"
echo ""

# ── SUMMARY ────────────────────────────────────────────────────
echo "=============================================="
echo "  AUDIT SUMMARY"
echo "=============================================="
echo -e "  ${GREEN}PASSED:${NC}  $PASS"
echo -e "  ${RED}FAILED:${NC}  $FAIL"
echo -e "  ${YELLOW}OPTIONAL:${NC} $WARN"
echo ""

if [ $FAIL -eq 0 ]; then
  echo -e "  ${GREEN}★ ALL REQUIRED CHECKS PASSED ★${NC}"
  exit 0
else
  echo -e "  ${RED}✗ $FAIL CHECKS FAILED — FIX BEFORE DEPLOYMENT${NC}"
  exit 1
fi
