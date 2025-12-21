import { Image } from "expo-image";
import { router } from "expo-router";
import { Alert, StyleSheet, Pressable, View } from "react-native";
import QuickActionCard from "@/app/features/home/_components/quick-action-card";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/app/contexts/auth-context";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useEffect, useState } from "react";
import { apiService } from "@/app/services/api.service";

export default function HomeScreen() {
  const { user, account, tokens, isAuthenticated, logout } = useAuth();
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme ?? "light"].tint;
  const [realBalance, setRealBalance] = useState<number | null>(null);
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Fetch real account data from backend
  useEffect(() => {
    if (isAuthenticated && tokens?.accessToken) {
      fetchAccountData();
    }
  }, [isAuthenticated, tokens]);

  const fetchAccountData = async () => {
    try {
      setLoading(true);
      if (!tokens?.accessToken) return;

      const token = tokens.accessToken;

      // Get account info (account number)
      const accountInfo = await apiService.getAccountInfo(token);
      setAccountNumber(accountInfo.accountNumber);

      // Get real balance
      const balance = await apiService.getBalance(token);
      setRealBalance(balance);
    } catch (error) {
      console.error("Failed to fetch account data:", error);
      // Keep using mock data if API fails
    } finally {
      setLoading(false);
    }
  };

  const handleCameraPress = () => {
    router.push("/features/detection/camera" as any);
  };

  const handleTransferPress = () => {
    if (!isAuthenticated) {
      Alert.alert("Not logged in", "Please log in to use this feature");
      return;
    }
    router.push("/features/transfer/form" as any);
  };

  const handleHistoryPress = () => {
    if (!isAuthenticated) {
      Alert.alert("Not logged in", "Please sign in to view your history");
      return;
    }
    router.push("/features/history/list" as any);
  };

  const handleLoginPress = () => {
    router.push("/features/auth/login" as any);
  };

  const handleLogoutPress = () => {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          await logout();
          Alert.alert("Success", "You have signed out.");
        },
      },
    ]);
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/UITBanking.png")}
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">UIT Banking</ThemedText>
      </ThemedView>

      {/* User Info - Hiển thị khi đã login */}
      {isAuthenticated && user && account ? (
        <View style={styles.accountCard}>
          {/* Header với avatar và logout */}
          <View style={styles.accountHeaderRow}>
            <View style={styles.avatarContainer}>
              <IconSymbol name="person.circle.fill" size={50} color="#fff" />
            </View>
            <View style={styles.userInfo}>
              <ThemedText style={styles.greeting}>Hello !</ThemedText>
              <ThemedText style={styles.userName}>{user.fullName}</ThemedText>
            </View>
            <Pressable onPress={handleLogoutPress} style={styles.logoutButton}>
              <IconSymbol
                name="rectangle.portrait.and.arrow.right"
                size={24}
                color="#fff"
              />
            </Pressable>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Balance */}

          <View style={styles.balanceContainer}>
            <ThemedText style={styles.balanceLabel}>
              Available Balance
            </ThemedText>
            <View style={styles.balanceRow}>
              <ThemedText style={styles.balanceAmount}>
                {realBalance !== null
                  ? realBalance.toLocaleString("vi-VN")
                  : account.balance.toLocaleString("vi-VN")}
              </ThemedText>
              <ThemedText style={styles.currency}> VND</ThemedText>
            </View>
          </View>

          {/* Account Number */}
          <View style={styles.accountNumberRow}>
            <ThemedText style={styles.accountNumberLabel}>
              Account Number
            </ThemedText>
            <ThemedText style={styles.accountNumber}>
              {accountNumber || account.accountNumber}
            </ThemedText>
          </View>

          {/* Decorative circles */}
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />
        </View>
      ) : (
        // Hiển thị khi chưa login
        <ThemedView style={styles.loginPrompt}>
          <ThemedText type="subtitle" style={styles.loginPromptTitle}>
            Not signed in
          </ThemedText>
          <ThemedText style={styles.loginPromptText}>
            Sign in to access all banking features
          </ThemedText>
          <Pressable
            style={[styles.loginButton, { backgroundColor: tintColor }]}
            onPress={handleLoginPress}
          >
            <ThemedText style={styles.loginButtonText}>Sign in now</ThemedText>
          </Pressable>
        </ThemedView>
      )}

      <ThemedView style={styles.actionsContainer}>
        <QuickActionCard
          title="Transfer"
          description="Secure money transfer with face authentication"
          icon="arrow.up.arrow.down"
          onPress={handleTransferPress}
        />
        <QuickActionCard
          title="Transaction History"
          description="View your transfer history"
          icon="clock.fill"
          onPress={handleHistoryPress}
        />
        <QuickActionCard
          title="Deepfake Scan"
          description="Detect fake or manipulated faces"
          icon="camera.fill"
          onPress={handleCameraPress}
        />
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },

  accountCard: {
    marginHorizontal: 0,
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
  accountHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 12,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  userInfo: {
    flex: 1,
    gap: 4,
  },
  greeting: {
    fontSize: 13,
    color: "#ffffff80",
    fontWeight: "500",
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.5,
  },
  logoutButton: {
    padding: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginVertical: 16,
  },
  balanceContainer: {
    alignItems: "center",

    marginBottom: 20,
    gap: 4,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  balanceLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#ffffff80",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -1,
  },
  currency: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    opacity: 0.9,
  },
  accountNumberRow: {
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
  },
  accountNumberLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#ffffff80",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  accountNumber: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "700",
    letterSpacing: 1,
    textAlign: "center",
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

  actionsContainer: {
    gap: 16,
  },
});
