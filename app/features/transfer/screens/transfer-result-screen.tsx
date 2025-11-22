import { Pressable, ScrollView, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TransferResultScreen() {
  const colorScheme = useColorScheme();
  const params = useLocalSearchParams();
  const tintColor = Colors[colorScheme ?? "light"].tint;

  const isSuccess = params.success === "true";
  const transactionCode = params.transactionCode as string;
  const amount = parseInt(params.amount as string);
  const toAccountNumber = params.toAccountNumber as string;
  const message = params.message as string;
  const error = params.error as string;

  const isDeepfakeDetected = error?.includes("DEEPFAKE");

  const handleGoHome = () => {
    router.replace("/(tabs)");
  };

  const handleViewHistory = () => {
    router.replace("/(tabs)");
    // TODO: Navigate to history tab when implemented
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        {isSuccess ? (
          // SUCCESS RESULT
          <>
            {/* Success Icon */}
            <ThemedView style={styles.iconContainer}>
              <ThemedView style={[styles.iconCircle, styles.successCircle]}>
                <IconSymbol
                  name="checkmark.circle.fill"
                  size={80}
                  color="#34c759"
                />
              </ThemedView>
            </ThemedView>

            {/* Success Message */}
            <ThemedView style={styles.messageSection}>
              <ThemedText type="title" style={styles.successTitle}>
                Chuyển tiền thành công!
              </ThemedText>
              <ThemedText style={styles.messageText}>
                {message || "Giao dịch của bạn đã được thực hiện thành công"}
              </ThemedText>
            </ThemedView>

            {/* Transaction Details */}
            <ThemedView style={styles.detailsCard}>
              <ThemedView style={styles.amountSection}>
                <ThemedText style={styles.amountLabel}>
                  Số tiền đã chuyển
                </ThemedText>
                <ThemedText style={[styles.amountValue, styles.successAmount]}>
                  {amount.toLocaleString("vi-VN")} VND
                </ThemedText>
              </ThemedView>

              <ThemedView style={styles.divider} />

              <ThemedView style={styles.detailsList}>
                <ThemedView style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>
                    Mã giao dịch
                  </ThemedText>
                  <ThemedText style={styles.detailValue}>
                    {transactionCode}
                  </ThemedText>
                </ThemedView>

                <ThemedView style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>Người nhận</ThemedText>
                  <ThemedText style={styles.detailValue}>
                    {toAccountNumber}
                  </ThemedText>
                </ThemedView>

                <ThemedView style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>Thời gian</ThemedText>
                  <ThemedText style={styles.detailValue}>
                    {new Date().toLocaleString("vi-VN")}
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            </ThemedView>

            {/* Security Badge */}
            <ThemedView style={styles.securityBadge}>
              <IconSymbol
                name="checkmark.shield.fill"
                size={24}
                color="#34c759"
              />
              <ThemedText style={styles.securityText}>
                Đã xác thực khuôn mặt - Giao dịch an toàn
              </ThemedText>
            </ThemedView>
          </>
        ) : (
          // FAILED RESULT (Including Deepfake Detection)
          <>
            {/* Error Icon */}
            <ThemedView style={styles.iconContainer}>
              <ThemedView style={[styles.iconCircle, styles.errorCircle]}>
                <IconSymbol
                  name={
                    isDeepfakeDetected
                      ? "exclamationmark.triangle.fill"
                      : "xmark.circle.fill"
                  }
                  size={80}
                  color="#ff3b30"
                />
              </ThemedView>
            </ThemedView>

            {/* Error Message */}
            <ThemedView style={styles.messageSection}>
              <ThemedText type="title" style={styles.errorTitle}>
                {isDeepfakeDetected
                  ? "🚨 Giao dịch bị chặn!"
                  : "Giao dịch thất bại"}
              </ThemedText>
              <ThemedText style={styles.messageText}>
                {error || "Có lỗi xảy ra trong quá trình xử lý"}
              </ThemedText>
            </ThemedView>

            {/* Failed Transaction Info */}
            <ThemedView style={[styles.detailsCard, styles.errorCard]}>
              <ThemedView style={styles.amountSection}>
                <ThemedText style={styles.amountLabel}>Số tiền</ThemedText>
                <ThemedText style={[styles.amountValue, styles.errorAmount]}>
                  {amount.toLocaleString("vi-VN")} VND
                </ThemedText>
              </ThemedView>

              <ThemedView style={styles.divider} />

              <ThemedView style={styles.detailsList}>
                <ThemedView style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>Người nhận</ThemedText>
                  <ThemedText style={styles.detailValue}>
                    {toAccountNumber}
                  </ThemedText>
                </ThemedView>

                <ThemedView style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>Trạng thái</ThemedText>
                  <ThemedText style={[styles.detailValue, styles.blockedText]}>
                    {isDeepfakeDetected ? "Bị chặn" : "Thất bại"}
                  </ThemedText>
                </ThemedView>

                <ThemedView style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>Thời gian</ThemedText>
                  <ThemedText style={styles.detailValue}>
                    {new Date().toLocaleString("vi-VN")}
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            </ThemedView>

            {/* Deepfake Alert */}
            {isDeepfakeDetected && (
              <ThemedView style={styles.deepfakeAlert}>
                <IconSymbol
                  name="exclamationmark.shield.fill"
                  size={32}
                  color="#ff3b30"
                />
                <ThemedView style={styles.alertContent}>
                  <ThemedText style={styles.alertTitle}>
                    Phát hiện Deepfake!
                  </ThemedText>
                  <ThemedText style={styles.alertText}>
                    Hệ thống đã phát hiện khuôn mặt giả mạo. Giao dịch đã bị
                    chặn để bảo vệ tài khoản của bạn.
                  </ThemedText>
                  <ThemedText style={styles.alertSubtext}>
                    📍 Thông tin vị trí và chi tiết đã được ghi lại trong mục
                    Cảnh báo.
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            )}

            {/* What to do */}
            <ThemedView style={styles.helpCard}>
              <ThemedText style={styles.helpTitle}>Bạn cần làm gì?</ThemedText>
              <ThemedView style={styles.helpList}>
                <ThemedView style={styles.helpItem}>
                  <ThemedText style={styles.helpBullet}>•</ThemedText>
                  <ThemedText style={styles.helpText}>
                    {isDeepfakeDetected
                      ? "Liên hệ hotline nếu không phải bạn thực hiện"
                      : "Kiểm tra lại thông tin và thử lại"}
                  </ThemedText>
                </ThemedView>
                <ThemedView style={styles.helpItem}>
                  <ThemedText style={styles.helpBullet}>•</ThemedText>
                  <ThemedText style={styles.helpText}>
                    {isDeepfakeDetected
                      ? "Đổi mật khẩu ngay nếu nghi ngờ bị xâm nhập"
                      : "Kiểm tra số dư tài khoản"}
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            </ThemedView>
          </>
        )}

        {/* Action Buttons */}
        <ThemedView style={styles.actionButtons}>
          <Pressable
            style={[styles.homeButton, { backgroundColor: tintColor }]}
            onPress={handleGoHome}
          >
            <IconSymbol name="house.fill" size={20} color="#fff" />
            <ThemedText style={styles.homeButtonText}>Về trang chủ</ThemedText>
          </Pressable>
          {isSuccess && (
            <Pressable
              style={[styles.historyButton, { borderColor: tintColor }]}
              onPress={handleViewHistory}
            >
              <IconSymbol name="clock.fill" size={20} color={tintColor} />
              <ThemedText
                style={[styles.historyButtonText, { color: tintColor }]}
              >
                Lịch sử GD
              </ThemedText>
            </Pressable>
          )}
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
    paddingTop: 80,
    paddingBottom: 40,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  successCircle: {
    backgroundColor: "rgba(52, 199, 89, 0.1)",
  },
  errorCircle: {
    backgroundColor: "rgba(255, 59, 48, 0.1)",
  },
  messageSection: {
    alignItems: "center",
    marginBottom: 32,
    gap: 8,
  },
  successTitle: {
    color: "#34c759",
    textAlign: "center",
  },
  errorTitle: {
    color: "#ff3b30",
    textAlign: "center",
  },
  messageText: {
    textAlign: "center",
    opacity: 0.7,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  detailsCard: {
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
  errorCard: {
    backgroundColor: "rgba(255, 59, 48, 0.05)",
  },
  amountSection: {
    alignItems: "center",
    paddingVertical: 8,
  },
  amountLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: "bold",
  },
  successAmount: {
    color: "#34c759",
  },
  errorAmount: {
    color: "#ff3b30",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E5E5",
    marginVertical: 16,
  },
  detailsList: {
    gap: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    textAlign: "right",
  },
  blockedText: {
    color: "#ff3b30",
  },
  securityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(52, 199, 89, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  securityText: {
    flex: 1,
    fontSize: 14,
    color: "#34c759",
    fontWeight: "600",
  },
  deepfakeAlert: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    gap: 16,
    borderWidth: 2,
    borderColor: "rgba(255, 59, 48, 0.3)",
  },
  alertContent: {
    flex: 1,
    gap: 8,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ff3b30",
  },
  alertText: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
  },
  alertSubtext: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  helpCard: {
    backgroundColor: "rgba(255, 149, 0, 0.1)",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  helpList: {
    gap: 12,
  },
  helpItem: {
    flexDirection: "row",
    gap: 8,
  },
  helpBullet: {
    fontSize: 16,
    fontWeight: "bold",
  },
  helpText: {
    flex: 1,
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    paddingBottom: 20,
  },
  homeButton: {
    flex: 1, // Cả 2 nút bằng nhau
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 56,
    borderRadius: 12,
  },
  homeButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  historyButton: {
    flex: 1, // Cả 2 nút bằng nhau
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
  },
  historyButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
