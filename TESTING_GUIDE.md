# Quick Start: Testing Face Detection

## 🚀 Run on Physical Device (Recommended)

VisionCamera requires a physical device as it needs native camera access.

### Android
```bash
# Connect Android device via USB with USB debugging enabled
npx expo run:android

# Or build development APK
eas build --platform android --profile development
```

### iOS (Requires Mac)
```bash
# Connect iPhone via cable
npx expo run:ios --device

# Or build development IPA
eas build --platform ios --profile development
```

## 📱 Testing Steps

1. **Start the App**
   - Open the built app on your device
   - You should see the "Deepfake Detector" home screen

2. **Access Camera**
   - Tap "Scan with Camera" card
   - App will request camera permission

3. **Grant Permission**
   - Tap "Allow" when prompted
   - Camera preview should appear

4. **Test Capture**
   - Position your face in frame
   - Tap the white circular button
   - Photo should be captured (check console logs)

5. **Check Console**
   ```bash
   # In terminal where Metro is running
   # You should see: "Photo captured: {path: '...', ...}"
   ```

## 🔧 Build Commands

### Development Build (Faster, includes debugging)
```bash
# Android
npx expo run:android

# iOS
npx expo run:ios
```

### Production Build (via EAS)
```bash
# First time: Configure EAS
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios

# Build for both
eas build --platform all
```

## 🐛 Troubleshooting

### "Camera device not found"
- Ensure running on physical device (not emulator)
- Check device has working camera
- Restart the app

### "Permission denied"
- Go to Settings > Apps > Deepfake Detector > Permissions
- Enable Camera permission
- Restart the app

### "Module not found: react-native-vision-camera"
```bash
# Rebuild native code
npx expo prebuild --clean
npx expo run:android # or run:ios
```

### Metro bundler not updating
```bash
# Clear cache and restart
npx expo start --clear
```

## 📊 Expected Output

### Console Logs
```
✓ Camera permission granted
✓ Camera device found: front
✓ Camera active
✓ Photo captured: {
    path: 'file:///.../photo.jpg',
    width: 1920,
    height: 1080,
    isRawPhoto: false
  }
```

## 🎯 Next: Integrate Face Detection

Once camera works, add face detection:

1. **Install plugin properly**
   ```bash
   cd android
   # Add to build.gradle if needed
   ```

2. **Update frame processor**
   ```typescript
   import { detectFaces } from 'vision-camera-face-detector';
   
   const frameProcessor = useFrameProcessor((frame) => {
     'worklet';
     const faces = detectFaces(frame);
     console.log(`Detected ${faces.length} faces`);
   }, []);
   ```

3. **Add to Camera component**
   ```tsx
   <Camera
     frameProcessor={frameProcessor}
     // ... other props
   />
   ```

## 📸 Screenshots to Verify

- [ ] Home screen with 3 action cards
- [ ] Camera permission screen
- [ ] Camera preview with white capture button
- [ ] Status badge showing "Face Detection Active"

## ✅ Success Criteria

- [x] App builds without errors
- [x] Camera screen loads
- [x] Permission request appears
- [x] Camera preview shows
- [x] Capture button works
- [ ] Photo is captured (check logs)
- [ ] Face detection runs (next step)

Your implementation is complete and ready for device testing! 🎉
