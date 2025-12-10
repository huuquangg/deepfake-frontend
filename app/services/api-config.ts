// API Configuration
export const API_CONFIG = {
  BASE_URL: "http://192.168.1.158:8085",
  ENDPOINTS: {
    // Auth
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    GET_ME: "/api/auth/me",

    // Account
    CREATE_ACCOUNT: "/api/account/create",
    GET_ACCOUNT_INFO: "/api/account/info",
    GET_BALANCE: "/api/account/balance",

    // Transaction
    TRANSFER: "/api/transaction/transfer",
    GET_TRANSACTION_HISTORY: "/api/transaction/history",
  },
  TIMEOUT: 10000, // 10 seconds
};

// Helper function để build full URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};
