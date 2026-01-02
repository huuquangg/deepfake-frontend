// Video Streaming Configuration - Option B: Backend as Socket.IO Server
// 
// Backend contract:
// - Socket.IO URL: http://<backend-ip>:<port>
// - Event name: "prediction"
// - Payload: { session_id, batch_id, window_start, label, prob_real, prob_fake, confidence, inference_ms, timestamp }
//
// Network requirements:
// - Android: Allow cleartext HTTP via android:usesCleartextTraffic="true"
// - iOS: ATS exception for backend host (or use HTTPS)
// - Phone must reach backend IP on same LAN
//
// Environment-specific URLs:
// - Android Emulator: use 10.0.2.2 instead of localhost
// - iOS Simulator: localhost works fine
// - Physical Device: use your machine's LAN IP (e.g., 192.168.1.x)

export const STREAMING_CONFIG = {
  // HTTP API endpoint for frame ingestion (legacy)
  BASE_URL: "http://192.168.0.105:8096", // Backend IP:port
  
  // WebRTC API endpoint for real-time video streaming
  WEBRTC_BASE_URL: "http://192.168.0.105:8096", // Backend WebRTC API
  
  // Socket.IO endpoint for real-time predictions (Option B: Backend is server)
  SOCKET_URL: "http://192.168.0.105:8096", // Backend Socket.IO server (proxied through API gateway)
  
  ENDPOINTS: {
    INGEST_FRAME: "/api/video-streaming/ingest/frame",
  },
  
  // WebRTC endpoints (under video-streaming namespace)
  WEBRTC_ENDPOINTS: {
    OFFER: "/api/video-streaming/webrtc/stream/offer",
    CANDIDATE: "/api/video-streaming/webrtc/stream/candidate",
    CLOSE: "/api/video-streaming/webrtc/stream/{session_id}/close",
    STATS: "/api/video-streaming/webrtc/stats",
  },
  
  // Default session ID - MUST be same across socket and frame uploads
  // Generate once and reuse (not Date.now() which creates new ID on each import)
  get DEFAULT_SESSION_ID() {
    // Use a singleton pattern to ensure same ID across all imports
    if (!(globalThis as any).__STREAMING_SESSION_ID) {
      (globalThis as any).__STREAMING_SESSION_ID = "mobile-session-" + Date.now();
    }
    return (globalThis as any).__STREAMING_SESSION_ID;
  },
  
  // Socket.IO options (Option B: websocket-first, client mode)
  SOCKET_OPTIONS: {
    transports: ["websocket"], // Force websocket to avoid RN polling issues
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10,
    timeout: 20000,
    path: "/socket.io", // Must match API gateway route (no trailing slash)
  },
};

// Helper to get full API URL
export const getStreamingApiUrl = (endpoint: string): string => {
  return `${STREAMING_CONFIG.BASE_URL}${endpoint}`;
};

// Helper to get full WebRTC API URL
export const getWebRTCApiUrl = (endpoint: string): string => {
  return `${STREAMING_CONFIG.WEBRTC_BASE_URL}${endpoint}`;
};
