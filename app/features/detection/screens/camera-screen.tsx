import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useIsFocused } from '@react-navigation/native';
import * as FaceDetector from 'expo-face-detector';
import * as FileSystem from 'expo-file-system/legacy';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { Camera, useCameraDevice, useCameraPermission, useFrameProcessor } from 'react-native-vision-camera';

interface DetectedFace {
  bounds: {
    origin: { x: number; y: number };
    size: { width: number; height: number };
  };
  rollAngle?: number;
  yawAngle?: number;
  smilingProbability?: number;
  leftEyeOpenProbability?: number;
  rightEyeOpenProbability?: number;
}

// Local storage configuration
const SAVE_DIRECTORY = '/home/huuquangdang/huu.quang.dang/thesis/deepfake-1801-fe/assets/test';
const DETECTION_INTERVAL = 500; // Detect faces every 500ms

export default function CameraScreen() {
  const device = useCameraDevice('front');
  const { hasPermission, requestPermission } = useCameraPermission();
  const camera = useRef<Camera>(null);
  const isFocused = useIsFocused();
  const colorScheme = useColorScheme();
  const [isActive, setIsActive] = useState(true);
  const [faceCount, setFaceCount] = useState(0);
  const lastDetectionTime = useRef(0);

  const faces = useSharedValue<DetectedFace[]>([]);

  // Function to detect faces from image URI
  const detectFacesFromUri = async (uri: string) => {
    try {
      const result = await FaceDetector.detectFacesAsync(uri, {
        mode: FaceDetector.FaceDetectorMode.fast,
        detectLandmarks: FaceDetector.FaceDetectorLandmarks.none,
        runClassifications: FaceDetector.FaceDetectorClassifications.all,
      });
      return result.faces;
    } catch (error) {
      console.error('Face detection error:', error);
      return [];
    }
  };

  // Function to save frame and detect faces
  const processFrame = async (frameUri: string) => {
    const now = Date.now();

    // Throttle detection
    if (now - lastDetectionTime.current < DETECTION_INTERVAL) {
      return;
    }
    lastDetectionTime.current = now;

    // Detect faces
    const detectedFaces = await detectFacesFromUri(frameUri);

    // Update faces for overlay
    faces.value = detectedFaces;
    setFaceCount(detectedFaces.length);
  };

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';

    // For real-time detection, we need to save the frame as image first
    // This is a workaround since expo-face-detector works with URIs
    // In production, you'd want to use a native face detection that works with frames directly

  }, []);

  // Real-time face detection using interval
  useEffect(() => {
    if (!isActive || !isFocused || !camera.current) return;

    const interval = setInterval(async () => {
      try {
        if (camera.current) {
          const photo = await camera.current.takeSnapshot({
            quality: 50, // Lower quality for faster processing
          });
          // Detect faces
          const detectedFaces = await detectFacesFromUri(`file://${photo.path}`);
          faces.value = detectedFaces;
          setFaceCount(detectedFaces.length);
          // Clean up snapshot
          await FileSystem.deleteAsync(`file://${photo.path}`, { idempotent: true });
        }
      } catch (error) {
        // Silently fail - snapshots might fail during transitions
      }
    }, DETECTION_INTERVAL);

    return () => clearInterval(interval);
  }, [isActive, isFocused]);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  useEffect(() => {
    setIsActive(isFocused);
  }, [isFocused]);

  if (!hasPermission) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.permissionContainer}>
          <IconSymbol name="exclamationmark.triangle.fill" size={64} color="#ff3b30" />
          <ThemedText type="title" style={styles.permissionTitle}>
            Camera Permission Required
          </ThemedText>
          <ThemedText style={styles.permissionText}>
            This app needs camera access to detect deepfakes in photos and videos.
          </ThemedText>
          <Pressable
            style={[styles.button, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
            onPress={requestPermission}>
            <Text style={styles.buttonText}>Grant Permission</Text>
          </Pressable>
        </ThemedView>
      </ThemedView>
    );
  }

  if (!device) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.permissionContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
          <ThemedText type="title" style={styles.permissionTitle}>
            Loading Camera...
          </ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isActive && isFocused}
        photo={true}
        frameProcessor={frameProcessor}
      />

      {/* <FaceOverlay faces={faces} /> */}

      <View style={styles.overlay}>
        <View style={styles.topBar}>
          <ThemedView style={styles.badge}>
            <ThemedText style={styles.badgeText}>
              {faceCount > 0 ? `${faceCount} Face${faceCount > 1 ? 's' : ''} Detected` : 'Scanning...'}
            </ThemedText>
          </ThemedView>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  permissionTitle: {
    textAlign: 'center',
    marginTop: 16,
  },
  permissionText: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 16,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  topBar: {
    padding: 16,
    alignItems: 'center',
    paddingTop: 60,
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(52, 199, 89, 0.9)',
  },
  badgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomBar: {
    padding: 32,
    alignItems: 'center',
    paddingBottom: 48,
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
  },
});
