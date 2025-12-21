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
    router.push("/features/history/screens/transaction-history-screen");
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
                Transfer successful!
              </ThemedText>
              <ThemedText style={styles.messageText}>
                {message || "Your transaction has been completed successfully."}
              </ThemedText>
            </ThemedView>

            {/* Transaction Details */}
            <ThemedView style={styles.detailsCard}>
              <ThemedView style={styles.amountSection}>
                <ThemedText style={styles.amountLabel}>
                  Transferred amount
                </ThemedText>
                <ThemedText style={[styles.amountValue, styles.successAmount]}>
                  {amount.toLocaleString("vi-VN")} VND
                </ThemedText>
              </ThemedView>

              <ThemedView style={styles.divider} />

              <ThemedView style={styles.detailsList}>
                <ThemedView style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>
                    Transaction ID
                  </ThemedText>
                  <ThemedText style={styles.detailValue}>
                    {transactionCode}
                  </ThemedText>
                </ThemedView>

                <ThemedView style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>Recipient</ThemedText>
                  <ThemedText style={styles.detailValue}>
                    {toAccountNumber}
                  </ThemedText>
                </ThemedView>

                <ThemedView style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>Time</ThemedText>
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
                Face authentication verified – Secure transaction
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
                  color="#EF4444"
                />
              </ThemedView>
            </ThemedView>

            {/* Error Message */}
            <ThemedView style={styles.messageSection}>
              <ThemedText type="title" style={styles.errorTitle}>
                {isDeepfakeDetected
                  ? "Transaction blocked!"
                  : "Transaction failed"}
              </ThemedText>
              <ThemedText style={styles.messageText}>
                {error || "An error occurred during processing."}
              </ThemedText>
            </ThemedView>

            {/* Failed Transaction Info */}
            <ThemedView style={[styles.detailsCard, styles.errorCard]}>
              <ThemedView style={styles.amountSection}>
                <ThemedText style={styles.amountLabel}>Amount</ThemedText>
                <ThemedText style={[styles.amountValue, styles.errorAmount]}>
                  {amount.toLocaleString("vi-VN")} VND
                </ThemedText>
              </ThemedView>

              <ThemedView style={styles.divider} />

              <ThemedView style={styles.detailsList}>
                <ThemedView style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>Recipient</ThemedText>
                  <ThemedText style={styles.detailValue}>
                    {toAccountNumber}
                  </ThemedText>
                </ThemedView>

                <ThemedView style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>Status</ThemedText>
                  <ThemedText style={[styles.detailValue, styles.blockedText]}>
                    {isDeepfakeDetected ? "Blocked" : "Failed"}
                  </ThemedText>
                </ThemedView>

                <ThemedView style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>Time</ThemedText>
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
                  color="#EF4444"
                />
                <ThemedView style={styles.alertContent}>
                  <ThemedText style={styles.alertTitle}>
                    Phát hiện Deepfake!
                  </ThemedText>
                  <ThemedText style={styles.alertText}>
                    The system detected a fake face. The transaction has been
                    blocked to protect your account.
                  </ThemedText>
                  <ThemedText style={styles.alertSubtext}>
                    Location information and details have been recorded in the
                    Alerts section.
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            )}

            {/* What to do */}
            <ThemedView style={styles.helpCard}>
              <ThemedText style={styles.helpTitle}>
                What should you do?
              </ThemedText>
              <ThemedView style={styles.helpList}>
                <ThemedView style={styles.helpItem}>
                  <ThemedText style={styles.helpBullet}>•</ThemedText>
                  <ThemedText style={styles.helpText}>
                    {isDeepfakeDetected
                      ? "Contact the hotline if this was not you"
                      : "Check the information and try again"}
                  </ThemedText>
                </ThemedView>
                <ThemedView style={styles.helpItem}>
                  <ThemedText style={styles.helpBullet}>•</ThemedText>
                  <ThemedText style={styles.helpText}>
                    {isDeepfakeDetected
                      ? "Change your password immediately if you suspect a breach"
                      : "Check your account balance"}
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
            <ThemedText style={styles.homeButtonText}> Go to Home</ThemedText>
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
                Transaction History
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
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  messageSection: {
    alignItems: "center",
    marginBottom: 32,
    gap: 8,
  },
  successTitle: {
    color: "#34c759",
    textAlign: "center",
    fontWeight: "700",
  },
  errorTitle: {
    color: "#EF4444",
    textAlign: "center",
    fontWeight: "700",
  },
  messageText: {
    textAlign: "center",
    color: "#6b7280",
    lineHeight: 22,
    paddingHorizontal: 20,
    fontSize: 15,
  },
  detailsCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  errorCard: {
    backgroundColor: "rgba(239, 68, 68, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.1)",
  },
  amountSection: {
    alignItems: "center",
    paddingVertical: 12,
  },
  amountLabel: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -1,
  },
  successAmount: {
    color: "#34c759",
  },
  errorAmount: {
    color: "#EF4444",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E5EA",
    marginVertical: 16,
  },
  detailsList: {
    gap: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
    width: 100,
    flexShrink: 0,
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    textAlign: "right",
    lineHeight: 20,
  },
  blockedText: {
    color: "#EF4444",
    fontWeight: "700",
  },
  securityBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "rgba(52, 199, 89, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(52, 199, 89, 0.2)",
  },
  securityText: {
    fontSize: 14,
    color: "#34c759",
    fontWeight: "600",
    textAlign: "center",
  },
  deepfakeAlert: {
    flexDirection: "row",
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    gap: 16,
    borderWidth: 2,
    borderColor: "rgba(239, 68, 68, 0.2)",
  },
  alertContent: {
    flex: 1,
    gap: 8,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#EF4444",
  },
  alertText: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  alertSubtext: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 4,
  },
  helpCard: {
    backgroundColor: "rgba(251, 191, 36, 0.1)",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.2)",
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 12,
  },
  helpList: {
    gap: 12,
  },
  helpItem: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  helpBullet: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#d97706",
  },
  helpText: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: "column",
    gap: 12,
    paddingBottom: 20,
  },
  homeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 56,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  homeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  historyButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: "#fff",
  },
  historyButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
});
