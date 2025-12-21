// Socket.IO Service - Real-time deepfake detection results (Option B: Client mode)
//
// Backend contract (Option B):
// - Backend is Socket.IO server
// - Event name: "prediction"
// - Payload schema:
//   {
//     session_id: string,
//     batch_id: string,
//     window_start: number,
//     label: "real" | "fake",
//     prob_real: number,
//     prob_fake: number,
//     confidence: number,
//     inference_ms: number,
//     timestamp: number (unix seconds)
//   }

import { io, Socket } from 'socket.io-client';
import { STREAMING_CONFIG } from './streaming-config';

// Backend contract payload (Option B)
export interface PredictionPayload {
  session_id: string;
  batch_id: string;
  window_start: number;
  label: 'real' | 'fake';
  prob_real: number;
  prob_fake: number;
  confidence: number;
  inference_ms: number;
  timestamp: number; // unix seconds
}

// Normalized result for UI
export interface DetectionResult {
  sessionId: string;
  batchId: string;
  windowStart: number;
  label: 'REAL' | 'FAKE';
  probReal: number;
  probFake: number;
  confidence: number;
  inferenceMs: number;
  timestamp: number;
}

export type ResultCallback = (result: DetectionResult) => void;

class SocketService {
  private socket: Socket | null = null;
  private currentSessionId: string | null = null;

  /**
   * Connect to Socket.IO server and listen for prediction events (Option B)
   * Backend broadcasts "prediction" events with the contract payload
   */
  connect(sessionId: string, onResult: ResultCallback): void {
    if (this.socket && this.socket.connected) {
      console.log('⚠️ Socket already connected');
      return;
    }

    console.log('🔌 Connecting to Socket.IO backend server (Option B)...');
    console.log('  URL:', STREAMING_CONFIG.SOCKET_URL);
    console.log('  Session ID:', sessionId);
    console.log('  Transport: websocket');

    this.currentSessionId = sessionId;

    // Connect as Socket.IO client to backend server
    this.socket = io(STREAMING_CONFIG.SOCKET_URL, {
      ...STREAMING_CONFIG.SOCKET_OPTIONS,
      query: {
        session_id: sessionId, // Pass session ID for room filtering
      },
    });

    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ Socket.IO connected to backend');
      console.log('  Socket ID:', this.socket?.id);
      console.log('  Listening for "prediction" events');
      
      // Join session room for filtering (Option B: backend uses rooms)
      console.log('📥 Joining session room:', sessionId);
      this.socket?.emit('join_session', { session_id: sessionId });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Socket.IO disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket.IO connection error:', error.message);
      console.error('  Make sure backend Socket.IO server is running');
      console.error('  Check network: phone must reach', STREAMING_CONFIG.SOCKET_URL);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Socket.IO reconnected after', attemptNumber, 'attempts');
    });

    // Listen for "prediction" events (Option B backend contract)
    this.socket.on('prediction', (payload: PredictionPayload) => {
      console.log('📊 Prediction received from backend:', payload);
      console.log('  Payload session_id:', payload.session_id);
      console.log('  Expected session_id:', sessionId);
      console.log('  Match:', payload.session_id === sessionId);
      
      // Filter by session ID (backend may broadcast to all or room-filtered)
      if (payload.session_id === sessionId) {
        const result: DetectionResult = {
          sessionId: payload.session_id,
          batchId: payload.batch_id,
          windowStart: payload.window_start,
          label: payload.label.toUpperCase() as 'REAL' | 'FAKE',
          probReal: payload.prob_real,
          probFake: payload.prob_fake,
          confidence: payload.confidence,
          inferenceMs: payload.inference_ms,
          timestamp: payload.timestamp,
        };
        
        console.log('✅ Prediction normalized for UI:', result);
        onResult(result);
      } else {
        console.log('⏭️ Skipping prediction for different session:', payload.session_id);
      }
    });

    // Debug: Listen for ALL events to catch what backend is actually sending
    this.socket.onAny((eventName, ...args) => {
      console.log('🔔 Socket.IO event received:', eventName);
      console.log('  Args:', JSON.stringify(args, null, 2));
    });

    // Debug: Catch any errors
    this.socket.on('error', (error) => {
      console.error('❌ Socket.IO error:', error);
    });
  }

  /**
   * Disconnect from Socket.IO server
   */
  disconnect(): void {
    if (this.socket) {
      console.log('🔌 Disconnecting Socket.IO...');
      this.socket.disconnect();
      this.socket = null;
      this.currentSessionId = null;
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Join a specific session room (if backend supports room-based filtering)
   * Optional: call this after connect if backend uses Socket.IO rooms
   */
  joinSession(sessionId: string): void {
    if (!this.socket || !this.socket.connected) {
      console.warn('⚠️ Cannot join room: socket not connected');
      return;
    }
    
    console.log('📥 Joining session room:', sessionId);
    this.socket.emit('join_session', { session_id: sessionId });
  }

  /**
   * Leave current session room
   */
  leaveSession(sessionId: string): void {
    if (!this.socket || !this.socket.connected) {
      return;
    }
    
    console.log('📤 Leaving session room:', sessionId);
    this.socket.emit('leave_session', { session_id: sessionId });
  }
}

export const socketService = new SocketService();
