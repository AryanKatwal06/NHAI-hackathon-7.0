#!/bin/bash
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
