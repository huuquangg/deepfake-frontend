#!/usr/bin/env bash
set -euo pipefail

# Build-all: development build workflow
# - Installs deps (if needed)
# - Runs lint checks (warnings only)
# - Runs TypeScript type check
# - Runs Expo prebuild to prepare native directories
# - Optionally runs Android emulator/device build

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "📦 ==> Starting dev build (build-all)"

# Install deps if node_modules missing
if [ ! -d node_modules ]; then
  echo "📥 node_modules not found — installing dependencies..."
  npm ci || npm install
else
  echo "✅ node_modules found — skipping install"
fi

# Lint (best-effort, warnings only)
echo "📝 Running lint..."
if npm run lint 2>&1 | head -50; then
  echo "✅ Lint passed"
else
  echo "⚠️  Lint warnings detected (continuing)"
fi

# Type check with TypeScript
echo "🔍 Running TypeScript type check..."
if npx tsc --noEmit; then
  echo "✅ Type check passed"
else
  echo "⚠️  Type check reported warnings (continuing)"
fi

# Prebuild native projects
echo "🔨 Preparing native project (expo prebuild --no-install)..."
if npx expo prebuild --no-install; then
  echo "✅ Prebuild complete"
else
  echo "⚠️  Prebuild failed or not needed (continuing)"
fi

# Run Android build if available
echo "📱 Running Android dev build..."
if npm run android; then
  echo "✅ Android build complete"
else
  echo "⚠️  Android build failed — ensure Android SDK/emulator is configured"
  echo "   Or you can run the dev client manually with: npm start"
fi

echo "✅ ==> Dev build (build-all) finished"
