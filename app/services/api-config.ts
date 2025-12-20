// API Configuration
export const API_CONFIG = {
  BASE_URL: "http://192.168.1.172:8085",
  ENDPOINTS: {
    // Auth
    LOGIN: "/api/core-banking/auth/login",
    REGISTER: "/api/core-banking/auth/register",
    GET_ME: "/api/core-banking/auth/me",
    // Account
    CREATE_ACCOUNT: "/api/core-banking/account/create",
    GET_ACCOUNT_INFO: "/api/core-banking/account/info",
    GET_BALANCE: "/api/core-banking/account/balance",
    // Transaction
    TRANSFER: "/api/core-banking/transaction/transfer",
    GET_TRANSACTION_HISTORY: "/api/core-banking/transaction/history",
  },
  TIMEOUT: 10000,
};

// Helper function để build full URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};
