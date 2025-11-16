# Building the App with Native Camera Support

## ⚠️ Issue: Expo Go Limitation

`react-native-vision-camera` requires native code and **CANNOT** run in Expo Go. You have 3 options:

## Option 1: EAS Build (Recommended - Easiest)

Build a development client in the cloud:

### 1. Login to Expo
```bash
npx eas login
# Or create account: npx eas register
```

### 2. Configure EAS
```bash
cd /home/huuquangdang/huu.quang.dang/thesis/deepfake-1801-fe
eas build:configure
```

### 3. Build Development Client
```bash
# For Android
eas build --profile development --platform android

# After build completes, download and install the APK on your device
```

### 4. Run Development Server
```bash
npx expo start --dev-client
# Scan QR code with the development build app
```

## Option 2: Local Android Build

If you have Android Studio installed:

### 1. Set Android SDK Path
```bash
# Find your SDK location (usually one of these):
# - ~/Android/Sdk
# - ~/Library/Android/sdk (Mac)
# - C:\Users\<username>\AppData\Local\Android\Sdk (Windows)

# Set environment variable
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Add to ~/.bashrc or ~/.zshrc to make permanent
echo 'export ANDROID_HOME=$HOME/Android/Sdk' >> ~/.bashrc
echo 'export PATH=$PATH:$ANDROID_HOME/platform-tools' >> ~/.bashrc
source ~/.bashrc
```

### 2. Install Android SDK (if not installed)
```bash
# Download Android Studio from:
# https://developer.android.com/studio

# Or use sdkmanager (if installed):
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
```

### 3. Build and Run
```bash
npx expo run:android
# Connect Android device via USB or start emulator
```

## Option 3: Use Expo Camera (Alternative)

If you want to test quickly without building, temporarily use Expo Camera instead:

### Install Expo Camera
```bash
npx expo install expo-camera
```

### Create Alternative Camera Screen
```typescript
// app/features/detection/screens/camera-screen-expo.tsx
import { Camera, CameraType } from 'expo-camera';
import { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function CameraScreen() {
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [type, setType] = useState(CameraType.front);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text>We need camera permission</Text>
        <Button onPress={requestPermission} title="Grant permission" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} type={type}>
        <View style={styles.buttonContainer}>
          <Button title="Take Photo" onPress={() => {}} />
        </View>
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  buttonContainer: { 
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center'
  },
});
```

## 📱 Quick Solution: Use EAS Build

**Most developers use EAS Build for this:**

```bash
# 1. Login
npx eas login

# 2. Build development app
eas build --profile development --platform android

# 3. Download APK from build page
# 4. Install on your Android device
# 5. Run: npx expo start --dev-client
```

## 🐛 Troubleshooting Android SDK

### Find SDK Location
```bash
# Check if Android Studio is installed
ls ~/Android/Sdk
ls ~/Library/Android/sdk
ls /usr/local/android-sdk

# Or check in Android Studio:
# Tools > SDK Manager > Android SDK Location
```

### Install SDK via Command Line
```bash
# Install sdkmanager
wget https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip
unzip commandlinetools-linux-9477386_latest.zip -d ~/android-sdk
cd ~/android-sdk/cmdline-tools
mkdir latest
mv bin lib NOTICE.txt source.properties latest/

# Install platform tools
./latest/bin/sdkmanager "platform-tools" "platforms;android-34"
```

## ✅ Recommended Workflow

For development with native modules like VisionCamera:

1. **Use EAS Build** for development client (one-time ~15 min build)
2. **Install development APK** on your device
3. **Use `expo start --dev-client`** for fast refresh
4. **No need to rebuild** unless changing native code

## 📚 Resources

- [Expo Development Builds](https://docs.expo.dev/develop/development-builds/introduction/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [Android Studio](https://developer.android.com/studio)
- [VisionCamera Setup](https://react-native-vision-camera.com/docs/guides)

## 🎯 Next Steps

Choose your path:

**Fast & Cloud (Recommended):**
```bash
eas build --profile development --platform android
```

**Local with Android Studio:**
```bash
# Install Android Studio first
export ANDROID_HOME=~/Android/Sdk
npx expo run:android
```

**Quick Test (Temporary):**
```bash
# Use expo-camera instead
npx expo install expo-camera
# Modify camera-screen.tsx to use expo-camera
```
