// Alert & Detection Types for Banking App

export interface Detection {
  id: string;
  userId: string;
  transactionId?: string;
  imagePath?: string;
  confidence: number;
  isDeepfake: boolean;
  detectionDetails?: {
    modelVersion?: string;
    faceDetected?: boolean;
    landmarksCount?: number;
    anomalyScore?: number;
    suspiciousRegions?: string[];
  };
  createdAt: string;
}

export interface Alert {
  id: string;
  userId: string;
  detectionId: string;
  transactionId: string;
  alertType: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  title: string;
  message: string;
  latitude?: number;
  longitude?: number;
  locationAddress?: string;
  isRead: boolean;
  createdAt: string;
}
