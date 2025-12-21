import { Image } from "expo-image";
import { useAuth } from "@/app/contexts/auth-context";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
      Alert.alert("Error", "Please enter username");
      return;
    }
    if (!password.trim()) {
      Alert.alert("Error", "Please enter password");
      return;
    }

    console.log("[Auth] Login attempt", { username: username.trim() });
    setIsLoading(true);

    try {
      await login({ username: username.trim(), password });

      // Login successful - redirect
      console.log("[Auth] Login successful for", username.trim());
      router.replace("/(tabs)");
    } catch (error: any) {
      console.error("[Auth] Login failed", {
        username: username.trim(),
        error,
      });
      Alert.alert("Login Failed", error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <ThemedView style={styles.content}>
        {/* Logo/Icon */}
        <ThemedView style={styles.logoContainer}>
          <Image
            source={require("@/assets/images/UITBanking.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <ThemedText type="title" style={styles.title}>
            UIT Banking
          </ThemedText>
          <ThemedText style={styles.subtitle}>Sign in to continue</ThemedText>
        </ThemedView>

        {/* Form */}
        <ThemedView style={styles.form}>
          {/* Username */}
          <ThemedView style={styles.inputGroup}>
            <ThemedText style={styles.label}>Username</ThemedText>
            <ThemedView
              style={[styles.inputContainer, { borderColor: tintColor }]}
            >
              <IconSymbol name="person.fill" size={20} color="#888" />
              <TextInput
                style={styles.input}
                placeholder="Enter your username"
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
            <ThemedText style={styles.label}>Password</ThemedText>
            <ThemedView
              style={[styles.inputContainer, { borderColor: tintColor }]}
            >
              <Ionicons name="lock-closed" size={20} color="#888" />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
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
              <ThemedText style={styles.loginButtonText}>Sign in</ThemedText>
            )}
          </Pressable>

          {/* Test Account Info */}

          {/* Register Link */}
          {/* Register Link */}
          <ThemedView style={styles.registerContainer}>
            <ThemedText style={styles.registerText}>
              Do not have an account?{" "}
            </ThemedText>
            <Pressable
              onPress={() => router.push("/features/auth/register" as any)}
            >
              <ThemedText style={[styles.registerLink, { color: tintColor }]}>
                Sign up now
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
  scrollContent: {
    flexGrow: 1,
    backgroundColor: "#fff",
  },

  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    paddingTop: -100,
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
  logoImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
});
