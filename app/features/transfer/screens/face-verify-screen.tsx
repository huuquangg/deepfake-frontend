import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function FaceVerifyScreen() {
  const colorScheme = useColorScheme();
  const params = useLocalSearchParams();
  const tintColor = Colors[colorScheme ?? "light"].tint;

  const [isVerified, setIsVerified] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { toAccountNumber, amount, description } = params;

  const handleSimulateCapture = () => {
    setIsProcessing(true);

    // Simulate camera capture and processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsVerified(true);
    }, 1500);
  };

  const handleRetake = () => {
    setIsVerified(false);
  };

  const handleContinue = () => {
    if (!isVerified) {
      Alert.alert("Lỗi", "Vui lòng xác thực khuôn mặt");
      return;
    }

    // Navigate to confirm screen
    router.push({
      pathname: "/features/transfer/confirm" as any,
      params: {
        toAccountNumber,
        amount,
        description,
        faceImageUri: "verified", // Mock value
      },
    });
  };

  return (
    <ScrollView style={styles.scrollContainer}>
      <ThemedView style={styles.container}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color={tintColor} />
          </Pressable>
          <ThemedText type="title" style={styles.title}>
            Xác thực khuôn mặt
          </ThemedText>
          <ThemedView style={{ width: 24 }} />
        </ThemedView>

        {/* Content */}
        <ThemedView style={styles.content}>
          {!isVerified ? (
            // Before verification
            <>
              <ThemedView style={styles.instructionCard}>
                <IconSymbol
                  name="face.smiling.fill"
                  size={80}
                  color={tintColor}
                />
                <ThemedText type="subtitle" style={styles.instructionTitle}>
                  Xác thực danh tính
                </ThemedText>
                <ThemedText style={styles.instructionText}>
                  Để đảm bảo an toàn cho giao dịch, vui lòng xác thực khuôn mặt
                  của bạn
                </ThemedText>
              </ThemedView>

              {/* Instructions */}
              <ThemedView style={styles.tipsContainer}>
                <ThemedText style={styles.tipsTitle}>
                  Lưu ý khi xác thực:
                </ThemedText>
                <ThemedView style={styles.tipItem}>
                  <IconSymbol
                    name="checkmark.circle.fill"
                    size={20}
                    color="#34c759"
                  />
                  <ThemedText style={styles.tipText}>
                    Đảm bảo khuôn mặt rõ ràng, không bị che khuất
                  </ThemedText>
                </ThemedView>
                <ThemedView style={styles.tipItem}>
                  <IconSymbol
                    name="checkmark.circle.fill"
                    size={20}
                    color="#34c759"
                  />
                  <ThemedText style={styles.tipText}>
                    Xác thực trong điều kiện ánh sáng tốt
                  </ThemedText>
                </ThemedView>
                <ThemedView style={styles.tipItem}>
                  <IconSymbol
                    name="checkmark.circle.fill"
                    size={20}
                    color="#34c759"
                  />
                  <ThemedText style={styles.tipText}>
                    Nhìn thẳng vào màn hình
                  </ThemedText>
                </ThemedView>
              </ThemedView>

              {/* Mock Note */}
              <ThemedView style={styles.mockNote}>
                <IconSymbol name="info.circle.fill" size={20} color="#ff9500" />
                <ThemedText style={styles.mockText}>
                  💡 Demo Mode: Nhấn nút bên dưới để giả lập xác thực khuôn mặt
                </ThemedText>
              </ThemedView>

              {/* Capture Button */}
              <Pressable
                style={[
                  styles.captureButton,
                  { backgroundColor: tintColor },
                  isProcessing && styles.buttonDisabled,
                ]}
                onPress={handleSimulateCapture}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <IconSymbol name="hourglass" size={24} color="#fff" />
                    <ThemedText style={styles.captureButtonText}>
                      Đang xác thực...
                    </ThemedText>
                  </>
                ) : (
                  <>
                    <IconSymbol name="camera.fill" size={24} color="#fff" />
                    <ThemedText style={styles.captureButtonText}>
                      Xác thực khuôn mặt
                    </ThemedText>
                  </>
                )}
              </Pressable>
            </>
          ) : (
            // After verification
            <>
              <ThemedView style={styles.successCard}>
                <ThemedView style={styles.successIcon}>
                  <IconSymbol
                    name="checkmark.circle.fill"
                    size={100}
                    color="#34c759"
                  />
                </ThemedView>
                <ThemedText type="title" style={styles.successTitle}>
                  Xác thực thành công!
                </ThemedText>
                <ThemedText style={styles.successText}>
                  Khuôn mặt của bạn đã được xác thực. Hệ thống không phát hiện
                  dấu hiệu deepfake.
                </ThemedText>
              </ThemedView>

              {/* Stats */}
              <ThemedView style={styles.statsContainer}>
                <ThemedView style={styles.statItem}>
                  <IconSymbol
                    name="checkmark.seal.fill"
                    size={32}
                    color="#34c759"
                  />
                  <ThemedText style={styles.statLabel}>Độ tin cậy</ThemedText>
                  <ThemedText style={styles.statValue}>98%</ThemedText>
                </ThemedView>
                <ThemedView style={styles.statItem}>
                  <IconSymbol name="shield.fill" size={32} color="#34c759" />
                  <ThemedText style={styles.statLabel}>Bảo mật</ThemedText>
                  <ThemedText style={styles.statValue}>Cao</ThemedText>
                </ThemedView>
              </ThemedView>

              {/* Action Buttons */}
              <ThemedView style={styles.actionButtons}>
                <Pressable
                  style={[styles.retakeButton, { borderColor: tintColor }]}
                  onPress={handleRetake}
                >
                  <IconSymbol
                    name="arrow.clockwise"
                    size={20}
                    color={tintColor}
                  />
                  <ThemedText
                    style={[styles.retakeButtonText, { color: tintColor }]}
                  >
                    Thử lại
                  </ThemedText>
                </Pressable>

                <Pressable
                  style={[
                    styles.continueButton,
                    { backgroundColor: tintColor },
                  ]}
                  onPress={handleContinue}
                >
                  <ThemedText style={styles.continueButtonText}>
                    Tiếp tục
                  </ThemedText>
                  <IconSymbol name="arrow.right" size={20} color="#fff" />
                </Pressable>
              </ThemedView>
            </>
          )}
        </ThemedView>

        {/* Security Note */}
        <ThemedView style={styles.securityNote}>
          <IconSymbol name="lock.shield.fill" size={20} color={tintColor} />
          <ThemedText style={styles.securityText}>
            Dữ liệu sinh trắc học được mã hóa và bảo mật
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: 60,
    paddingBottom: 40, // Thêm padding dưới
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  title: {
    flex: 1,
    textAlign: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  instructionCard: {
    alignItems: "center",
    padding: 32,
    borderRadius: 20,
    backgroundColor: "rgba(10, 126, 164, 0.1)",
    marginBottom: 32,
    gap: 16,
  },
  instructionTitle: {
    textAlign: "center",
  },
  instructionText: {
    textAlign: "center",
    opacity: 0.7,
    lineHeight: 22,
  },
  tipsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    opacity: 0.8,
  },
  mockNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(255, 149, 0, 0.1)",
    marginBottom: 24,
  },
  mockText: {
    flex: 1,
    fontSize: 13,
    opacity: 0.8,
  },
  captureButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    height: 56,
    borderRadius: 12,
  },
  captureButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  successCard: {
    alignItems: "center",
    padding: 32,
    borderRadius: 20,
    backgroundColor: "rgba(52, 199, 89, 0.1)",
    marginBottom: 24,
    gap: 16,
  },
  successIcon: {
    marginBottom: 8,
  },
  successTitle: {
    color: "#34c759",
    textAlign: "center",
  },
  successText: {
    textAlign: "center",
    opacity: 0.7,
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    gap: 8,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#34c759",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  retakeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
  },
  retakeButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  continueButton: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 56,
    borderRadius: 12,
  },
  continueButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    margin: 20,
    borderRadius: 12,
    backgroundColor: "rgba(10, 126, 164, 0.1)",
  },
  securityText: {
    flex: 1,
    fontSize: 12,
    opacity: 0.8,
  },
});
