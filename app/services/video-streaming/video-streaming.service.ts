// Video Streaming Service - Frame Ingestion API
import { STREAMING_CONFIG, getStreamingApiUrl } from "./streaming-config";

export interface IngestFrameParams {
  sessionId: string;
  frameUri: string;
}

export interface IngestFrameResponse {
  success: boolean;
  message?: string;
  frameId?: string;
}

class VideoStreamingService {
  /**
   * Ingest a frame to the backend for deepfake analysis
   * Sends multipart/form-data with session_id and frame file
   */
  async ingestFrame(params: IngestFrameParams): Promise<IngestFrameResponse> {
    const { sessionId, frameUri } = params;
    
    // console.log('📤 Ingesting frame...');
    // console.log('  Session ID:', sessionId);
    // console.log('  Frame URI:', frameUri);
    
    try {
      const formData = new FormData();
      
      // Add session_id field
      formData.append('session_id', sessionId);
      
      // Add frame file
      // Extract filename from URI or generate one
      const filename = frameUri.split('/').pop() || `frame_${Date.now()}.jpg`;
      
      formData.append('frame', {
        uri: frameUri,
        type: 'image/jpeg',
        name: filename,
      } as any);
      
      const url = getStreamingApiUrl(STREAMING_CONFIG.ENDPOINTS.INGEST_FRAME);
      console.log('  POST URL:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type - let fetch set it with multipart boundary
      });
      
      // console.log('  Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('  Error response:', errorText);
        throw new Error(`Ingest failed: ${response.status} ${errorText}`);
      }
      
      const result = await response.json();
      // console.log('✅ Frame ingested successfully:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Frame ingest error:', error);
      throw error;
    }
  }
}

export const videoStreamingService = new VideoStreamingService();
