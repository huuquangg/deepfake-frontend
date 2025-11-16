# EAS Build Troubleshooting for VisionCamera

## Current Issue: Gradle Build Failed

The build is failing during the Gradle phase. This is common with `react-native-vision-camera` due to:
1. New Architecture compatibility issues
2. Missing Kotlin configuration
3. Gradle version conflicts

## ✅ Fixes Applied

1. **Disabled New Architecture** in `app.json`:
   ```json
   "newArchEnabled": false
   ```
   VisionCamera v4 doesn't fully support the New Architecture yet.

## 🔧 Additional Fixes to Try

### Option 1: Add app.config.js (Recommended)

Create `app.config.js` in project root with VisionCamera-specific config:

```javascript
// app.config.js
module.exports = {
  expo: {
    ...require('./app.json').expo,
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
          dark: {
            backgroundColor: '#000000'
          }
        }
      ],
      [
        'react-native-vision-camera',
        {
          cameraPermissionText: '$(PRODUCT_NAME) needs access to your Camera.',
          enableMicrophonePermission: true,
          microphonePermissionText: '$(PRODUCT_NAME) needs access to your Microphone.',
          enableCodeScanner: false
        }
      ]
    ]
  }
};
```

### Option 2: Check Build Logs in Detail

Visit your build page and look for specific errors:
```
https://expo.dev/accounts/huuquangg/projects/deepfake-1801-fe/builds/5462ac8f-b7d1-4a59-a574-8d599dfc0d0a
```

Common errors:
- **Kotlin version mismatch**: Needs Kotlin 1.8.0+
- **minSdkVersion too low**: VisionCamera needs SDK 21+
- **Missing permissions**: Already configured ✅

### Option 3: Update Gradle Settings

If you have local android folder, add to `android/build.gradle`:

```gradle
buildscript {
  ext {
    // Make sure these are set
    kotlinVersion = "1.8.10"
    minSdkVersion = 21
    compileSdkVersion = 34
    targetSdkVersion = 34
  }
}
```

### Option 4: Simplify Dependencies

The `vision-camera-face-detector` plugin might be causing issues. Let's test without it first:

```bash
npm uninstall vision-camera-face-detector
eas build --profile development --platform android
```

## 🎯 Recommended Steps (In Order)

### Step 1: Create app.config.js
```bash
cd /home/huuquangdang/huu.quang.dang/thesis/deepfake-1801-fe
# Create the file shown in Option 1 above
```

### Step 2: Remove face detector temporarily
```bash
npm uninstall vision-camera-face-detector
```

### Step 3: Clean rebuild
```bash
rm -rf android/
npx expo prebuild --clean
```

### Step 4: Try EAS build again
```bash
eas build --profile development --platform android
```

### Step 5: If still failing, check minSdkVersion

The `vision-camera-face-detector` requires higher SDK version. Check if removing it helps.

## 🔍 Debugging Commands

### Check what's installed
```bash
npm list react-native-vision-camera
npm list vision-camera-face-detector
```

### Check Expo config
```bash
npx expo config --type introspect
```

### Check for conflicts
```bash
npm list | grep vision
npm list | grep camera
```

## 🚀 Alternative: Use Expo Camera First

If EAS builds keep failing, you can temporarily use Expo Camera (which doesn't require native builds):

```bash
# Install Expo Camera
npx expo install expo-camera

# Replace VisionCamera imports in camera-screen.tsx
# This works in Expo Go immediately
```

Then switch back to VisionCamera once builds work.

## 📱 Quick Test Option

Since EAS builds are failing, try a local build if you have Android Studio:

```bash
# Set SDK path
export ANDROID_HOME=$HOME/Android/Sdk

# Local build
npx expo run:android
```

## ✅ What Should Work

Once the build succeeds, you'll get:
1. APK file to download
2. Install on Android device
3. Run with: `npx expo start --dev-client`
4. Camera will work with VisionCamera

## 🐛 Common Build Errors & Solutions

| Error | Solution |
|-------|----------|
| Kotlin not found | Add kotlinVersion to gradle |
| minSdkVersion < 21 | Set minSdkVersion = 21 |
| New Architecture error | Set newArchEnabled: false ✅ |
| Face detector error | Remove vision-camera-face-detector |
| Gradle timeout | Run with --clear-cache |

## 📚 Resources

- [VisionCamera Troubleshooting](https://react-native-vision-camera.com/docs/guides/troubleshooting)
- [EAS Build Logs](https://expo.dev/accounts/huuquangg/projects/deepfake-1801-fe/builds)
- [Expo Prebuild](https://docs.expo.dev/workflow/prebuild/)

## Next Steps

Try the steps above in order. Most likely, creating the `app.config.js` file will fix the issue.
