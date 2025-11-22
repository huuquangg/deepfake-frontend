import { useState, useEffect } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuth } from "@/app/contexts/auth-context";
import { mockApiService } from "@/app/services/mock-api.service";
import { Transaction } from "@/app/types/transaction.types";

export default function TransactionHistoryScreen() {
  const colorScheme = useColorScheme();
  const { isAuthenticated } = useAuth();
  const tintColor = Colors[colorScheme ?? "light"].tint;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadTransactions();
    }
  }, [isAuthenticated]);

  const loadTransactions = async () => {
    try {
      setIsLoading(true);
      const data = await mockApiService.getTransactions();
      setTransactions(data);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải lịch sử giao dịch");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadTransactions();
    setIsRefreshing(false);
  };

  const handleTransactionPress = (transaction: Transaction) => {
    Alert.alert(
      "Chi tiết giao dịch",
      `Mã GD: ${
        transaction.transactionCode
      }\nSố tiền: ${transaction.amount.toLocaleString(
        "vi-VN"
      )} VND\nTrạng thái: ${getStatusText(transaction.status)}`,
      [{ text: "Đóng" }]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "#34c759";
      case "BLOCKED":
        return "#ff3b30";
      case "FAILED":
        return "#ff9500";
      case "PENDING":
        return "#007aff";
      default:
        return "#888";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "Thành công";
      case "BLOCKED":
        return "Bị chặn";
      case "FAILED":
        return "Thất bại";
      case "PENDING":
        return "Đang xử lý";
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "checkmark.circle.fill";
      case "BLOCKED":
        return "exclamationmark.triangle.fill";
      case "FAILED":
        return "xmark.circle.fill";
      case "PENDING":
        return "clock.fill";
      default:
        return "info.circle.fill";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;

    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (!isAuthenticated) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.emptyContainer}>
          <IconSymbol name="lock.fill" size={64} color="#888" />
          <ThemedText type="subtitle" style={styles.emptyTitle}>
            Chưa đăng nhập
          </ThemedText>
          <ThemedText style={styles.emptyText}>
            Vui lòng đăng nhập để xem lịch sử giao dịch
          </ThemedText>
          <Pressable
            style={[styles.loginButton, { backgroundColor: tintColor }]}
            onPress={() => router.push("/features/auth/login" as any)}
          >
            <ThemedText style={styles.loginButtonText}>Đăng nhập</ThemedText>
          </Pressable>
        </ThemedView>
      </ThemedView>
    );
  }

  if (isLoading && !isRefreshing) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.loadingContainer}>
          <IconSymbol name="arrow.clockwise" size={48} color={tintColor} />
          <ThemedText style={styles.loadingText}>Đang tải...</ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      <ThemedView style={styles.content}>
        {/* Header */}
        <ThemedView style={styles.headerSection}>
          <ThemedText type="title">Lịch sử giao dịch</ThemedText>
          <ThemedText style={styles.headerSubtext}>
            {transactions.length} giao dịch
          </ThemedText>
        </ThemedView>

        {/* Transactions List */}
        {transactions.length === 0 ? (
          <ThemedView style={styles.emptyState}>
            <IconSymbol name="tray.fill" size={64} color="#888" />
            <ThemedText type="subtitle" style={styles.emptyTitle}>
              Chưa có giao dịch
            </ThemedText>
            <ThemedText style={styles.emptyText}>
              Các giao dịch của bạn sẽ hiển thị ở đây
            </ThemedText>
          </ThemedView>
        ) : (
          <ThemedView style={styles.transactionsList}>
            {transactions.map((transaction) => (
              <Pressable
                key={transaction.id}
                onPress={() => handleTransactionPress(transaction)}
              >
                <ThemedView style={styles.transactionCard}>
                  {/* Icon & Status */}
                  <ThemedView
                    style={[
                      styles.iconContainer,
                      {
                        backgroundColor: `${getStatusColor(
                          transaction.status
                        )}20`,
                      },
                    ]}
                  >
                    <IconSymbol
                      name={getStatusIcon(transaction.status)}
                      size={24}
                      color={getStatusColor(transaction.status)}
                    />
                  </ThemedView>

                  {/* Transaction Info */}
                  <ThemedView style={styles.transactionInfo}>
                    <ThemedText style={styles.transactionTitle}>
                      Chuyển đến {transaction.toAccountNumber}
                    </ThemedText>
                    <ThemedText style={styles.transactionDate}>
                      {formatDate(transaction.createdAt)}
                    </ThemedText>
                    {transaction.description && (
                      <ThemedText style={styles.transactionDescription}>
                        {transaction.description}
                      </ThemedText>
                    )}
                  </ThemedView>

                  {/* Amount & Status */}
                  <ThemedView style={styles.transactionRight}>
                    <ThemedText
                      style={[
                        styles.transactionAmount,
                        {
                          color:
                            transaction.status === "SUCCESS"
                              ? "#ff3b30"
                              : "#888",
                        },
                      ]}
                    >
                      -{transaction.amount.toLocaleString("vi-VN")}
                    </ThemedText>
                    <ThemedView
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: `${getStatusColor(
                            transaction.status
                          )}20`,
                        },
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.statusText,
                          { color: getStatusColor(transaction.status) },
                        ]}
                      >
                        {getStatusText(transaction.status)}
                      </ThemedText>
                    </ThemedView>
                  </ThemedView>

                  {/* Deepfake Warning */}
                  {transaction.deepfakeDetected && (
                    <ThemedView style={styles.deepfakeWarning}>
                      <IconSymbol
                        name="exclamationmark.shield.fill"
                        size={16}
                        color="#ff3b30"
                      />
                      <ThemedText style={styles.deepfakeText}>
                        Deepfake phát hiện
                      </ThemedText>
                    </ThemedView>
                  )}
                </ThemedView>
              </Pressable>
            ))}
          </ThemedView>
        )}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  headerSection: {
    marginBottom: 24,
    gap: 8,
  },
  headerSubtext: {
    fontSize: 14,
    opacity: 0.6,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.7,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 16,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 16,
  },
  emptyTitle: {
    textAlign: "center",
  },
  emptyText: {
    textAlign: "center",
    opacity: 0.6,
  },
  loginButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  transactionsList: {
    gap: 12,
  },
  transactionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  transactionInfo: {
    flex: 1,
    gap: 4,
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  transactionDate: {
    fontSize: 12,
    opacity: 0.6,
  },
  transactionDescription: {
    fontSize: 13,
    opacity: 0.7,
    marginTop: 2,
  },
  transactionRight: {
    alignItems: "flex-end",
    gap: 6,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  deepfakeWarning: {
    position: "absolute",
    bottom: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "rgba(255, 59, 48, 0.1)",
  },
  deepfakeText: {
    fontSize: 10,
    color: "#ff3b30",
    fontWeight: "600",
  },
});
