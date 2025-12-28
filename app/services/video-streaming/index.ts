// Video Streaming Services - Centralized exports
export { socketService } from './socket.service';
export type { DetectionResult } from './socket.service';
export { STREAMING_CONFIG, getStreamingApiUrl, getWebRTCApiUrl } from './streaming-config';
export { videoStreamingService } from './video-streaming.service';
export type { IngestFrameParams, IngestFrameResponse } from './video-streaming.service';
export { WebRTCService, createWebRTCService, getActiveWebRTCService } from './webrtc.service';
export type { WebRTCConfig } from './webrtc.service';

