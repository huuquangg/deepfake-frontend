# Face Detection Implementation

This document describes the face detection feature implementation using react-native-vision-camera.

## 📦 Dependencies

- `react-native-vision-camera` (v4.7.3): Core camera library
- `vision-camera-face-detector`: Face detection plugin
- `react-native-reanimated` (v4.1.1): For worklets and animations

## 🎯 Features Implemented

### Camera Screen (`app/features/detection/screens/camera-screen.tsx`)
- **Permission Handling**: Requests and manages camera permissions
- **Real-time Camera**: Front-facing camera with live preview
- **Photo Capture**: Take photos for deepfake analysis
- **Loading States**: Proper handling of permission and device loading states
- **UI Overlay**: Capture button and status indicators

### Face Detection Hook (`app/features/detection/hooks/useFaceDetection.ts`)
- **Frame Processor**: Processes camera frames for face detection
- **Face Interface**: Type definitions for detected faces
- **Shared Values**: Uses Reanimated for performance

## 🏗️ Architecture

```
app/features/detection/
├── camera.tsx                 # Route file
├── screens/
│   └── camera-screen.tsx     # Main camera UI
└── hooks/
    └── useFaceDetection.ts   # Face detection logic
```

## 🚀 Usage

### Navigation
From the home screen, tap "Scan with Camera" to open the camera:
```typescript
router.push('/features/detection/camera');
```

### Camera Permissions
The app requests camera permissions automatically on first use. Users can grant permissions through the UI or in system settings.

**iOS**: `NSCameraUsageDescription` in Info.plist
**Android**: `android.permission.CAMERA` in AndroidManifest.xml

### Capturing Photos
1. Open camera screen
2. Position face in frame
3. Tap the white capture button
4. Photo is captured and ready for analysis

## 📱 Platform Configuration

### iOS (app.json)
```json
"ios": {
  "infoPlist": {
    "NSCameraUsageDescription": "Allow $(PRODUCT_NAME) to access your camera",
    "NSMicrophoneUsageDescription": "Allow $(PRODUCT_NAME) to access your microphone for video recording"
  }
}
```

### Android (app.json)
```json
"android": {
  "permissions": [
    "android.permission.CAMERA",
    "android.permission.RECORD_AUDIO"
  ]
}
```

## 🔧 Face Detection Details

### Detected Face Properties
```typescript
interface Face {
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  rollAngle: number;
  pitchAngle: number;
  yawAngle: number;
  leftEyeOpenProbability: number;
  rightEyeOpenProbability: number;
  smilingProbability: number;
}
```

### Frame Processor
The frame processor runs on the camera's frame stream:
```typescript
const frameProcessor = useFrameProcessor((frame) => {
  'worklet';
  // Process each frame for face detection
}, []);
```

## 🎨 UI Components

### Permission Screen
- Displays when camera permission is not granted
- Icon, title, description, and grant button
- Uses themed components for light/dark mode

### Camera View
- Full-screen camera preview
- Status badge at top
- Large circular capture button at bottom
- Loading indicator during capture

### Styles
- Uses `StyleSheet.absoluteFill` for full-screen camera
- Overlay with transparent background
- Material Design-inspired capture button
- Responsive to light/dark mode

## 🔮 Future Enhancements

### Phase 1: Enhanced Detection
- [ ] Integrate full face detection plugin
- [ ] Draw face bounding boxes on camera preview
- [ ] Show confidence scores in real-time
- [ ] Multi-face detection support

### Phase 2: Video Recording
- [ ] Add video recording capability
- [ ] Process video frames for deepfake detection
- [ ] Save recordings for later analysis
- [ ] Export analyzed videos

### Phase 3: Analysis
- [ ] Send captured photos to backend API
- [ ] Display deepfake probability
- [ ] Show detailed analysis results
- [ ] Save results to history

### Phase 4: Advanced Features
- [ ] Front/back camera toggle
- [ ] Flash control
- [ ] Zoom controls
- [ ] Grid overlay
- [ ] Manual focus
- [ ] Exposure control

## 🐛 Troubleshooting

### Camera Not Loading
1. Check device has physical camera
2. Verify permissions are granted
3. Restart the app
4. Check for native build issues

### Permission Issues
- iOS: Check Info.plist has camera usage description
- Android: Check AndroidManifest.xml has camera permission
- Both: Verify app has permission in system settings

### Build Errors
```bash
# Clean and rebuild
cd android && ./gradlew clean
cd ios && pod install
npx expo prebuild --clean
```

### Frame Processor Not Working
- Ensure react-native-reanimated is properly configured
- Check Babel configuration includes reanimated plugin
- Verify worklet syntax is correct

## 📚 References

- [VisionCamera Documentation](https://react-native-vision-camera.com/docs/guides)
- [Frame Processors Guide](https://react-native-vision-camera.com/docs/guides/frame-processors)
- [Face Detection Plugin](https://github.com/rodgomesc/vision-camera-face-detector)
- [Reanimated Worklets](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/glossary#worklet)

## 🎓 Key Learnings

1. **Permission Handling**: Always check and request permissions before using camera
2. **Performance**: Use worklets for frame processing to avoid blocking UI
3. **Lifecycle**: Camera must be inactive when app is backgrounded
4. **Platform Differences**: Handle iOS and Android permission strings separately
5. **Error Handling**: Gracefully handle device not found, permission denied, etc.

## ✅ Testing Checklist

- [ ] Camera loads on first open
- [ ] Permission request appears
- [ ] Grant permission works
- [ ] Deny permission shows error
- [ ] Capture button works
- [ ] Photo is captured successfully
- [ ] Camera stops when navigating away
- [ ] Works on iOS
- [ ] Works on Android
- [ ] Light mode UI looks good
- [ ] Dark mode UI looks good
