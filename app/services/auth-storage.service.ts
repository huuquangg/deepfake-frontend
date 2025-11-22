// Auth Storage Service - Lưu trữ token và user data (Memory version)
// Temporary: Using memory storage instead of AsyncStorage for Expo Go compatibility
import { User, Account, AuthTokens } from "@/app/types/user.types";

// In-memory storage (sẽ mất khi reload app)
let memoryStorage: {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  account: Account | null;
} = {
  accessToken: null,
  refreshToken: null,
  user: null,
  account: null,
};

export const authStorage = {
  // Save tokens
  async saveTokens(tokens: AuthTokens): Promise<void> {
    memoryStorage.accessToken = tokens.accessToken;
    memoryStorage.refreshToken = tokens.refreshToken;
  },

  // Get access token
  async getAccessToken(): Promise<string | null> {
    return memoryStorage.accessToken;
  },

  // Get refresh token
  async getRefreshToken(): Promise<string | null> {
    return memoryStorage.refreshToken;
  },

  // Save user data
  async saveUser(user: User): Promise<void> {
    memoryStorage.user = user;
  },

  // Get user data
  async getUser(): Promise<User | null> {
    return memoryStorage.user;
  },

  // Save account data
  async saveAccount(account: Account): Promise<void> {
    memoryStorage.account = account;
  },

  // Get account data
  async getAccount(): Promise<Account | null> {
    return memoryStorage.account;
  },

  // Clear all auth data (logout)
  async clearAll(): Promise<void> {
    memoryStorage = {
      accessToken: null,
      refreshToken: null,
      user: null,
      account: null,
    };
  },

  // Check if user is logged in
  async isLoggedIn(): Promise<boolean> {
    return !!memoryStorage.accessToken;
  },
};
