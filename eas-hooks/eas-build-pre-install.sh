#!/usr/bin/env bash

set -euo pipefail

echo "🔧 EAS Build Hook: Ensuring minSdkVersion is set to 26 for face detection compatibility"

# Ensure the app.json has minSdkVersion set
if command -v jq &> /dev/null; then
  echo "📝 Verifying minSdkVersion in app.json..."
  jq '.expo.android.minSdkVersion = 26' app.json > app.json.tmp && mv app.json.tmp app.json
  echo "✅ minSdkVersion set to 26 in app.json"
else
  echo "⚠️  jq not available, relying on existing app.json configuration"
fi

echo "✅ Pre-install hook completed"

