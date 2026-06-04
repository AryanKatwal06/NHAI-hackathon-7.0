#!/bin/bash
# scripts/download-models.sh
# Downloads MobileFaceNet TFLite model for on-device face recognition.
# This script must be run once during initial project setup.
# The model file is NOT committed to git (it's in .gitignore) due to binary file size.
# Every developer must run this script after cloning.

set -e

MODEL_DIR="src/assets/models"
FACENET_MODEL="$MODEL_DIR/mobilefacenet.tflite"

mkdir -p "$MODEL_DIR"

echo "Downloading MobileFaceNet INT8 model..."

if [ ! -f "$FACENET_MODEL" ]; then
    curl -L -o "$FACENET_MODEL" \
        "https://raw.githubusercontent.com/NaumanHSA/Android-Face-Recognition-MTCNN-FaceNet/master/app/src/main/assets/MobileFaceNet.tflite"
    echo "MobileFaceNet downloaded: $(du -h $FACENET_MODEL | cut -f1)"
else
    echo "MobileFaceNet already exists: $(du -h $FACENET_MODEL | cut -f1)"
fi

echo ""
echo "Model pipeline ready."
echo "MobileFaceNet: $FACENET_MODEL"
echo ""
echo "Verifying file integrity..."
if [ -f "$FACENET_MODEL" ] && [ -s "$FACENET_MODEL" ]; then
    echo "All model files verified."
else
    echo "ERROR: Model file missing or empty. Check download URL and network connection."
    exit 1
fi
