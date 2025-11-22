// Mock API Service - Giả lập backend API
import {
  User,
  Account,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  AuthTokens,
} from "@/app/types/user.types";
import {
  Transaction,
  TransferRequest,
  TransferResponse,
} from "@/app/types/transaction.types";
import { Alert, Detection } from "@/app/types/alert.types";

// Fake delay để giống API thật
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock data users
const MOCK_USERS: (User & { password: string; account: Account })[] = [
  {
    id: "1",
    username: "nguyenvana",
    password: "password123",
    email: "nguyenvana@example.com",
    fullName: "Nguyễn Văn A",
    phone: "0901234567",
    faceVerificationEnabled: true,
    deepfakeThreshold: 50,
    createdAt: new Date().toISOString(),
    account: {
      id: "acc1",
      userId: "1",
      accountNumber: "1234567890",
      accountName: "Nguyễn Văn A",
      balance: 50000000,
      accountType: "CHECKING",
      currency: "VND",
      createdAt: new Date().toISOString(),
    },
  },
];

// Mock transactions
let MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "t1",
    fromAccountId: "acc1",
    toAccountNumber: "9876543210",
    toAccountName: "Trần Thị B",
    amount: 1000000,
    fee: 0,
    description: "Chuyển tiền test",
    transactionCode: "TXN001",
    transactionType: "TRANSFER",
    status: "SUCCESS",
    faceVerified: true,
    deepfakeDetected: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    completedAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

// Mock alerts
const MOCK_ALERTS: Alert[] = [];

