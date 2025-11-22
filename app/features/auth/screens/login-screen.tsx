import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuth } from "@/app/contexts/auth-context";

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const tintColor = Colors[colorScheme ?? "light"].tint;

  const handleLogin = async () => {
    // Validation
    if (!username.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên đăng nhập");
      return;
    }
    if (!password.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập mật khẩu");
      return;
    }

    setIsLoading(true);

    try {
      await login({ username: username.trim(), password });

      // Login thành công - AuthContext sẽ tự động redirect
      Alert.alert("Thành công", "Đăng nhập thành công!");
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("Lỗi đăng nhập", error.message || "Có lỗi xảy ra");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        {/* Logo/Icon */}
        <ThemedView style={styles.logoContainer}>
          <IconSymbol
            name="building.columns.fill"
            size={64}
            color={tintColor}
          />
          <ThemedText type="title" style={styles.title}>
            Banking App
          </ThemedText>
          <ThemedText style={styles.subtitle}>Đăng nhập để tiếp tục</ThemedText>
        </ThemedView>

        {/* Form */}
        <ThemedView style={styles.form}>
          {/* Username */}
          <ThemedView style={styles.inputGroup}>
            <ThemedText style={styles.label}>Tên đăng nhập</ThemedText>
            <ThemedView
              style={[styles.inputContainer, { borderColor: tintColor }]}
            >
              <IconSymbol name="person.fill" size={20} color="#888" />
              <TextInput
                style={styles.input}
                placeholder="Nhập tên đăng nhập"
                placeholderTextColor="#888"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </ThemedView>
          </ThemedView>

          {/* Password */}
          <ThemedView style={styles.inputGroup}>
            <ThemedText style={styles.label}>Mật khẩu</ThemedText>
            <ThemedView
              style={[styles.inputContainer, { borderColor: tintColor }]}
            >
              <IconSymbol name="lock.fill" size={20} color="#888" />
              <TextInput
                style={styles.input}
                placeholder="Nhập mật khẩu"
                placeholderTextColor="#888"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)}>
                <IconSymbol
                  name={showPassword ? "eye.slash.fill" : "eye.fill"}
                  size={20}
                  color="#888"
                />
              </Pressable>
            </ThemedView>
          </ThemedView>

          {/* Login Button */}
          <Pressable
            style={[
              styles.loginButton,
              { backgroundColor: tintColor },
              isLoading && styles.buttonDisabled,
            ]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.loginButtonText}>Đăng nhập</ThemedText>
            )}
          </Pressable>

          {/* Test Account Info */}
          <ThemedView style={styles.testInfo}>
            <ThemedText style={styles.testInfoText}>
              💡 Tài khoản test: nguyenvana / password123
            </ThemedText>
          </ThemedView>

          {/* Register Link */}
          {/* Register Link */}
          <ThemedView style={styles.registerContainer}>
            <ThemedText style={styles.registerText}>
              Chưa có tài khoản?{" "}
            </ThemedText>
            <Pressable
              onPress={() => router.push("/features/auth/register" as any)}
            >
              <ThemedText style={[styles.registerLink, { color: tintColor }]}>
                Đăng ký ngay
              </ThemedText>
            </Pressable>
          </ThemedView>
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
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 48,
    gap: 12,
  },
  title: {
    fontSize: 32,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
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
    height: 56,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  loginButton: {
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  testInfo: {
    padding: 12,
    backgroundColor: "rgba(52, 199, 89, 0.1)",
    borderRadius: 8,
    marginTop: 8,
  },
  testInfoText: {
    fontSize: 12,
    textAlign: "center",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  registerText: {
    fontSize: 14,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: "600",
  },
});
