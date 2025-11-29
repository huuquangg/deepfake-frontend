// Auth Context - Quản lý authentication state
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  User,
  Account,
  AuthTokens,
  LoginRequest,
  RegisterRequest,
  AuthState,
} from "@/app/types/user.types";
import { mockApiService } from "@/app/services/mock-api.service";
import { authStorage } from "@/app/services/auth-storage.service";
import { apiService } from "@/app/services/api.service";

interface AuthContextType extends AuthState {
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    account: null,
    tokens: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Check if user is already logged in when app starts
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const isLoggedIn = await authStorage.isLoggedIn();

      if (isLoggedIn) {
        const [user, account, accessToken, refreshToken] = await Promise.all([
          authStorage.getUser(),
          authStorage.getAccount(),
          authStorage.getAccessToken(),
          authStorage.getRefreshToken(),
        ]);

        if (user && account && accessToken && refreshToken) {
          setState({
            user,
            account,
            tokens: { accessToken, refreshToken },
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        }
      }
    } catch (error) {
      console.error("Check auth error:", error);
    }

    setState((prev) => ({ ...prev, isLoading: false }));
  };

  const login = async (data: LoginRequest) => {
    try {
      const response = await apiService.login(data);
      // Save to storage
      await authStorage.saveTokens(response.tokens);
      await authStorage.saveUser(response.user);
      await authStorage.saveAccount(response.account);

      // Update state
      setState({
        user: response.user,
        account: response.account,
        tokens: response.tokens,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      const response = await apiService.register(data);

      // Save to storage
      await authStorage.saveTokens(response.tokens);
      await authStorage.saveUser(response.user);
      await authStorage.saveAccount(response.account);

      // Update state
      setState({
        user: response.user,
        account: response.account,
        tokens: response.tokens,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authStorage.clearAll();
      setState({
        user: null,
        account: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      throw error;
    }
  };

  const refreshAccount = async () => {
    try {
      const account = await mockApiService.getAccount();
      await authStorage.saveAccount(account);
      setState((prev) => ({ ...prev, account }));
    } catch (error) {
      console.error("Refresh account error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        refreshAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