// Mock API Service
export const mockApiService = {
  // AUTH - Login
  async login(data: LoginRequest): Promise<LoginResponse> {
    await delay(1000); // Giả lập network delay

    const user = MOCK_USERS.find(
      (u) => u.username === data.username && u.password === data.password
    );

    if (!user) {
      throw new Error("Sai tên đăng nhập hoặc mật khẩu");
    }

    const tokens: AuthTokens = {
      accessToken: "mock_access_token_" + Date.now(),
      refreshToken: "mock_refresh_token_" + Date.now(),
    };

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        faceVerificationEnabled: user.faceVerificationEnabled,
        deepfakeThreshold: user.deepfakeThreshold,
        createdAt: user.createdAt,
      },
      account: user.account,
      tokens,
    };
  },

  // AUTH - Register
  async register(data: RegisterRequest): Promise<LoginResponse> {
    await delay(1500);

    // Check username exists
    if (MOCK_USERS.find((u) => u.username === data.username)) {
      throw new Error("Tên đăng nhập đã tồn tại");
    }

    // Check email exists
    if (MOCK_USERS.find((u) => u.email === data.email)) {
      throw new Error("Email đã được sử dụng");
    }

    // Create new user
    const newUser = {
      id: String(MOCK_USERS.length + 1),
      username: data.username,
      password: data.password,
      email: data.email,
      fullName: data.fullName,
      phone: data.phone,
      faceVerificationEnabled: true,
      deepfakeThreshold: 50,
      createdAt: new Date().toISOString(),
      account: {
        id: "acc" + (MOCK_USERS.length + 1),
        userId: String(MOCK_USERS.length + 1),
        accountNumber: String(1000000000 + MOCK_USERS.length),
        accountName: data.fullName,
        balance: 10000000, // Tặng 10 triệu khi đăng ký 😊
        accountType: "CHECKING" as const,
        currency: "VND",
        createdAt: new Date().toISOString(),
      },
    };

    MOCK_USERS.push(newUser);

    const tokens: AuthTokens = {
      accessToken: "mock_access_token_" + Date.now(),
      refreshToken: "mock_refresh_token_" + Date.now(),
    };

    return {
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.fullName,
        phone: newUser.phone,
        faceVerificationEnabled: newUser.faceVerificationEnabled,
        deepfakeThreshold: newUser.deepfakeThreshold,
        createdAt: newUser.createdAt,
      },
      account: newUser.account,
      tokens,
    };
  },

  // ACCOUNT - Get account info
  async getAccount(): Promise<Account> {
    await delay(500);
    return MOCK_USERS[0].account;
  },

  // TRANSACTION - Get history
  async getTransactions(): Promise<Transaction[]> {
    await delay(800);
    return MOCK_TRANSACTIONS;
  },

  // TRANSACTION - Transfer money (with face verification)
  async transfer(
    data: TransferRequest,
    faceImageBase64?: string
  ): Promise<TransferResponse> {
    await delay(2000); // Giả lập thời gian xử lý deepfake

    // Giả lập phát hiện deepfake (random)
    const isDeepfake = Math.random() > 0.8; // 20% chance deepfake
    const confidence = isDeepfake
      ? Math.random() * 50 + 50
      : Math.random() * 30;

    if (isDeepfake) {
      // Block transaction if deepfake detected
      const blockedTransaction: Transaction = {
        id: "t" + (MOCK_TRANSACTIONS.length + 1),
        fromAccountId: "acc1",
        toAccountNumber: data.toAccountNumber,
        toAccountName: "Unknown",
        amount: data.amount,
        fee: 0,
        description: data.description,
        transactionCode: "TXN" + String(Date.now()).slice(-6),
        transactionType: "TRANSFER",
        status: "BLOCKED",
        faceVerified: false,
        deepfakeDetected: true,
        errorMessage: `Giao dịch bị chặn do phát hiện deepfake với confidence ${confidence.toFixed(
          1
        )}%`,
        createdAt: new Date().toISOString(),
      };

      MOCK_TRANSACTIONS.unshift(blockedTransaction);

      // Create alert
      const alert: Alert = {
        id: "alert" + (MOCK_ALERTS.length + 1),
        userId: "1",
        detectionId: "det" + Date.now(),
        transactionId: blockedTransaction.id,
        alertType: "DEEPFAKE_DETECTED",
        severity: "CRITICAL",
        title: "🚨 Cảnh báo: Phát hiện Deepfake!",
        message: `Hệ thống đã phát hiện khuôn mặt giả mạo trong giao dịch chuyển ${data.amount.toLocaleString(
          "vi-VN"
        )} VND. Giao dịch đã bị chặn.`,
        latitude: 10.762622,
        longitude: 106.660172,
        locationAddress: "TP. Hồ Chí Minh",
        isRead: false,
        createdAt: new Date().toISOString(),
      };

      MOCK_ALERTS.unshift(alert);

      throw new Error(
        "🚨 DEEPFAKE DETECTED! Giao dịch đã bị chặn để bảo vệ tài khoản của bạn."
      );
    }

    // Success transaction
    const successTransaction: Transaction = {
      id: "t" + (MOCK_TRANSACTIONS.length + 1),
      fromAccountId: "acc1",
      toAccountNumber: data.toAccountNumber,
      toAccountName: "Unknown",
      amount: data.amount,
      fee: 0,
      description: data.description,
      transactionCode: "TXN" + String(Date.now()).slice(-6),
      transactionType: "TRANSFER",
      status: "SUCCESS",
      faceVerified: true,
      deepfakeDetected: false,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };

    MOCK_TRANSACTIONS.unshift(successTransaction);

    // Update balance
    MOCK_USERS[0].account.balance -= data.amount;

    return {
      transaction: successTransaction,
      message: "Chuyển tiền thành công!",
    };
  },

  // ALERTS - Get all alerts
  async getAlerts(): Promise<Alert[]> {
    await delay(500);
    return MOCK_ALERTS;
  },

  // ALERTS - Mark as read
  async markAlertAsRead(alertId: string): Promise<void> {
    await delay(300);
    const alert = MOCK_ALERTS.find((a) => a.id === alertId);
    if (alert) {
      alert.isRead = true;
    }
  },
};
