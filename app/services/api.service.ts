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
  // ==================== AUTH APIs ====================

  // AUTH - Login
  async login(data: LoginRequest): Promise<LoginResponse> {
    const result = await fetchApi(API_CONFIG.ENDPOINTS.LOGIN, {
      method: "POST",
      body: JSON.stringify(data),
    });

    // Backend trả về: { token, user }
    const tokens: AuthTokens = {
      accessToken: result.token,
      refreshToken: result.token,
    };

    // Tạm thời dùng mock account, sẽ call API thật sau
    const account: Account = {
      id: "acc" + result.user.id,
      userId: result.user.id,
      accountNumber: "Loading...",
      accountName: result.user.full_name,
      balance: 0,
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

    // Tạm thời dùng mock account
    const account: Account = {
      id: "acc" + result.user.id,
      userId: result.user.id,
      accountNumber: "Loading...",
      accountName: result.user.full_name,
      balance: 0,
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

  // ==================== ACCOUNT APIs ====================

  // ACCOUNT - Create Account
  async createAccount(token: string): Promise<void> {
    await fetchApi(API_CONFIG.ENDPOINTS.CREATE_ACCOUNT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // ACCOUNT - Get Account Info
  async getAccountInfo(token: string): Promise<Account> {
    const result = await fetchApi(API_CONFIG.ENDPOINTS.GET_ACCOUNT_INFO, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Backend trả về AccountDTO
    return {
      id: result.id.toString(),
      userId: result.user_id,
      accountNumber: result.account_number,
      accountName: "Account", // Backend chưa có field này
      balance: result.balance,
      accountType: result.account_type,
      currency: "VND",
      createdAt: result.created_at,
    };
  },

  // ACCOUNT - Get Balance
  async getBalance(token: string): Promise<number> {
    const result = await fetchApi(API_CONFIG.ENDPOINTS.GET_BALANCE, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return result.balance;
  },

  // ==================== TRANSACTION APIs ====================

  // TRANSACTION - Transfer Money
  async transfer(
    token: string,
    data: {
      toAccountNumber: string;
      amount: number;
      description: string;
      faceImageBase64?: string;
    }
  ): Promise<any> {
    const result = await fetchApi(API_CONFIG.ENDPOINTS.TRANSFER, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        type: "TRANSFER",
        to_account_number: data.toAccountNumber,
        amount: data.amount,
        description: data.description,
        face_image_base64: data.faceImageBase64 || "",
      }),
    });

    return result;
  },

  // TRANSACTION - Get Transaction History
  async getTransactionHistory(token: string): Promise<any[]> {
    const result = await fetchApi(
      API_CONFIG.ENDPOINTS.GET_TRANSACTION_HISTORY,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return result.transactions || [];
  },
};
