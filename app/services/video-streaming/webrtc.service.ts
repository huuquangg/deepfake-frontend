// WebRTC Service - Real-time video streaming via WebRTC
import {
  MediaStream,
  RTCPeerConnection,
  RTCSessionDescription
} from "react-native-webrtc";
import { STREAMING_CONFIG, getWebRTCApiUrl } from "./streaming-config";

export interface WebRTCConfig {
  sessionId: string;
  onConnectionStateChange?: (state: string) => void;
  onICEConnectionStateChange?: (state: string) => void;
  onError?: (error: Error) => void;
  onFramesChannelOpen?: () => void; // Called when frames channel is ready
}

export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private dataChannel: any = null;
  private framesChannel: any = null;
  private sessionId: string = "";
  private config: WebRTCConfig;
  private isConnecting: boolean = false;
  private isConnected: boolean = false;
  private frameCounter: number = 0;
  private pendingCandidates: any[] = []; // Buffer candidates until answer is received

  constructor(config: WebRTCConfig) {
    this.config = config;
    this.sessionId = config.sessionId;
  }

  /**
   * Initialize WebRTC connection for data channels only (no media)
   * Camera is handled separately by Vision Camera
   */
  async initializeConnection(): Promise<void> {
    if (this.isConnecting || this.isConnected) {
      console.log("⏭️ WebRTC already connecting/connected");
      return;
    }

    this.isConnecting = true;

    try {
      console.log("🔌 Creating WebRTC peer connection for data channels...");

      // Create peer connection with STUN/TURN servers for NAT traversal
      this.peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          { urls: "stun:stun2.l.google.com:19302" },
          { urls: "stun:stun3.l.google.com:19302" },
          { urls: "stun:stun4.l.google.com:19302" },
        ],
        iceTransportPolicy: "all", // Try all candidates (host, srflx, relay)
        iceCandidatePoolSize: 10, // Pre-gather candidates
        bundlePolicy: "max-bundle", // Bundle media on single connection
        rtcpMuxPolicy: "require", // Multiplex RTP and RTCP
      });

      console.log("🔌 RTCPeerConnection created");

      // Setup connection state handlers using direct property assignment
      (this.peerConnection as any).onconnectionstatechange = () => {
        const state = this.peerConnection?.connectionState || "unknown";
        console.log(`🔗 Connection state: ${state}`);
        this.config.onConnectionStateChange?.(state);

        if (state === "connected") {
          this.isConnected = true;
          this.isConnecting = false;
        } else if (state === "failed" || state === "closed") {
          // Only treat failed/closed as permanent - disconnected can recover
          this.isConnected = false;
          this.isConnecting = false;
          console.error(`❌ WebRTC connection ${state} - will not recover`);
        } else if (state === "disconnected") {
          console.warn("⚠️ WebRTC temporarily disconnected - may reconnect");
          // Don't set isConnected = false yet, it might recover
        }
      };

      // Setup ICE connection state handler
      (this.peerConnection as any).oniceconnectionstatechange = () => {
        const state = this.peerConnection?.iceConnectionState || "unknown";
        console.log(`🧊 ICE connection state: ${state}`);
        this.config.onICEConnectionStateChange?.(state);
        
        // Log detailed info for failed states
        if (state === "failed") {
          console.error("❌ ICE connection failed - NAT traversal issue");
          console.error("   Possible causes:");
          console.error("   1. Phone and server on different networks");
          console.error("   2. Firewall blocking UDP ports");
          console.error("   3. No TURN server configured for relay");
        } else if (state === "disconnected") {
          console.warn("⚠️ ICE disconnected - checking connectivity...");
        } else if (state === "connected") {
          console.log("✅ ICE connection established successfully!");
        }
      };

      // Setup ICE gathering state handler
      (this.peerConnection as any).onicegatheringstatechange = () => {
        const state = this.peerConnection?.iceGatheringState;
        console.log(`🧊 ICE gathering state: ${state}`);
      };

      // Handle ICE candidates - buffer them until answer is received
      (this.peerConnection as any).onicecandidate = async (event: any) => {
        if (event.candidate) {
          // In React Native WebRTC, candidate object is already in the right format
          const candidateObj = event.candidate.toJSON ? event.candidate.toJSON() : event.candidate;
          console.log("🧊 ICE candidate generated");
          console.log("   Candidate:", candidateObj.candidate?.substring(0, 50) + "...");
          
          // Buffer candidate - will be sent after answer is received
          this.pendingCandidates.push(candidateObj);
        } else {
          console.log("🧊 All ICE candidates gathered");
        }
      };

      // No media tracks needed - Vision Camera handles video separately
      // We only use data channels for frame and prediction exchange

      // Create data channel for sending JPEG frames
      this.framesChannel = this.peerConnection.createDataChannel("frames");
      this.setupFramesChannel();

      // Create data channel for receiving predictions
      this.dataChannel = this.peerConnection.createDataChannel("predictions");
      
      this.dataChannel.onopen = () => {
        console.log("📡 Data channel opened");
      };

      this.dataChannel.onclose = () => {
        console.log("📡 Data channel closed");
      };

      this.dataChannel.onmessage = (event: any) => {
        try {
          const prediction = JSON.parse(event.data);
          console.log("📨 Received prediction via data channel:", prediction);
          // Predictions are already handled via Socket.IO, but this is backup
        } catch (error) {
          console.error("Failed to parse data channel message:", error);
        }
      };

      // Create and send offer
      console.log("📤 Creating offer...");
      const offer = await this.peerConnection.createOffer({
        offerToReceiveVideo: false,
        offerToReceiveAudio: false,
      });

      await this.peerConnection.setLocalDescription(offer);
      console.log("📝 Local description set");

      // Send offer to server
      const answer = await this.sendOffer(offer);
      
      // Set remote description (answer from server)
      console.log("📥 Setting remote description...");
      await this.peerConnection.setRemoteDescription(
        new RTCSessionDescription({
          type: "answer",
          sdp: answer.sdp,
        })
      );

      // Now send buffered ICE candidates after answer is set
      console.log(`📤 Sending ${this.pendingCandidates.length} buffered ICE candidates...`);
      for (const candidate of this.pendingCandidates) {
        await this.sendICECandidate(candidate);
      }
      this.pendingCandidates = []; // Clear buffer

      console.log("✅ WebRTC connection established");
    } catch (error) {
      console.error("❌ WebRTC initialization failed:", error);
      this.isConnecting = false;
      this.config.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Setup frames data channel
   */
  private setupFramesChannel(): void {
    if (!this.framesChannel) return;

    this.framesChannel.onopen = () => {
      console.log("📦 Frames channel opened - ready to send frames");
      // Notify callback that frames channel is ready (like web version)
      this.config.onFramesChannelOpen?.();
    };

    this.framesChannel.onclose = () => {
      console.log("📦 Frames channel closed");
    };

    this.framesChannel.onerror = (error: any) => {
      console.error("📦 Frames channel error:", error);
    };
  }

  /**
   * Send JPEG frame data through frames channel
   * @param jpegData - JPEG image as Uint8Array or base64 string
   */
  async sendFrame(jpegData: Uint8Array | string): Promise<void> {
    if (!this.framesChannel || this.framesChannel.readyState !== "open") {
      return; // Silent fail
    }

    try {
      let bytes: Uint8Array;

      if (typeof jpegData === 'string') {
        // Convert base64 to binary
        const binaryString = atob(jpegData);
        bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
      } else {
        bytes = jpegData;
      }

      // Send as binary data
      this.framesChannel.send(bytes.buffer);
      this.frameCounter++;

      // Log every 30 frames
      if (this.frameCounter % 30 === 0) {
        console.log(`📸 Sent ${this.frameCounter} frames (${(bytes.length / 1024).toFixed(1)} KB each)`);
      }
    } catch (error) {
      if (this.frameCounter % 30 === 0) {
        console.error("Failed to send frame:", error);
      }
    }
  }

  /**
   * Get frame counter
   */
  getFrameCount(): number {
    return this.frameCounter;
  }

  /**
   * Send WebRTC offer to server
   */
  private async sendOffer(offer: RTCSessionDescription): Promise<{ sdp: string; type: string }> {
    const url = getWebRTCApiUrl(STREAMING_CONFIG.WEBRTC_ENDPOINTS.OFFER);
    console.log("📤 Sending offer to:", url);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_id: this.sessionId,
        sdp: offer.sdp,
        type: offer.type,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to send offer: ${response.status} ${errorText}`);
    }

    const answer = await response.json();
    console.log("✅ Received answer from server");
    return answer;
  }

  /**
   * Send ICE candidate to server
   */
  private async sendICECandidate(candidate: any): Promise<void> {
    const url = getWebRTCApiUrl(STREAMING_CONFIG.WEBRTC_ENDPOINTS.CANDIDATE);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: this.sessionId,
          candidate: candidate,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`Failed to send ICE candidate: ${response.status}`, errorText);
      }
    } catch (error) {
      console.warn("Error sending ICE candidate:", error);
      // Non-fatal error, continue
    }
  }

  /**
   * Close WebRTC connection
   */
  async close(): Promise<void> {
    console.log("🔌 Closing WebRTC connection...");

    try {
      // Close data channel
      if (this.dataChannel) {
        this.dataChannel.close();
        this.dataChannel = null;
      }

      // Stop local stream tracks
      if (this.localStream) {
        this.localStream.getTracks().forEach((track) => {
          track.stop();
        });
        this.localStream = null;
      }

      // Close peer connection
      if (this.peerConnection) {
        this.peerConnection.close();
        this.peerConnection = null;
      }

      // Notify server
      const url = getWebRTCApiUrl(
        STREAMING_CONFIG.WEBRTC_ENDPOINTS.CLOSE.replace("{session_id}", this.sessionId)
      );
      
      await fetch(url, { method: "POST" }).catch(() => {
        // Ignore errors on cleanup
      });

      this.isConnected = false;
      this.isConnecting = false;

      console.log("✅ WebRTC connection closed");
    } catch (error) {
      console.error("Error closing WebRTC connection:", error);
    }
  }

  /**
   * Get connection state
   */
  getConnectionState(): string {
    return this.peerConnection?.connectionState || "closed";
  }

  /**
   * Check if connected
   */
  isConnectionActive(): boolean {
    return this.isConnected;
  }

  /**
   * Get local stream (for preview if needed)
   */
  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  /**
   * Check if frames channel is ready
   */
  isFramesChannelReady(): boolean {
    return this.framesChannel?.readyState === "open";
  }
}

// Singleton factory
let activeWebRTCService: WebRTCService | null = null;

export const createWebRTCService = (config: WebRTCConfig): WebRTCService => {
  // Close existing service if any
  if (activeWebRTCService) {
    activeWebRTCService.close();
  }

  activeWebRTCService = new WebRTCService(config);
  return activeWebRTCService;
};

export const getActiveWebRTCService = (): WebRTCService | null => {
  return activeWebRTCService;
};
