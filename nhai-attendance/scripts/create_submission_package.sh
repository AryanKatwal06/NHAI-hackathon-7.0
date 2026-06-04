#!/bin/bash
set -e

echo "Creating NHAI Hackathon Hackathon Submission Package..."

SUBMISSION_DIR="submission_package"
mkdir -p "$SUBMISSION_DIR"

# 1. Source code (zip the entire project without node_modules, build outputs)
echo "Packaging source code..."
tar -czf "$SUBMISSION_DIR/nhai_hackathon_source_code.tar.gz" \
  --exclude="node_modules" \
  --exclude="android/build" \
  --exclude="android/.gradle" \
  --exclude="android/app/build" \
  --exclude="ios/build" \
  --exclude="ios/Pods" \
  --exclude=".git" \
  --exclude="$SUBMISSION_DIR" \
  .

# 2. APK
if [ -f "android/app/build/outputs/apk/release/app-release.apk" ]; then
  cp android/app/build/outputs/apk/release/app-release.apk "$SUBMISSION_DIR/"
  echo "Release APK included"
elif [ -f "android/app/build/outputs/apk/debug/app-debug.apk" ]; then
  cp android/app/build/outputs/apk/debug/app-debug.apk "$SUBMISSION_DIR/"
  echo "Debug APK included (release APK preferred)"
else
  echo "WARNING: No APK found. Build the APK before submission."
fi

# 3. Documentation
mkdir -p "$SUBMISSION_DIR/docs"
cp docs/architecture.md  "$SUBMISSION_DIR/docs/"
cp docs/database.md      "$SUBMISSION_DIR/docs/"
cp docs/security.md      "$SUBMISSION_DIR/docs/"
cp docs/api.md           "$SUBMISSION_DIR/docs/"
cp docs/integration.md   "$SUBMISSION_DIR/docs/"
cp docs/deployment.md    "$SUBMISSION_DIR/docs/"
cp README.md             "$SUBMISSION_DIR/docs/"

# 4. Presentation outline
mkdir -p "$SUBMISSION_DIR/presentation"
cp docs/PRESENTATION_OUTLINE.md "$SUBMISSION_DIR/presentation/"
cp docs/DEMO_SCRIPT.md          "$SUBMISSION_DIR/presentation/"

echo ""
echo "═══════════════════════════════════════════════════════"
echo "Submission package created: $SUBMISSION_DIR/"
echo ""
echo "Contents:"
ls -lh "$SUBMISSION_DIR/"
echo ""
echo "Next steps:"
echo "1. Build your PowerPoint from presentation/SLIDES_TEMPLATE.md"
echo "2. Add it to the submission package as presentation/NHAI_Attendance_Presentation.pptx"
echo "3. Upload to the hackathon portal"
echo "═══════════════════════════════════════════════════════"
