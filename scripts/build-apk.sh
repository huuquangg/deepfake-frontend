#!/usr/bin/env bash
set -euo pipefail

# build-apk: Run EAS build pipeline for Android APK
# - Ensures EAS CLI is available
# - Runs `eas build` with profile `development` (builds APK via eas.json config)
# - Uses apk buildType as configured in eas.json

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

# Profile: 'development' is configured in eas.json to build APK
PROFILE="development"
PLATFORM="android"

echo "🚀 ==> Starting EAS build for Android (profile: $PROFILE)"
echo "📋 This will build an APK via EAS Cloud Build"

# Check EAS CLI is available
if ! command -v eas >/dev/null 2>&1; then
  echo "📥 EAS CLI not found. Installing eas-cli globally..."
  npm install -g eas-cli
  echo "✅ eas-cli installed"
fi

# Check authentication
echo "🔐 Checking EAS authentication..."
if eas whoami >/dev/null 2>&1; then
  echo "✅ Already logged in to EAS"
else
  echo "⚠️  Not authenticated with EAS. Run: eas login"
  echo "   Then re-run this script."
  exit 1
fi

# Run EAS build
echo "⏳ Submitting build to EAS Cloud..."
if eas build -p $PLATFORM --profile $PROFILE --non-interactive; then
  echo "✅ ==> Build submitted successfully"
  echo "📊 Monitor the build at: https://expo.dev/accounts/<your-account>/projects/<your-project>/builds"
else
  echo "❌ EAS build failed."
  echo "   - Check EAS profile 'development' in eas.json"
  echo "   - Run 'eas login' if not authenticated"
  echo "   - Run 'eas build -p android --profile development' for verbose output"
  exit 1
fi
