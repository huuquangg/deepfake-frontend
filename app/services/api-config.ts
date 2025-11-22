// API Configuration
export const API_CONFIG = {
  BASE_URL: "http://192.168.1.107:8085",
  ENDPOINTS: {
    // Auth
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    GET_ME: "/api/auth/me",
  },
  TIMEOUT: 10000, // 10 seconds
};

// Helper function để build full URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};
