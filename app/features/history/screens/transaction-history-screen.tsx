// Transaction History Screen - Modern Banking UI
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
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

// Transaction item từ backend
interface TransactionItem {
  id: number;
  transaction_id: string;
  from_account_id: number;
  to_account_id?: number;
  to_account_number: string;
  amount: number;
  description: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  created_at: string;
  completed_at?: string;
}

type FilterType = "ALL" | "INCOMING" | "OUTGOING";

export default function TransactionHistoryScreen() {
  const { tokens, account } = useAuth();
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    TransactionItem[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [myAccountId, setMyAccountId] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>("ALL");
  const [balance, setBalance] = useState<number>(0);
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [accountName, setAccountName] = useState<string>("");

  // Lấy account ID và balance của user hiện tại
  useEffect(() => {
    const fetchAccountInfo = async () => {
      if (!tokens?.accessToken) return;

      try {
        const accountInfo = await apiService.getAccountInfo(tokens.accessToken);
        setMyAccountId(parseInt(accountInfo.id));
        setBalance(accountInfo.balance || 0);
        setAccountNumber(accountInfo.accountNumber || "");
        setAccountName(accountInfo.accountName || "");
      } catch (err) {
        console.error("Failed to get account info:", err);
      }
    };

    fetchAccountInfo();
  }, [tokens]);

  // Fetch transaction history
  useEffect(() => {
    fetchTransactions();
  }, [tokens]);

  // Filter transactions when filter changes
  useEffect(() => {
    filterTransactions();
  }, [activeFilter, transactions, myAccountId]);

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

  const filterTransactions = () => {
    if (activeFilter === "ALL") {
      setFilteredTransactions(transactions);
    } else if (activeFilter === "INCOMING") {
      setFilteredTransactions(
        transactions.filter((t) => !isOutgoingTransaction(t))
      );
    } else {
      setFilteredTransactions(
        transactions.filter((t) => isOutgoingTransaction(t))
      );
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
    });
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString("vi-VN");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "#10B981";
      case "PENDING":
        return "#F59E0B";
      case "FAILED":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const isOutgoingTransaction = (transaction: TransactionItem) => {
    if (!myAccountId) return true;
    return transaction.from_account_id === myAccountId;
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
      showsVerticalScrollIndicator={false}
    >
      <ThemedView style={styles.content}>
        {/* Account Card */}
        <View style={styles.accountCard}>
          <View style={styles.cardHeader}>
            <ThemedText style={styles.cardTitle}>
              {accountName || "TÀI KHOẢN NGUỒN"}
            </ThemedText>
            <Ionicons name="chevron-forward" size={24} color="#fff" />
          </View>

          <View style={styles.cardBody}>
            <View style={styles.accountNumberRow}>
              <ThemedText style={styles.accountLabel}>
                Account number
              </ThemedText>
              <View style={styles.accountNumberWithCopy}>
                <ThemedText style={styles.accountNumberInline}>
                  {accountNumber || "0000000000"}
                </ThemedText>
                <Pressable
                  onPress={() => {
                    /* TODO: Copy to clipboard */
                  }}
                >
                  <Ionicons name="copy-outline" size={18} color="#ffffff80" />
                </Pressable>
              </View>
            </View>

            <View style={styles.balanceRow}>
              <ThemedText style={styles.balanceLabel}>Balance</ThemedText>
              <ThemedText style={styles.balanceAmount}>
                {formatAmount(balance)}{" "}
                <ThemedText style={styles.currency}>VND</ThemedText>
              </ThemedText>
            </View>
          </View>

          {/* Decorative circles */}
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />
        </View>

        {/* Transaction History Section */}
        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <ThemedText type="subtitle" style={styles.historyTitle}>
              Transaction history
            </ThemedText>
            {/* <Pressable>
              <ThemedText style={styles.searchMore}>Search more</ThemedText>
            </Pressable> */}
          </View>

          {/* Filter Tabs */}
          <View style={styles.filterTabs}>
            <Pressable
              style={[
                styles.filterTab,
                activeFilter === "ALL" && styles.filterTabActive,
              ]}
              onPress={() => setActiveFilter("ALL")}
            >
              <ThemedText
                style={[
                  styles.filterText,
                  activeFilter === "ALL" && styles.filterTextActive,
                ]}
              >
                All
              </ThemedText>
            </Pressable>

            <Pressable
              style={[
                styles.filterTab,
                activeFilter === "INCOMING" && styles.filterTabActive,
              ]}
              onPress={() => setActiveFilter("INCOMING")}
            >
              <ThemedText
                style={[
                  styles.filterText,
                  activeFilter === "INCOMING" && styles.filterTextActive,
                ]}
              >
                Incoming
              </ThemedText>
            </Pressable>

            <Pressable
              style={[
                styles.filterTab,
                activeFilter === "OUTGOING" && styles.filterTabActive,
              ]}
              onPress={() => setActiveFilter("OUTGOING")}
            >
              <ThemedText
                style={[
                  styles.filterText,
                  activeFilter === "OUTGOING" && styles.filterTextActive,
                ]}
              >
                Outgoing
              </ThemedText>
            </Pressable>
          </View>

          {/* Transaction List */}
          {filteredTransactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color="#9CA3AF" />
              <ThemedText style={styles.emptyText}>
                Chưa có giao dịch nào
              </ThemedText>
            </View>
          ) : (
            <View style={styles.transactionList}>
              {filteredTransactions.map((transaction) => {
                const isOutgoing = isOutgoingTransaction(transaction);
                const date = formatDate(transaction.created_at);

                return (
                  <Pressable
                    key={transaction.id}
                    style={styles.transactionItem}
                    onPress={() => {
                      /* TODO: Navigate to detail */
                    }}
                  >
                    <View style={styles.transactionLeft}>
                      <ThemedText style={styles.transactionDate}>
                        {date}
                      </ThemedText>
                      <ThemedText
                        style={styles.transactionDescription}
                        numberOfLines={2}
                      >
                        {transaction.description || "Không có mô tả"}
                      </ThemedText>
                      <ThemedText
                        style={styles.transactionId}
                        numberOfLines={1}
                      >
                        ID: {transaction.transaction_id}
                      </ThemedText>
                    </View>

                    <View style={styles.transactionRight}>
                      <ThemedText
                        style={[
                          styles.transactionAmount,
                          { color: isOutgoing ? "#EF4444" : "#34c759" },
                        ]}
                      >
                        {isOutgoing ? "-" : "+"}
                        {formatAmount(transaction.amount)} VND
                      </ThemedText>
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color="#9CA3AF"
                      />
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
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

  // Account Card Styles
  accountCard: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 24,
    borderRadius: 20,
    padding: 24,
    minHeight: 200,
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#0a7ea4",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  cardBody: {
    gap: 12,
  },
  accountNumberRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  accountLabel: {
    fontSize: 13,
    color: "#ffffff80",
    fontWeight: "500",
  },
  accountNumberWithCopy: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  accountNumberInline: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 1,
  },
  accountNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 2,
    marginBottom: 8,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  balanceLabel: {
    fontSize: 13,
    color: "#ffffff80",
    fontWeight: "500",
  },
  balanceAmount: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -1,
  },
  currency: {
    fontSize: 18,
    fontWeight: "600",
    opacity: 0.9,
    color: "#fff",
  },
  decorativeCircle1: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    top: -50,
    right: -50,
  },
  decorativeCircle2: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    bottom: -30,
    left: -30,
  },

  // History Section
  historySection: {
    paddingHorizontal: 20,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  searchMore: {
    fontSize: 14,
    color: "#3b82f6",
    fontWeight: "600",
  },

  // Filter Tabs
  filterTabs: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  filterTabActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  filterTextActive: {
    color: "#0a7ea4",
  },

  // Transaction List
  transactionList: {
    gap: 0,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  transactionLeft: {
    flex: 1,
    gap: 4,
  },
  transactionDate: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "500",
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
    paddingRight: 12,
  },
  transactionId: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
    fontFamily: "monospace",
  },
  transactionRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "right",
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: "#9CA3AF",
    fontWeight: "500",
  },
});
