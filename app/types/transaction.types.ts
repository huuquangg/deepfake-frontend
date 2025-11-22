// Transaction Types for Banking App

export interface Transaction {
  id: string;
  fromAccountId: string;
  toAccountNumber: string;
  toAccountName: string;
  amount: number;
  fee: number;
  description: string;
  transactionCode: string;
  transactionType: "TRANSFER" | "DEPOSIT" | "WITHDRAWAL";
  status: "PENDING" | "SUCCESS" | "FAILED" | "BLOCKED";
  faceVerified: boolean;
  deepfakeDetected: boolean;
  detectionId?: string;
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
}

export interface TransferRequest {
  toAccountNumber: string;
  amount: number;
  description: string;
}

export interface TransferWithFaceRequest extends TransferRequest {
  faceImageBase64: string;
  latitude?: number;
  longitude?: number;
}

export interface TransferResponse {
  transaction: Transaction;
  message: string;
}
