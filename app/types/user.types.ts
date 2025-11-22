// User Types for Banking App

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  faceVerificationEnabled: boolean;
  deepfakeThreshold: number;
  createdAt: string;
}

export interface Account {
  id: string;
  userId: string;
  accountNumber: string;
  accountName: string;
  balance: number;
  accountType: "CHECKING" | "SAVINGS";
  currency: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export interface LoginResponse {
  user: User;
  account: Account;
  tokens: AuthTokens;
}

export interface AuthState {
  user: User | null;
  account: Account | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
