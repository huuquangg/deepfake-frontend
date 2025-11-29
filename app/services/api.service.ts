// Real API Service - Gọi backend thật
import {
  Account,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  AuthTokens,
} from "@/app/types/user.types";
import { API_CONFIG, getApiUrl } from "./api-config";

// Helper function để call API
const fetchApi = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const url = getApiUrl(endpoint);

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "API request failed");
  }

  return response.json();
};

// Real API Service
export const apiService = {
  // AUTH - Login
  async login(data: LoginRequest): Promise<LoginResponse> {
    const result = await fetchApi(API_CONFIG.ENDPOINTS.LOGIN, {
      method: "POST",
      body: JSON.stringify(data),
    });

    // Backend trả về: { token, user }
    // Cần convert sang format của frontend
    const tokens: AuthTokens = {
      accessToken: result.token,
      refreshToken: result.token, // Backend chưa có refresh token
    };

    // Tạo mock account (vì backend chưa có account API)
    const account: Account = {
      id: "acc" + result.user.id,
      userId: result.user.id,
      accountNumber: "1234567890",
      accountName: result.user.full_name,
      balance: 10000000,
      accountType: "CHECKING",
      currency: "VND",
      createdAt: result.user.created_at,
    };

    return {
      user: {
        id: result.user.id.toString(),
        username: result.user.username,
        email: result.user.email,
        fullName: result.user.full_name,
        phone: result.user.phone,
        faceVerificationEnabled: true,
        deepfakeThreshold: 50,
        createdAt: result.user.created_at,
      },
      account,
      tokens,
    };
  },

  // AUTH - Register
  async register(data: RegisterRequest): Promise<LoginResponse> {
    const result = await fetchApi(API_CONFIG.ENDPOINTS.REGISTER, {
      method: "POST",
      body: JSON.stringify({
        username: data.username,
        password: data.password,
        email: data.email,
        full_name: data.fullName,
        phone: data.phone,
      }),
    });

    // Backend trả về: { token, user }
    const tokens: AuthTokens = {
      accessToken: result.token,
      refreshToken: result.token,
    };

    // Tạo mock account
    const account: Account = {
      id: "acc" + result.user.id,
      userId: result.user.id,
      accountNumber: "1234567890",
      accountName: result.user.full_name,
      balance: 10000000,
      accountType: "CHECKING",
      currency: "VND",
      createdAt: result.user.created_at,
    };

    return {
      user: {
        id: result.user.id.toString(),
        username: result.user.username,
        email: result.user.email,
        fullName: result.user.full_name,
        phone: result.user.phone,
        faceVerificationEnabled: true,
        deepfakeThreshold: 50,
        createdAt: result.user.created_at,
      },
      account,
      tokens,
    };
  },
};
