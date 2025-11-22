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

export default function RegisterScreen() {
  const colorScheme = useColorScheme();
  const { register } = useAuth();
  const tintColor = Colors[colorScheme ?? "light"].tint;

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
  };

  const handleRegister = async () => {
    // Validation
    if (!username.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên đăng nhập");
      return;
    }

    if (username.length < 6) {
      Alert.alert("Lỗi", "Tên đăng nhập phải có ít nhất 6 ký tự");
      return;
    }

    if (!email.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập email");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("Lỗi", "Email không hợp lệ");
      return;
    }

    if (!fullName.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập họ tên");
      return;
    }

    if (phone && !validatePhone(phone)) {
      Alert.alert("Lỗi", "Số điện thoại phải có 10 chữ số");
      return;
    }

    if (!password) {
      Alert.alert("Lỗi", "Vui lòng nhập mật khẩu");
      return;
    }

    if (password.length < 8) {
      Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 8 ký tự");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp");
      return;
    }

    setIsLoading(true);

    try {
      await register({
        username: username.trim(),
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
      });

      Alert.alert(
        "Thành công",
        "Đăng ký thành công! Bạn đã nhận được 10,000,000 VND khuyến mãi! 🎉",
        [
          {
            text: "OK",
            onPress: () => router.replace("/(tabs)"),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert("Lỗi đăng ký", error.message || "Có lỗi xảy ra");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color={tintColor} />
          </Pressable>
        </ThemedView>

        {/* Logo/Icon */}
        <ThemedView style={styles.logoContainer}>
          <IconSymbol
            name="person.crop.circle.fill.badge.plus"
            size={64}
            color={tintColor}
          />
          <ThemedText type="title" style={styles.title}>
            Đăng ký tài khoản
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Tạo tài khoản mới để bắt đầu
          </ThemedText>
        </ThemedView>

        {/* Form */}
        <ThemedView style={styles.form}>
          {/* Username */}
          <ThemedView style={styles.inputGroup}>
            <ThemedText style={styles.label}>Tên đăng nhập *</ThemedText>
            <ThemedView
              style={[styles.inputContainer, { borderColor: tintColor }]}
            >
              <IconSymbol name="at" size={20} color="#888" />
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

          {/* Email */}
          <ThemedView style={styles.inputGroup}>
            <ThemedText style={styles.label}>Email *</ThemedText>
            <ThemedView
              style={[styles.inputContainer, { borderColor: tintColor }]}
            >
              <IconSymbol name="envelope.fill" size={20} color="#888" />
              <TextInput
                style={styles.input}
                placeholder="example@email.com"
                placeholderTextColor="#888"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </ThemedView>
          </ThemedView>

          {/* Full Name */}
          <ThemedView style={styles.inputGroup}>
            <ThemedText style={styles.label}>Họ và tên *</ThemedText>
            <ThemedView
              style={[styles.inputContainer, { borderColor: tintColor }]}
            >
              <IconSymbol name="person.fill" size={20} color="#888" />
              <TextInput
                style={styles.input}
                placeholder="Nguyễn Văn A"
                placeholderTextColor="#888"
                value={fullName}
                onChangeText={setFullName}
                editable={!isLoading}
              />
            </ThemedView>
          </ThemedView>

          {/* Phone */}
          <ThemedView style={styles.inputGroup}>
            <ThemedText style={styles.label}>
              Số điện thoại (tùy chọn)
            </ThemedText>
            <ThemedView
              style={[styles.inputContainer, { borderColor: tintColor }]}
            >
              <IconSymbol name="phone.fill" size={20} color="#888" />
              <TextInput
                style={styles.input}
                placeholder="0901234567"
                placeholderTextColor="#888"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                maxLength={10}
                editable={!isLoading}
              />
            </ThemedView>
          </ThemedView>

          {/* Password */}
          <ThemedView style={styles.inputGroup}>
            <ThemedText style={styles.label}>Mật khẩu *</ThemedText>
            <ThemedView
              style={[styles.inputContainer, { borderColor: tintColor }]}
            >
              <IconSymbol name="lock.fill" size={20} color="#888" />
              <TextInput
                style={styles.input}
                placeholder="Ít nhất 8 ký tự"
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

          {/* Confirm Password */}
          <ThemedView style={styles.inputGroup}>
            <ThemedText style={styles.label}>Xác nhận mật khẩu *</ThemedText>
            <ThemedView
              style={[styles.inputContainer, { borderColor: tintColor }]}
            >
              <IconSymbol name="lock.fill" size={20} color="#888" />
              <TextInput
                style={styles.input}
                placeholder="Nhập lại mật khẩu"
                placeholderTextColor="#888"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
              <Pressable
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <IconSymbol
                  name={showConfirmPassword ? "eye.slash.fill" : "eye.fill"}
                  size={20}
                  color="#888"
                />
              </Pressable>
            </ThemedView>
          </ThemedView>

          {/* Register Button */}
          <Pressable
            style={[
              styles.registerButton,
              { backgroundColor: tintColor },
              isLoading && styles.buttonDisabled,
            ]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.registerButtonText}>Đăng ký</ThemedText>
            )}
          </Pressable>

          {/* Bonus Info */}
          <ThemedView style={styles.bonusInfo}>
            <IconSymbol name="gift.fill" size={20} color="#34c759" />
            <ThemedText style={styles.bonusText}>
              🎉 Tặng 10,000,000 VND khi đăng ký!
            </ThemedText>
          </ThemedView>

          {/* Login Link */}
          <ThemedView style={styles.loginContainer}>
            <ThemedText style={styles.loginText}>Đã có tài khoản? </ThemedText>
            <Pressable onPress={() => router.back()}>
              <ThemedText style={[styles.loginLink, { color: tintColor }]}>
                Đăng nhập ngay
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
    padding: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
    gap: 12,
  },
  title: {
    fontSize: 28,
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
    minHeight: 56,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#000",
    paddingVertical: 12,
  },
  registerButton: {
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  bonusInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 12,
    backgroundColor: "rgba(52, 199, 89, 0.1)",
    borderRadius: 8,
  },
  bonusText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#34c759",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  loginText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: "600",
  },
});
