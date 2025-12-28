import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useIsFocused } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system/legacy';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { DetectionResult, socketService } from '../../../services/video-streaming/socket.service';
import { STREAMING_CONFIG } from '../../../services/video-streaming/streaming-config';
import { createWebRTCService, WebRTCService } from '../../../services/video-streaming/webrtc.service';

// Configuration
const SESSION_ID = STREAMING_CONFIG.DEFAULT_SESSION_ID;

export default function CameraScreen() {
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
  
  // Vision Camera setup
  const device = useCameraDevice('front');
  const { hasPermission, requestPermission } = useCameraPermission();

  // Capture and send frames using takePhoto
  const captureAndSendFrame = async () => {
    // Check if camera is still active and frames channel is ready
    if (!cameraRef.current || 
        !webrtcService.current?.isFramesChannelReady() || 
        !isFocused ||
        !captureIntervalRef.current) {
      return;
    }

    try {
      const photo = await cameraRef.current.takePhoto({
        enableShutterSound: false,
      });

      // Resize to 640x480 with 70% quality (target: <100KB)
      const resized = await manipulateAsync(
        'file://' + photo.path,
        [{ resize: { width: 640 } }], // Height auto-calculated to maintain aspect ratio
        { compress: 0.7, format: SaveFormat.JPEG }
      );

      // Read resized photo as base64
      const base64 = await FileSystem.readAsStringAsync(resized.uri, {
        encoding: 'base64',
      });

      // Send frame
      await webrtcService.current.sendFrame(base64);
      
      frameCounter.current++;
      
      // Log every frame for detailed tracking
      if (frameCounter.current % 5 === 0) {
        const sizeKB = (base64.length / 1024).toFixed(1);
        console.log(`📸 Frame ${frameCounter.current} sent (${sizeKB} KB)`);
      }
      
      // Update UI every 15 frames
      if (frameCounter.current % 15 === 0) {
        setFrameCount(frameCounter.current);
        console.log(`✅ Total frames sent: ${frameCounter.current}`);
      }
    } catch (error: any) {
      // Only log if camera isn't closed (expected during cleanup)
      if (!error?.message?.includes('Camera is closed')) {
        console.error(`❌ Frame ${frameCounter.current + 1} failed:`, error);
      }
    }
  };

  // Start frame capture
  const startFrameCapture = () => {
    if (captureIntervalRef.current) return;
    
    console.log('🎬 Starting frame capture at ~15 FPS');
    captureIntervalRef.current = setInterval(() => {
      captureAndSendFrame();
    }, 66); // ~15 FPS
  };

  // Stop frame capture
  const stopFrameCapture = () => {
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
      console.log(`🎬 Frame capture stopped. Total: ${frameCounter.current}`);
    }
  };

  // WebRTC connection management
  useEffect(() => {
    if (!isFocused) return;

    const initializeWebRTC = async () => {
      try {
        console.log('🚀 Initializing WebRTC signaling...');
        
        webrtcService.current = createWebRTCService({
          sessionId: SESSION_ID,
          onConnectionStateChange: (state) => {
            console.log(`🔗 WebRTC connection state: ${state}`);
            setWebrtcConnectionState(state);
          },
          onICEConnectionStateChange: (state) => {
            console.log(`🧊 ICE connection state: ${state}`);
          },
          onFramesChannelOpen: () => {
            console.log('✅ Frames channel ready - starting capture');
            frameCounter.current = 0;
            startFrameCapture();
          },
          onError: (error) => {
            console.error('❌ WebRTC error:', error);
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
        
        console.log('✅ WebRTC signaling established');
      } catch (error) {
        console.error('Failed to initialize WebRTC:', error);
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
      console.log('🔌 Cleaning up WebRTC connection...');
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

    console.log('Setting up Socket.IO connection...');
    
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
      console.log('Cleaning up Socket.IO connection...');
      clearInterval(statusInterval);
      socketService.disconnect();
      setIsSocketConnected(false);
    };
  }, [isFocused]);

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
          <ThemedView style={[
            styles.badge,
            styles.socketBadge,
            webrtcConnectionState === 'connected' ? styles.socketConnected : 
            webrtcConnectionState === 'failed' ? styles.socketDisconnected :
            styles.socketConnecting
          ]}>
            <ThemedText style={styles.badgeText}>
              {webrtcConnectionState === 'connected' ? '🟢 WebRTC Connected' : 
               webrtcConnectionState === 'connecting' || webrtcConnectionState === 'new' ? '🟡 Connecting...' :
               webrtcConnectionState === 'failed' ? '🔴 Failed' :
               webrtcConnectionState === 'closed' ? '⚫ Closed' :
               webrtcConnectionState === 'disconnected' ? '🔴 Disconnected' :
               `🟠 ${webrtcConnectionState}`}
            </ThemedText>
          </ThemedView>

          {/* Socket connection status */}
          <ThemedView style={[
            styles.badge,
            styles.socketBadge,
            isSocketConnected ? styles.socketConnected : styles.socketDisconnected
          ]}>
            <ThemedText style={styles.badgeText}>
              {isSocketConnected ? '🟢 Socket Connected' : '🔴 Socket Disconnected'}
            </ThemedText>
          </ThemedView>

          {/* Frame counter */}
          {webrtcConnectionState === 'connected' && frameCount > 0 && (
            <ThemedView style={[styles.badge, styles.frameBadge]}>
              <ThemedText style={styles.badgeText}>
                📸 Frames: {frameCount}
              </ThemedText>
            </ThemedView>
          )}
          
          {/* Detection result */}
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
