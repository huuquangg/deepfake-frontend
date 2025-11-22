import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuth } from "@/app/contexts/auth-context";
import { mockApiService } from "@/app/services/mock-api.service";

export default function TransferConfirmScreen() {
  const colorScheme = useColorScheme();
  const params = useLocalSearchParams();
  const { account, refreshAccount } = useAuth();
  const tintColor = Colors[colorScheme ?? "light"].tint;

  const [isProcessing, setIsProcessing] = useState(false);

  const { toAccountNumber, amount, description, faceImageUri } = params;
  const amountNumber = parseInt(amount as string);

  const handleConfirm = async () => {
    setIsProcessing(true);

    try {
      // Call mock API to transfer
      const response = await mockApiService.transfer(
        {
          toAccountNumber: toAccountNumber as string,
          amount: amountNumber,
          description: description as string,
        },
        faceImageUri as string
      );

      // Refresh account balance
      await refreshAccount();

      // Navigate to result screen
      router.replace({
        pathname: "/features/transfer/result" as any,
        params: {
          success: "true",
          transactionCode: response.transaction.transactionCode,
          amount: amountNumber.toString(),
          toAccountNumber: toAccountNumber as string,
          message: response.message,
        },
      });
    } catch (error: any) {
      // Deepfake detected or other error
      setIsProcessing(false);

      // Navigate to result screen with error
      router.replace({
        pathname: "/features/transfer/result" as any,
        params: {
          success: "false",
          amount: amountNumber.toString(),
          toAccountNumber: toAccountNumber as string,
          error: error.message || "Có lỗi xảy ra",
        },
      });
    }
  };

  const handleEdit = () => {
    router.back();
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color={tintColor} />
          </Pressable>
          <ThemedText type="title" style={styles.title}>
            Xác nhận giao dịch
          </ThemedText>
          <ThemedView style={{ width: 24 }} />
        </ThemedView>

        {/* Transaction Info Card */}
        <ThemedView style={styles.infoCard}>
          <ThemedView style={styles.amountSection}>
            <ThemedText style={styles.amountLabel}>Số tiền chuyển</ThemedText>
            <ThemedText style={styles.amountValue}>
              {amountNumber.toLocaleString("vi-VN")} VND
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.divider} />

          {/* Details */}
          <ThemedView style={styles.detailsSection}>
            <ThemedView style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Người nhận</ThemedText>
              <ThemedText style={styles.detailValue}>
                {toAccountNumber}
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Nội dung</ThemedText>
              <ThemedText style={[styles.detailValue, styles.descriptionText]}>
                {description}
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Phí giao dịch</ThemedText>
              <ThemedText style={[styles.detailValue, styles.freeText]}>
                Miễn phí
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.divider} />

            <ThemedView style={styles.detailRow}>
              <ThemedText style={styles.totalLabel}>Tổng tiền</ThemedText>
              <ThemedText style={styles.totalValue}>
                {amountNumber.toLocaleString("vi-VN")} VND
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Source Account */}
        {account && (
          <ThemedView style={styles.sourceCard}>
            <ThemedView style={styles.sourceHeader}>
              <IconSymbol name="creditcard.fill" size={24} color={tintColor} />
              <ThemedText style={styles.sourceTitle}>
                Tài khoản nguồn
              </ThemedText>
            </ThemedView>
            <ThemedText style={styles.sourceAccount}>
              {account.accountNumber} - {account.accountName}
            </ThemedText>
            <ThemedView style={styles.balanceRow}>
              <ThemedText style={styles.balanceLabel}>Số dư sau GD:</ThemedText>
              <ThemedText style={styles.balanceValue}>
                {(account.balance - amountNumber).toLocaleString("vi-VN")} VND
              </ThemedText>
            </ThemedView>
          </ThemedView>
        )}

        {/* Security Badge */}
        <ThemedView style={styles.securityBadge}>
          <IconSymbol name="checkmark.shield.fill" size={24} color="#34c759" />
          <ThemedView style={styles.securityText}>
            <ThemedText style={styles.securityTitle}>
              Đã xác thực khuôn mặt
            </ThemedText>
            <ThemedText style={styles.securitySubtitle}>
              Giao dịch được bảo vệ bởi công nghệ deepfake detection
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Action Buttons */}
        <ThemedView style={styles.actionButtons}>
          <Pressable
            style={[styles.editButton, { borderColor: tintColor }]}
            onPress={handleEdit}
            disabled={isProcessing}
          >
            <IconSymbol name="pencil" size={20} color={tintColor} />
            <ThemedText style={[styles.editButtonText, { color: tintColor }]}>
              Sửa
            </ThemedText>
          </Pressable>

          <Pressable
            style={[
              styles.confirmButton,
              { backgroundColor: tintColor },
              isProcessing && styles.buttonDisabled,
            ]}
            onPress={handleConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <ActivityIndicator color="#fff" />
                <ThemedText style={styles.confirmButtonText}>
                  Đang xử lý...
                </ThemedText>
              </>
            ) : (
              <>
                <ThemedText style={styles.confirmButtonText}>
                  Xác nhận chuyển tiền
                </ThemedText>
                <IconSymbol
                  name="checkmark.circle.fill"
                  size={24}
                  color="#fff"
                />
              </>
            )}
          </Pressable>
        </ThemedView>

        {/* Warning */}
        <ThemedView style={styles.warningCard}>
          <IconSymbol
            name="exclamationmark.triangle.fill"
            size={20}
            color="#ff9500"
          />
          <ThemedText style={styles.warningText}>
            Vui lòng kiểm tra kỹ thông tin trước khi xác nhận. Giao dịch không
            thể hoàn tác.
          </ThemedText>
        </ThemedView>
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
    paddingBottom: 40, // Thêm padding dưới
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  title: {
    flex: 1,
    textAlign: "center",
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  amountSection: {
    alignItems: "center",
    paddingVertical: 16,
  },
  amountLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#0a7ea4",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E5E5",
    marginVertical: 16,
  },
  detailsSection: {
    gap: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  detailLabel: {
    fontSize: 14,
    opacity: 0.7,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    flex: 2,
    textAlign: "right",
  },
  descriptionText: {
    fontWeight: "400",
  },
  freeText: {
    color: "#34c759",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0a7ea4",
  },
  sourceCard: {
    backgroundColor: "rgba(10, 126, 164, 0.1)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    gap: 12,
    overflow: "visible", // Thêm
  },
  sourceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "transparent", // Thêm để tránh box trắng
  },
  sourceTitle: {
    fontSize: 16,
    fontWeight: "600",
    backgroundColor: "transparent", // Thêm
  },
  sourceAccount: {
    fontSize: 14,
    opacity: 0.8,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(10, 126, 164, 0.2)",
    backgroundColor: "transparent",
  },
  balanceLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  balanceValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  securityBadge: {
    flexDirection: "row",
    alignItems: "flex-start", // Đổi từ center
    gap: 12,
    backgroundColor: "rgba(52, 199, 89, 0.1)",
    borderRadius: 12,
    padding: 16,
    paddingVertical: 20, // Thêm
    marginBottom: 24,
  },
  securityText: {
    flex: 1,
    gap: 4,
    paddingTop: 2, // Thêm để căn với icon
    backgroundColor: "transparent",
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#34c759",
    lineHeight: 20, // Thêm
  },
  securitySubtitle: {
    fontSize: 12,
    opacity: 0.7,
    lineHeight: 18, // Thêm
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  editButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  confirmButton: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 56,
    borderRadius: 12,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  warningCard: {
    flexDirection: "row",
    alignItems: "flex-start", // Đổi từ center
    gap: 12,
    backgroundColor: "rgba(255, 149, 0, 0.1)",
    borderRadius: 12,
    padding: 16,
    paddingVertical: 20, // Thêm
    marginBottom: 20, // Thêm
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    opacity: 0.8,
    lineHeight: 20, // Thêm
    paddingTop: 2, // Thêm để căn với icon
  },
});
