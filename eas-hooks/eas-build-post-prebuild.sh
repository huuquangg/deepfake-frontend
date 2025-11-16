#!/usr/bin/env bash

set -euo pipefail

echo "🔧 EAS Build Post-Prebuild Hook: Forcing minSdkVersion to 26"

# This runs after expo prebuild but before gradle build
# Modify the generated build.gradle to set minSdkVersion to 26

BUILD_GRADLE="android/build.gradle"

if [ -f "$BUILD_GRADLE" ]; then
  echo "📝 Patching $BUILD_GRADLE to set minSdkVersion = 26..."
  
  # Add ext block with minSdkVersion if it doesn't exist
  if ! grep -q "ext {" "$BUILD_GRADLE"; then
    # Insert after buildscript block
    sed -i '/^apply plugin: "expo-root-project"/i \
ext {\
    minSdkVersion = 26\
    compileSdkVersion = 36\
    targetSdkVersion = 36\
}\
' "$BUILD_GRADLE"
  else
    # Update existing ext block
    sed -i 's/minSdkVersion = [0-9]*/minSdkVersion = 26/g' "$BUILD_GRADLE"
  fi
  
  echo "✅ Applied minSdkVersion = 26 to build.gradle"
else
  echo "⚠️  $BUILD_GRADLE not found, will be generated during build"
fi

# Also update gradle.properties
GRADLE_PROPS="android/gradle.properties"
if [ -f "$GRADLE_PROPS" ]; then
  echo "📝 Updating $GRADLE_PROPS..."
  
  # Remove existing minSdkVersion if present
  sed -i '/^android\.minSdkVersion/d' "$GRADLE_PROPS"
  
  # Add new minSdkVersion
  echo "" >> "$GRADLE_PROPS"
  echo "# Minimum SDK version required for face detection" >> "$GRADLE_PROPS"
  echo "android.minSdkVersion=26" >> "$GRADLE_PROPS"
  
  echo "✅ Updated gradle.properties with minSdkVersion = 26"
fi

echo "✅ Post-prebuild hook completed successfully"
