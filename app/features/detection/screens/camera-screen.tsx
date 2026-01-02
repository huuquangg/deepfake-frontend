import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useIsFocused } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system/legacy';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { DetectionResult, socketService } from '../../../services/video-streaming/socket.service';
import { STREAMING_CONFIG } from '../../../services/video-streaming/streaming-config';
import { createWebRTCService, WebRTCService } from '../../../services/video-streaming/webrtc.service';

// Configuration
const SESSION_ID = STREAMING_CONFIG.DEFAULT_SESSION_ID;

export default function CameraScreen() {
  const router = useRouter();
  const isFocused = useIsFocused();
  const colorScheme = useColorScheme();
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [webrtcConnectionState, setWebrtcConnectionState] = useState<string>('disconnected');
  const [frameCount, setFrameCount] = useState<number>(0);
  const webrtcService = useRef<WebRTCService | null>(null);
  const cameraRef = useRef<Camera>(null);
  const captureIntervalRef = useRef<any>(null);
  const frameCounter = useRef<number>(0);
  const processingQueue = useRef<number>(0); // Track frames in processing pipeline
  const fakeDetectionStartTime = useRef<number | null>(null);
  const alertShown = useRef<boolean>(false);
  const realDetectionStartTime = useRef<number | null>(null);
  const successNavigated = useRef<boolean>(false);
  
  // Vision Camera setup
  const device = useCameraDevice('front');
  const { hasPermission, requestPermission } = useCameraPermission();

  // Capture and send frames using takePhoto (truly non-blocking)
  const captureAndSendFrame = () => {
    // Skip if too many frames are already processing (max 2 in pipeline)
    if (processingQueue.current >= 2) {
      return;
    }

    // Check if camera is still active and frames channel is ready
    if (!cameraRef.current || 
        !webrtcService.current?.isFramesChannelReady() || 
        !isFocused ||
        !captureIntervalRef.current) {
      return;
    }

    // Process frame asynchronously without blocking the capture loop
    processingQueue.current++;
    const frameNum = frameCounter.current++;
    const startTime = Date.now();

    // Launch async processing pipeline (non-blocking)
    (async () => {
      try {
        const photo = await cameraRef.current!.takePhoto({
          enableShutterSound: false,
        });
        const captureTime = Date.now() - startTime;

        // Process and send in parallel pipeline
        const resized = await manipulateAsync(
          'file://' + photo.path,
          [{ resize: { width: 320 } }],
          { compress: 0.5, format: SaveFormat.JPEG }
        );
        const resizeTime = Date.now() - startTime - captureTime;

        const base64 = await FileSystem.readAsStringAsync(resized.uri, {
          encoding: 'base64',
        });
        const readTime = Date.now() - startTime - captureTime - resizeTime;

        // Send immediately
        webrtcService.current!.sendFrame(base64).catch(() => {});
        const totalTime = Date.now() - startTime;
        
        // Log every 30 frames
        if (frameNum % 30 === 0) {
          const sizeKB = (base64.length / 1024).toFixed(1);
          // console.log(`📸 Frame ${frameNum} | ${sizeKB}KB | Time: ${totalTime}ms (capture:${captureTime}ms resize:${resizeTime}ms read:${readTime}ms)`);
          setFrameCount(frameNum);
        }
      } catch (error: any) {
        // Silent failure for closed camera
      } finally {
        processingQueue.current--;
      }
    })();
  };

  // Start frame capture
  const startFrameCapture = () => {
    if (captureIntervalRef.current) return;
    
    // console.log('🎬 Starting frame capture at 30 FPS (real-time)');
    captureIntervalRef.current = setInterval(() => {
      captureAndSendFrame();
    }, 33); // 30 FPS (33.33ms per frame)
  };

  // Stop frame capture
  const stopFrameCapture = () => {
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
      // console.log(`🎬 Frame capture stopped. Total: ${frameCounter.current}`);
    }
  };

  // WebRTC connection management
  useEffect(() => {
    if (!isFocused) return;

    const initializeWebRTC = async () => {
      try {
        // console.log('🚀 Initializing WebRTC signaling...');
        
        webrtcService.current = createWebRTCService({
          sessionId: SESSION_ID,
          onConnectionStateChange: (state) => {
            setWebrtcConnectionState(state);
          },
          onICEConnectionStateChange: (state) => {
          },
          onFramesChannelOpen: () => {
            frameCounter.current = 0;
            startFrameCapture();
          },
          onError: (error) => {
            setWebrtcConnectionState('failed');
            Alert.alert(
              'WebRTC Error',
              error.message,
              [{ text: 'OK' }]
            );
          },
        });

        // Initialize signaling connection (data channels only, no media tracks)
        await webrtcService.current.initializeConnection();
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        Alert.alert(
          'WebRTC Error',
          `Failed to establish connection: ${errorMessage}`,
          [{ text: 'OK' }]
        );
        setWebrtcConnectionState('failed');
      }
    };

    initializeWebRTC();

    return () => {
      stopFrameCapture();
      if (webrtcService.current) {
        webrtcService.current.close();
        webrtcService.current = null;
      }
      setFrameCount(0);
      setWebrtcConnectionState('disconnected');
    };
  }, [isFocused]);

  // Socket.IO connection management for receiving predictions
  useEffect(() => {
    if (!isFocused) return;

    // console.log('Setting up Socket.IO connection...');
    
    // Connect to Socket.IO and listen for results
    socketService.connect(SESSION_ID, (result: DetectionResult) => {
      setDetectionResult(result);
    });

    setIsSocketConnected(socketService.isConnected());

    // Check connection status periodically
    const statusInterval = setInterval(() => {
      setIsSocketConnected(socketService.isConnected());
    }, 2000);

    return () => {
      // console.log('Cleaning up Socket.IO connection...');
      clearInterval(statusInterval);
      socketService.disconnect();
      setIsSocketConnected(false);
    };
  }, [isFocused]);

  // Track fake detection duration and show alert
  useEffect(() => {
    if (!detectionResult || !isFocused) {
      fakeDetectionStartTime.current = null;
      realDetectionStartTime.current = null;
      return;
    }

    if (detectionResult.label === 'FAKE') {
      // Reset real detection tracking
      realDetectionStartTime.current = null;
      successNavigated.current = false;

      // Start tracking fake detection time
      if (fakeDetectionStartTime.current === null) {
        fakeDetectionStartTime.current = Date.now();
      } else {
        // Check if fake has been detected for 10 seconds
        const durationMs = Date.now() - fakeDetectionStartTime.current;
        const durationSeconds = durationMs / 1000;

        if (durationSeconds >= 10 && !alertShown.current) {
          alertShown.current = true;
          Alert.alert(
            '⚠️ Deepfake Detected',
            'Fake content has been detected for more than 10 seconds. Returning to main screen for your safety.',
            [
              {
                text: 'OK',
                onPress: () => {
                  router.back();
                },
              },
            ],
            { cancelable: false }
          );
        }
      }
    } else if (detectionResult.label === 'REAL') {
      // Reset fake detection tracking
      fakeDetectionStartTime.current = null;
      alertShown.current = false;

      // Start tracking real detection time
      if (realDetectionStartTime.current === null) {
        realDetectionStartTime.current = Date.now();
      } else {
        // Check if real has been detected for 10 seconds
        const durationMs = Date.now() - realDetectionStartTime.current;
        const durationSeconds = durationMs / 1000;

        if (durationSeconds >= 10 && !successNavigated.current) {
          successNavigated.current = true;
          // Navigate back with success flag
          router.back();
          // Use setParams or navigate with result
          setTimeout(() => {
            router.setParams({ verificationSuccess: 'true' });
          }, 100);
        }
      }
    } else {
      // Reset all tracking if detection is UNKNOWN
      fakeDetectionStartTime.current = null;
      realDetectionStartTime.current = null;
      alertShown.current = false;
    }
  }, [detectionResult, isFocused, router]);

  // Request camera permission on mount
  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]);

  // Show permission request screen
  if (!hasPermission) {
    return (
      <View style={[styles.container, styles.cameraPlaceholder]}>
        <ThemedText style={styles.placeholderText}>📷 Camera Permission Required</ThemedText>
        <ThemedText style={styles.placeholderSubtext}>Please grant camera access to continue</ThemedText>
      </View>
    );
  }

  // Show loading if no device
  if (!device) {
    return (
      <View style={[styles.container, styles.cameraPlaceholder]}>
        <ThemedText style={styles.placeholderText}>📹 Initializing Camera...</ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Vision Camera preview with photo-based frame capture */}
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isFocused}
        photo={true}
      />

      <View style={styles.overlay}>
        <View style={styles.topBar}>
          {/* WebRTC connection status */}
          {/* <ThemedView style={[
            styles.badge,
            styles.socketBadge,
            webrtcConnectionState === 'connected' ? styles.socketConnected : 
            webrtcConnectionState === 'failed' ? styles.socketDisconnected :
            styles.socketConnecting
          ]}>
            </ThemedView> */}
            {/* <ThemedText style={styles.badgeText}>
              {webrtcConnectionState === 'connected' ? '🟢 WebRTC Connected' : 
               webrtcConnectionState === 'connecting' || webrtcConnectionState === 'new' ? '🟡 Connecting...' :
               webrtcConnectionState === 'failed' ? '🔴 Failed' :
               webrtcConnectionState === 'closed' ? '⚫ Closed' :
               webrtcConnectionState === 'disconnected' ? '🔴 Disconnected' :
               `🟠 ${webrtcConnectionState}`}
            </ThemedText> */}

          {/* Socket connection status */}
          {/* <ThemedView style={[
            styles.badge,
            styles.socketBadge,
            isSocketConnected ? styles.socketConnected : styles.socketDisconnected
          ]}>
            <ThemedText style={styles.badgeText}>
              {isSocketConnected ? '🟢 Socket Connected' : '🔴 Socket Disconnected'}
            </ThemedText>
          </ThemedView> */}

          {/* Frame counter */}
          {/* {webrtcConnectionState === 'connected' && frameCount > 0 && (
            <ThemedView style={[styles.badge, styles.frameBadge]}>
              <ThemedText style={styles.badgeText}>
                📸 Frames: {frameCount}
              </ThemedText>
            </ThemedView>
          )} */}
          
          {/* Detection result */}
          {detectionResult && (
            <ThemedView style={[
              styles.resultBadge,
              detectionResult.label === 'REAL' ? styles.resultReal : 
              detectionResult.label === 'FAKE' ? styles.resultFake : 
              styles.resultUnknown
            ]}>
              <ThemedText style={styles.resultLabel}>
                {detectionResult.label === 'REAL' ? ' REAL' : 
                 detectionResult.label === 'FAKE' ? ' FAKE' : 
                 ' UNKNOWN'}
              </ThemedText>
              <ThemedText style={styles.resultConfidence}>
                {(detectionResult.confidence * 100).toFixed(1)}% confidence
              </ThemedText>
              <ThemedText style={styles.resultStats}>
                Real: {(detectionResult.probReal * 100).toFixed(1)}% | Fake: {(detectionResult.probFake * 100).toFixed(1)}%
              </ThemedText>
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
    backgroundColor: '#000',
  },
  cameraPlaceholder: {
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#999',
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
  socketConnecting: {
    backgroundColor: 'rgba(255, 149, 0, 0.9)',
  },
  frameBadge: {
    backgroundColor: 'rgba(88, 86, 214, 0.9)',
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
});
