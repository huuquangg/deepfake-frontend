import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuth } from "@/app/contexts/auth-context";
import { apiService } from "@/app/services/api.service";

export default function TransferFormScreen() {
  const colorScheme = useColorScheme();
  const { account, tokens } = useAuth(); // ← Thêm tokens
  const tintColor = Colors[colorScheme ?? "light"].tint;

  const [toAccountNumber, setToAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [realBalance, setRealBalance] = useState<number | null>(null);

  // Fetch real balance from backend
  useEffect(() => {
    if (account?.userId && tokens?.accessToken) {
      fetchBalance();
    }
  }, [account, tokens]);

  const fetchBalance = async () => {
    try {
      if (!tokens?.accessToken) return;
      const balance = await apiService.getBalance(tokens.accessToken);
      setRealBalance(balance);
    } catch (error) {
      console.error("Failed to fetch balance:", error);
    }
  };

  const formatCurrency = (value: string) => {
    // Remove non-digits
    const numbers = value.replace(/[^\d]/g, "");
    // Format with thousands separator
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleAmountChange = (text: string) => {
    const formatted = formatCurrency(text);
    setAmount(formatted);
  };

  const handleContinue = () => {
    // Validation
    if (!toAccountNumber.trim()) {
      Alert.alert("Error", "Please enter the recipient's account number");
      return;
    }

    if (toAccountNumber.length < 10) {
      Alert.alert("Error", "The account number must be at least 10 digits");
      return;
    }

    if (!amount) {
      Alert.alert("Error", "Please enter an amount");
      return;
    }

    const amountNumber = parseInt(amount.replace(/\./g, ""));

    if (amountNumber < 10000) {
      Alert.alert("Error", "The minimum amount is 10,000 VND");
      return;
    }

    //  Check real balance
    const currentBalance =
      realBalance !== null ? realBalance : account?.balance || 0;
    if (amountNumber > currentBalance) {
      Alert.alert("Error", "Insufficient balance");
      return;
    }

    if (!description.trim()) {
      Alert.alert("Error", "Please enter a transfer description");
      return;
    }

    // Navigate to face verification with transfer data
    router.push({
      pathname: "/features/transfer/face-verify" as any,
      params: {
        toAccountNumber,
        amount: amountNumber.toString(),
        description,
      },
    });
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
            Transfer
          </ThemedText>
          <ThemedView style={{ width: 24 }} />
        </ThemedView>

        {/* Balance Card */}
        {account && (
          <ThemedView style={styles.balanceCard}>
            <ThemedText style={styles.balanceLabel}>
              Available balance
            </ThemedText>
            <ThemedText type="subtitle" style={styles.balanceAmount}>
              {(realBalance !== null
                ? realBalance
                : account?.balance || 0
              ).toLocaleString("vi-VN")}{" "}
              VND
            </ThemedText>
            {/* Decorative circles */}
            <View style={styles.decorativeCircle1} />
            <View style={styles.decorativeCircle2} />
          </ThemedView>
        )}

        {/* Form */}
        <ThemedView style={styles.form}>
          {/* Account Number */}
          <ThemedView style={styles.inputGroup}>
            <ThemedText style={styles.label}>
              Recipient account number
            </ThemedText>
            <ThemedView
              style={[styles.inputContainer, { borderColor: tintColor }]}
            >
              <IconSymbol name="person.fill" size={20} color="#888" />
              <TextInput
                style={styles.input}
                placeholder="Nhập số tài khoản"
                placeholderTextColor="#888"
                value={toAccountNumber}
                onChangeText={setToAccountNumber}
                keyboardType="number-pad"
                maxLength={20}
              />
            </ThemedView>
          </ThemedView>

          {/* Amount */}
          <ThemedView style={styles.inputGroup}>
            <ThemedText style={styles.label}>Amount</ThemedText>
            <ThemedView
              style={[styles.inputContainer, { borderColor: tintColor }]}
            >
              <IconSymbol name="creditcard.fill" size={20} color="#888" />
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor="#888"
                value={amount}
                onChangeText={handleAmountChange}
                keyboardType="number-pad"
              />
              <ThemedText style={styles.currency}>VND</ThemedText>
            </ThemedView>
            {amount && (
              <ThemedText style={styles.hint}>
                ≈ {parseInt(amount.replace(/\./g, "")).toLocaleString("vi-VN")}{" "}
                đồng
              </ThemedText>
            )}
          </ThemedView>

          {/* Quick Amount Buttons */}
          <ThemedView style={styles.quickAmounts}>
            {["100.000", "200.000", "500.000", "1.000.000"].map((value) => (
              <Pressable
                key={value}
                style={[styles.quickAmountButton, { borderColor: tintColor }]}
                onPress={() => setAmount(value)}
              >
                <ThemedText style={styles.quickAmountText}>{value}</ThemedText>
              </Pressable>
            ))}
          </ThemedView>

          {/* Description */}
          <ThemedView style={styles.inputGroup}>
            <ThemedText style={styles.label}>Transfer description</ThemedText>
            <ThemedView
              style={[
                styles.inputContainer,
                styles.textAreaContainer,
                { borderColor: tintColor },
              ]}
            >
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Nhập nội dung"
                placeholderTextColor="#888"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                maxLength={200}
              />
            </ThemedView>
            <ThemedText style={styles.charCount}>
              {description.length}/200
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Continue Button */}
        <Pressable
          style={[styles.continueButton, { backgroundColor: tintColor }]}
          onPress={handleContinue}
        >
          <ThemedText style={styles.continueButtonText}>Tiếp tục</ThemedText>
          <IconSymbol name="arrow.right" size={20} color="#fff" />
        </Pressable>

        {/* Info Note */}
        <ThemedView style={styles.infoNote}>
          <IconSymbol name="info.circle.fill" size={20} color={tintColor} />
          <ThemedText style={styles.infoText}>
            Next step: Face authentication to secure the transaction
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
  balanceCard: {
    padding: 24,
    borderRadius: 20,
    backgroundColor: "#0a7ea4",
    marginBottom: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  balanceLabel: {
    fontSize: 13,
    color: "#ffffff80",
    fontWeight: "500",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -1,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 12,
    minHeight: 56,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#000",
    paddingVertical: 12,
  },
  currency: {
    fontSize: 14,
    fontWeight: "600",
    color: "#888",
  },
  hint: {
    fontSize: 12,
    opacity: 0.6,
    marginLeft: 8,
  },
  quickAmounts: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickAmountButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: "600",
  },
  textAreaContainer: {
    alignItems: "flex-start",
    minHeight: 100,
  },
  textArea: {
    paddingTop: 12,
    textAlignVertical: "top",
  },
  charCount: {
    fontSize: 12,
    opacity: 0.5,
    textAlign: "right",
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 56,
    borderRadius: 12,
    marginTop: 24,
  },
  continueButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  infoNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    paddingVertical: 20,
    borderRadius: 12,
    backgroundColor: "rgba(10, 126, 164, 0.1)",
    marginTop: 16,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    opacity: 0.8,
    lineHeight: 20,
    paddingTop: 2,
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
});
