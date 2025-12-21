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
import { DetectionResult, socketService } from '../../../services/video-streaming/socket.service';
import { STREAMING_CONFIG } from '../../../services/video-streaming/streaming-config';
import { videoStreamingService } from '../../../services/video-streaming/video-streaming.service';

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

// Configuration
const DETECTION_INTERVAL = 500; // Detect faces every 500ms
const INGEST_THROTTLE = 1000; // Send frame to server every 1 second when face detected
const SESSION_ID = STREAMING_CONFIG.DEFAULT_SESSION_ID;

export default function CameraScreen() {
  const device = useCameraDevice('front');
  const { hasPermission, requestPermission } = useCameraPermission();
  const camera = useRef<Camera>(null);
  const isFocused = useIsFocused();
  const colorScheme = useColorScheme();
  const [isActive, setIsActive] = useState(true);
  const [faceCount, setFaceCount] = useState(0);
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const lastDetectionTime = useRef(0);
  const lastIngestTime = useRef(0);

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

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    // For real-time detection, we need to save the frame as image first
    // This is a workaround since expo-face-detector works with URIs
    // In production, you'd want to use a native face detection that works with frames directly
  }, []);

  // Socket.IO connection management
  useEffect(() => {
    if (!isFocused) return;

    console.log('🔌 Setting up Socket.IO connection...');
    
    // Connect to Socket.IO and listen for results
    socketService.connect(SESSION_ID, (result: DetectionResult) => {
      console.log('📊 Detection result received in UI:', result);
      setDetectionResult(result);
    });

    setIsSocketConnected(socketService.isConnected());

    // Check connection status periodically
    const statusInterval = setInterval(() => {
      setIsSocketConnected(socketService.isConnected());
    }, 2000);

    return () => {
      console.log('🔌 Cleaning up Socket.IO connection...');
      clearInterval(statusInterval);
      socketService.disconnect();
      setIsSocketConnected(false);
    };
  }, [isFocused]);

  // Real-time face detection and frame ingestion
  useEffect(() => {
    if (!isActive || !isFocused || !camera.current) return;

    const interval = setInterval(async () => {
      try {
        if (camera.current) {
          const photo = await camera.current.takeSnapshot({
            quality: 50, // Lower quality for faster processing
          });
          
          const photoUri = `file://${photo.path}`;
          
          // Detect faces
          const detectedFaces = await detectFacesFromUri(photoUri);
          faces.value = detectedFaces;
          setFaceCount(detectedFaces.length);
          
          // If face detected, send frame to server for deepfake analysis
          const now = Date.now();
          if (detectedFaces.length > 0 && now - lastIngestTime.current >= INGEST_THROTTLE) {
            lastIngestTime.current = now;
            
            console.log('👤 Face detected! Sending frame to server...');
            
            // Send frame to backend (don't await to avoid blocking)
            videoStreamingService.ingestFrame({
              sessionId: SESSION_ID,
              frameUri: photoUri,
            }).catch((error: any) => {
              console.error('Failed to ingest frame:', error);
            });
          }
          
          // Clean up snapshot after a small delay (to allow upload to complete)
          setTimeout(async () => {
            try {
              await FileSystem.deleteAsync(photoUri, { idempotent: true });
            } catch (e) {
              // Ignore cleanup errors
            }
          }, 500);
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
          {/* <ThemedView style={styles.badge}>
            <ThemedText style={styles.badgeText}>
              {faceCount > 0 ? `${faceCount} Face${faceCount > 1 ? 's' : ''} Detected` : 'Scanning...'}
            </ThemedText>
          </ThemedView> */}
          
          {/* Socket connection status */}
          {/* <ThemedView style={[styles.badge, styles.socketBadge, isSocketConnected ? styles.socketConnected : styles.socketDisconnected]}>
            <ThemedText style={styles.badgeText}>
              {isSocketConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </ThemedText>
          </ThemedView> */}
          
          {/* Detection result (Option B: backend prediction payload) */}
          {detectionResult && (
            <ThemedView style={[
              styles.resultBadge,
              detectionResult.label === 'REAL' ? styles.resultReal : 
              detectionResult.label === 'FAKE' ? styles.resultFake : 
              styles.resultUnknown
            ]}>
              <ThemedText style={styles.resultLabel}>
                {detectionResult.label === 'REAL' ? '✅ REAL' : 
                 detectionResult.label === 'FAKE' ? '⚠️ FAKE' : 
                 '❓ UNKNOWN'}
              </ThemedText>
              <ThemedText style={styles.resultConfidence}>
                {(detectionResult.confidence * 100).toFixed(1)}% confidence
              </ThemedText>
              <ThemedText style={styles.resultStats}>
                Real: {(detectionResult.probReal * 100).toFixed(1)}% | Fake: {(detectionResult.probFake * 100).toFixed(1)}%
              </ThemedText>
              {/* <ThemedText style={styles.resultMeta}>
                Batch: {detectionResult.batchId} | {detectionResult.inferenceMs}ms
              </ThemedText> */}
            </ThemedView>
          )}
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
    marginBottom: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  socketBadge: {
    backgroundColor: 'rgba(0, 122, 255, 0.9)',
  },
  socketConnected: {
    backgroundColor: 'rgba(52, 199, 89, 0.9)',
  },
  socketDisconnected: {
    backgroundColor: 'rgba(255, 59, 48, 0.9)',
  },
  resultBadge: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  resultReal: {
    backgroundColor: 'rgba(52, 199, 89, 0.95)',
  },
  resultFake: {
    backgroundColor: 'rgba(255, 59, 48, 0.95)',
  },
  resultUnknown: {
    backgroundColor: 'rgba(255, 149, 0, 0.95)',
  },
  resultLabel: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  resultConfidence: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.9,
    marginBottom: 4,
  },
  resultStats: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.85,
    marginBottom: 2,
  },
  resultMeta: {
    color: '#fff',
    fontSize: 10,
    opacity: 0.7,
  },
  resultMessage: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
    opacity: 0.8,
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
