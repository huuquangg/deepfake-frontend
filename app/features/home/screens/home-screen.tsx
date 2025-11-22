import { Image } from "expo-image";
import { router } from "expo-router";
import { Alert, StyleSheet, Pressable } from "react-native";
import QuickActionCard from "@/app/features/home/_components/quick-action-card";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/app/contexts/auth-context";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function HomeScreen() {
  const { user, account, isAuthenticated, logout } = useAuth();
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme ?? "light"].tint;

  const handleCameraPress = () => {
    router.push("/features/detection/camera" as any);
  };

  const handleTransferPress = () => {
    if (!isAuthenticated) {
      Alert.alert(
        "Chưa đăng nhập",
        "Vui lòng đăng nhập để sử dụng tính năng này"
      );
      return;
    }
    // Navigate to transfer form
    router.push("/features/transfer/form" as any);
  };

  const handleHistoryPress = () => {
    if (!isAuthenticated) {
      Alert.alert("Chưa đăng nhập", "Vui lòng đăng nhập để xem lịch sử");
      return;
    }
    // Navigate to transaction history
    router.push("/features/history/list" as any);
  };

  const handleLoginPress = () => {
    router.push("/features/auth/login" as any);
  };

  const handleLogoutPress = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          await logout();
          Alert.alert("Thành công", "Đã đăng xuất");
        },
      },
    ]);
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Banking App</ThemedText>
      </ThemedView>

      {/* User Info - Hiển thị khi đã login */}
      {isAuthenticated && user && account ? (
        <ThemedView style={styles.accountCard}>
          {/* Header với avatar và logout */}
          <ThemedView style={styles.accountHeaderRow}>
            <ThemedView style={styles.avatarContainer}>
              <IconSymbol
                name="person.circle.fill"
                size={50}
                color={tintColor}
              />
            </ThemedView>
            <ThemedView style={styles.userInfo}>
              <ThemedText type="defaultSemiBold" style={styles.greeting}>
                Xin chào!
              </ThemedText>
              <ThemedText type="subtitle" style={styles.userName}>
                {user.fullName}
              </ThemedText>
            </ThemedView>
            <Pressable onPress={handleLogoutPress} style={styles.logoutButton}>
              <IconSymbol
                name="rectangle.portrait.and.arrow.right"
                size={24}
                color="#ff3b30"
              />
            </Pressable>
          </ThemedView>

          {/* Divider */}
          <ThemedView style={styles.divider} />

          {/* Balance */}
          <ThemedView style={styles.balanceContainer}>
            <ThemedText style={styles.balanceLabel}>SỐ DƯ KHẢ DỤNG</ThemedText>
            <ThemedText style={styles.balanceAmount}>
              {account.balance.toLocaleString("vi-VN")}
            </ThemedText>
            <ThemedText style={styles.currency}>VND</ThemedText>
          </ThemedView>

          {/* Account Number */}
          <ThemedView style={styles.accountNumberRow}>
            <IconSymbol name="creditcard.fill" size={16} color="#888" />
            <ThemedText style={styles.accountNumber}>
              STK: {account.accountNumber}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      ) : (
        // Login prompt - Hiển thị khi chưa login
        <ThemedView style={styles.loginPrompt}>
          <ThemedText type="subtitle" style={styles.loginPromptTitle}>
            Chưa đăng nhập
          </ThemedText>
          <ThemedText style={styles.loginPromptText}>
            Đăng nhập để sử dụng đầy đủ tính năng ngân hàng
          </ThemedText>
          <Pressable
            style={[styles.loginButton, { backgroundColor: tintColor }]}
            onPress={handleLoginPress}
          >
            <ThemedText style={styles.loginButtonText}>
              Đăng nhập ngay
            </ThemedText>
          </Pressable>
        </ThemedView>
      )}

      <ThemedView style={styles.descriptionContainer}>
        <ThemedText>
          Ứng dụng ngân hàng với công nghệ phát hiện deepfake, bảo vệ giao dịch
          của bạn.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.actionsContainer}>
        <QuickActionCard
          title="Chuyển tiền"
          description="Chuyển tiền an toàn với xác thực khuôn mặt"
          icon="arrow.up.arrow.down"
          onPress={handleTransferPress}
        />
        <QuickActionCard
          title="Lịch sử giao dịch"
          description="Xem lịch sử chuyển tiền"
          icon="clock.fill"
          onPress={handleHistoryPress}
        />
        <QuickActionCard
          title="Quét Deepfake"
          description="Phát hiện khuôn mặt giả mạo"
          icon="camera.fill"
          onPress={handleCameraPress}
        />
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center", // Bỏ hoặc comment dòng này
    gap: 8,
    marginBottom: 16,
  },

  accountCard: {
    padding: 24,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  accountHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(10, 126, 164, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  greeting: {
    fontSize: 14,
    color: "#888",
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  logoutButton: {
    padding: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E5E5",
    marginVertical: 16,
  },
  balanceContainer: {
    alignItems: "center",
    paddingVertical: 12,
  },
  balanceLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#888",
    letterSpacing: 1,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#0a7ea4",
  },
  currency: {
    fontSize: 16,
    fontWeight: "600",
    color: "#888",
    marginTop: 4,
  },
  accountNumberRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  accountNumber: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  loginPrompt: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: "rgba(255, 149, 0, 0.1)",
    marginBottom: 24,
    gap: 12,
    alignItems: "center",
  },
  loginPromptTitle: {
    textAlign: "center",
  },
  loginPromptText: {
    textAlign: "center",
    opacity: 0.7,
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
  descriptionContainer: {
    marginBottom: 24,
  },
  actionsContainer: {
    gap: 16,
  },
});
