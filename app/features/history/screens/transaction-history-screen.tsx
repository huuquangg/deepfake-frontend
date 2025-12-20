// Transaction History Screen - Hiển thị lịch sử giao dịch
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/app/contexts/auth-context";
import { apiService } from "@/app/services/api.service";
import { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  RefreshControl,
  View,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Transaction item từ backend
interface TransactionItem {
  id: number;
  transaction_id: string;
  from_account_id: number;
  to_account_id?: number; // ⭐ THÊM để phân biệt GỬI/NHẬN
  to_account_number: string;
  amount: number;
  description: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  created_at: string;
  completed_at?: string;
}

export default function TransactionHistoryScreen() {
  const { tokens, account } = useAuth();
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [myAccountId, setMyAccountId] = useState<number | null>(null);

  // Lấy account ID của user hiện tại
  useEffect(() => {
    const fetchAccountId = async () => {
      if (!tokens?.accessToken) return;

      try {
        const accountInfo = await apiService.getAccountInfo(tokens.accessToken);
        setMyAccountId(parseInt(accountInfo.id));
      } catch (err) {
        console.error("Failed to get account ID:", err);
      }
    };

    fetchAccountId();
  }, [tokens]);

  // Fetch transaction history khi vào screen
  useEffect(() => {
    fetchTransactions();
  }, [tokens]);

  const fetchTransactions = async () => {
    if (!tokens?.accessToken) {
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      const result = await apiService.getTransactionHistory(tokens.accessToken);
      setTransactions(result);
    } catch (err: any) {
      console.error("Failed to fetch transactions:", err);
      setError(err.message || "Không thể tải lịch sử giao dịch");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchTransactions();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString("vi-VN") + " VND";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "#10B981"; // Green
      case "PENDING":
        return "#F59E0B"; // Orange
      case "FAILED":
        return "#EF4444"; // Red
      default:
        return "#6B7280"; // Gray
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "Thành công";
      case "PENDING":
        return "Đang xử lý";
      case "FAILED":
        return "Thất bại";
      default:
        return status;
    }
  };

  const isOutgoingTransaction = (transaction: TransactionItem) => {
    // So sánh from_account_id với account ID hiện tại
    if (!myAccountId) return true; // Fallback

    // Nếu from_account_id trùng với account của mình → Tiền GỬI ĐI
    // Ngược lại → Tiền NHẬN VÀO
    return transaction.from_account_id === myAccountId;
  };

  const getTransactionLabel = (transaction: TransactionItem) => {
    const isOutgoing = isOutgoingTransaction(transaction);

    if (isOutgoing) {
      return `Đến: ${transaction.to_account_number}`;
    } else {
      return `Từ: ${transaction.to_account_number}`;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <ThemedText style={styles.loadingText}>Đang tải...</ThemedText>
      </ThemedView>
    );
  }

  // Error state
  if (error && !isRefreshing) {
    return (
      <ThemedView style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <ThemedText style={styles.errorText}>{error}</ThemedText>
        <Pressable style={styles.retryButton} onPress={fetchTransactions}>
          <ThemedText style={styles.retryButtonText}>Thử lại</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }
    >
      <ThemedView style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Lịch sử giao dịch
        </ThemedText>

        {transactions.length === 0 ? (
          <ThemedView style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={64} color="#9CA3AF" />
            <ThemedText style={styles.emptyText}>
              Chưa có giao dịch nào
            </ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Lịch sử giao dịch của bạn sẽ hiển thị ở đây
            </ThemedText>
          </ThemedView>
        ) : (
          <ThemedView style={styles.list}>
            {transactions.map((transaction) => {
              const isOutgoing = isOutgoingTransaction(transaction);

              return (
                <Pressable
                  key={transaction.id}
                  style={styles.transactionCard}
                  onPress={() => {
                    // TODO: Navigate to transaction detail
                  }}
                >
                  {/* Icon & Type */}
                  <View style={styles.iconContainer}>
                    <Ionicons
                      name={
                        isOutgoing ? "arrow-down-circle" : "arrow-up-circle"
                      }
                      size={40}
                      color={isOutgoing ? "#EF4444" : "#10B981"}
                    />
                  </View>

                  {/* Transaction Info */}
                  <View style={styles.infoContainer}>
                    <ThemedText style={styles.transactionType}>
                      {isOutgoing ? "Chuyển tiền" : "Nhận tiền"}
                    </ThemedText>
                    <ThemedText style={styles.accountNumber}>
                      {getTransactionLabel(transaction)}
                    </ThemedText>
                    <ThemedText style={styles.description} numberOfLines={1}>
                      {transaction.description || "Không có mô tả"}
                    </ThemedText>
                    <ThemedText style={styles.date}>
                      {formatDate(transaction.created_at)}
                    </ThemedText>
                  </View>

                  {/* Amount & Status */}
                  <View style={styles.rightContainer}>
                    <ThemedText
                      style={[
                        styles.amount,
                        {
                          color: isOutgoing ? "#EF4444" : "#10B981",
                        },
                      ]}
                    >
                      {isOutgoing ? "-" : "+"}
                      {formatAmount(transaction.amount)}
                    </ThemedText>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            getStatusColor(transaction.status) + "20",
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
                    </View>
                  </View>
                </Pressable>
              );
            })}
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
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: "#EF4444",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#007AFF",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  title: {
    marginBottom: 24,
  },
  list: {
    gap: 12,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
    gap: 8,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  emptySubtext: {
    opacity: 0.6,
    textAlign: "center",
  },
  transactionCard: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  infoContainer: {
    flex: 1,
    gap: 4,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: "600",
  },
  accountNumber: {
    fontSize: 14,
    opacity: 0.7,
  },
  description: {
    fontSize: 14,
    opacity: 0.6,
  },
  date: {
    fontSize: 12,
    opacity: 0.5,
  },
  rightContainer: {
    alignItems: "flex-end",
    gap: 8,
  },
  amount: {
    fontSize: 16,
    fontWeight: "700",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
