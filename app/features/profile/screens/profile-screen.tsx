// import { ThemedText } from '@/components/themed-text';
// import { ThemedView } from '@/components/themed-view';
// import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
// import { Colors } from '@/constants/theme';
// import { useColorScheme } from '@/hooks/use-color-scheme';
// import { Pressable, ScrollView, StyleSheet } from 'react-native';

// export default function ProfileScreen() {
//     const colorScheme = useColorScheme();

//     const menuItems: Array<{ icon: IconSymbolName; label: string; onPress: () => void }> = [
//         { icon: 'person.fill', label: 'Account Settings', onPress: () => { } },
//         { icon: 'bell.fill', label: 'Notifications', onPress: () => { } },
//         { icon: 'info.circle.fill', label: 'About', onPress: () => { } },
//         { icon: 'questionmark.circle.fill', label: 'Help & Support', onPress: () => { } },
//     ];

//     return (
//         <ScrollView style={styles.container}>
//             <ThemedView style={styles.content}>
//                 <ThemedView style={styles.profileSection}>
//                     <ThemedView style={styles.avatar}>
//                         <IconSymbol name="person.fill" size={48} color="#fff" />
//                     </ThemedView>
//                     <ThemedText type="title" style={styles.name}>
//                         User Name
//                     </ThemedText>
//                     <ThemedText style={styles.email}>user@example.com</ThemedText>
//                 </ThemedView>

//                 <ThemedView style={styles.menuSection}>
//                     {menuItems.map((item, index) => (
//                         <Pressable key={index} onPress={item.onPress}>
//                             <ThemedView style={styles.menuItem}>
//                                 <IconSymbol
//                                     name={item.icon}
//                                     size={24}
//                                     color={Colors[colorScheme ?? 'light'].tint}
//                                 />
//                                 <ThemedText style={styles.menuLabel}>{item.label}</ThemedText>
//                                 <IconSymbol name="chevron.right" size={20} color="#888" />
//                             </ThemedView>
//                         </Pressable>
//                     ))}
//                 </ThemedView>
//             </ThemedView>
//         </ScrollView>
//     );
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//     },
//     content: {
//         padding: 20,
//     },
//     profileSection: {
//         alignItems: 'center',
//         paddingVertical: 32,
//         gap: 8,
//     },
//     avatar: {
//         width: 100,
//         height: 100,
//         borderRadius: 50,
//         backgroundColor: '#0a7ea4',
//         alignItems: 'center',
//         justifyContent: 'center',
//         marginBottom: 16,
//     },
//     name: {
//         marginBottom: 4,
//     },
//     email: {
//         opacity: 0.6,
//     },
//     menuSection: {
//         gap: 12,
//     },
//     menuItem: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         padding: 16,
//         borderRadius: 12,
//         gap: 12,
//         borderWidth: 1,
//         borderColor: 'rgba(128, 128, 128, 0.2)',
//     },
//     menuLabel: {
//         flex: 1,
//         fontSize: 16,
//     },
// });

import { Alert, Pressable, ScrollView, StyleSheet } from "react-native";
import { router } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol, type IconSymbolName } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuth } from "@/app/contexts/auth-context";

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const { user, account, isAuthenticated, logout } = useAuth();
  const tintColor = Colors[colorScheme ?? "light"].tint;

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          await logout();
          Alert.alert("Thành công", "Đã đăng xuất");
          router.replace("/(tabs)");
        },
      },
    ]);
  };

  const handleComingSoon = (feature: string) => {
    Alert.alert("Coming Soon", `Tính năng "${feature}" đang phát triển`);
  };

  const menuItems: {
    icon: IconSymbolName;
    label: string;
    value?: string;
    onPress: () => void;
  }[] = [
    {
      icon: "person.fill",
      label: "Tên đăng nhập",
      value: user?.username,
      onPress: () => handleComingSoon("Đổi tên đăng nhập"),
    },
    {
      icon: "envelope.fill",
      label: "Email",
      value: user?.email,
      onPress: () => handleComingSoon("Đổi email"),
    },
    {
      icon: "phone.fill",
      label: "Số điện thoại",
      value: user?.phone || "Chưa cập nhật",
      onPress: () => handleComingSoon("Cập nhật SĐT"),
    },
    {
      icon: "creditcard.fill",
      label: "Số tài khoản",
      value: account?.accountNumber,
      onPress: () => {},
    },
  ];

  const securityItems: {
    icon: IconSymbolName;
    label: string;
    description?: string;
    onPress: () => void;
  }[] = [
    {
      icon: "lock.fill",
      label: "Đổi mật khẩu",
      description: "Cập nhật mật khẩu đăng nhập",
      onPress: () => handleComingSoon("Đổi mật khẩu"),
    },
    {
      icon: "faceid",
      label: "Xác thực khuôn mặt",
      description: user?.faceVerificationEnabled ? "Đang bật" : "Đang tắt",
      onPress: () => handleComingSoon("Cài đặt Face Verification"),
    },
    {
      icon: "shield.fill",
      label: "Ngưỡng Deepfake",
      description: `${user?.deepfakeThreshold}%`,
      onPress: () => handleComingSoon("Điều chỉnh ngưỡng"),
    },
  ];

  const otherItems: {
    icon: IconSymbolName;
    label: string;
    onPress: () => void;
  }[] = [
    {
      icon: "bell.fill",
      label: "Cảnh báo",
      onPress: () => router.push("/features/alerts/list" as any),
    },
    {
      icon: "clock.fill",
      label: "Lịch sử giao dịch",
      onPress: () => router.push("/features/history/list" as any),
    },
    {
      icon: "info.circle.fill",
      label: "Về ứng dụng",
      onPress: () =>
        Alert.alert(
          "Banking App v1.0",
          "Ứng dụng ngân hàng với công nghệ phát hiện deepfake\n\n© 2024 All rights reserved",
          [{ text: "OK" }]
        ),
    },
    {
      icon: "questionmark.circle.fill",
      label: "Trợ giúp & Hỗ trợ",
      onPress: () => handleComingSoon("Trợ giúp"),
    },
  ];

  if (!isAuthenticated || !user) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.emptyContainer}>
          <IconSymbol
            name="person.crop.circle.badge.xmark"
            size={64}
            color="#888"
          />
          <ThemedText type="subtitle" style={styles.emptyTitle}>
            Chưa đăng nhập
          </ThemedText>
          <ThemedText style={styles.emptyText}>
            Vui lòng đăng nhập để xem thông tin tài khoản
          </ThemedText>
          <Pressable
            style={[styles.loginButton, { backgroundColor: tintColor }]}
            onPress={() => router.push("/features/auth/login" as any)}
          >
            <ThemedText style={styles.loginButtonText}>Đăng nhập</ThemedText>
          </Pressable>
        </ThemedView>
      </ThemedView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        {/* Profile Header */}
        <ThemedView style={styles.profileHeader}>
          <ThemedView style={styles.avatarContainer}>
            <IconSymbol
              name="person.crop.circle.fill"
              size={80}
              color={tintColor}
            />
          </ThemedView>
          <ThemedText type="title" style={styles.name}>
            {user.fullName}
          </ThemedText>
          <ThemedText style={styles.email}>{user.email}</ThemedText>

          {/* Balance Badge */}
          {account && (
            <ThemedView
              style={[
                styles.balanceBadge,
                { backgroundColor: `${tintColor}20` },
              ]}
            >
              <IconSymbol name="creditcard.fill" size={20} color={tintColor} />
              <ThemedText style={[styles.balanceText, { color: tintColor }]}>
                {account.balance.toLocaleString("vi-VN")} VND
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>

        {/* Account Info Section */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            Thông tin tài khoản
          </ThemedText>
          <ThemedView style={styles.menuList}>
            {menuItems.map((item, index) => (
              <Pressable key={index} onPress={item.onPress}>
                <ThemedView style={styles.menuItem}>
                  <ThemedView
                    style={[
                      styles.menuIconContainer,
                      { backgroundColor: `${tintColor}15` },
                    ]}
                  >
                    <IconSymbol name={item.icon} size={20} color={tintColor} />
                  </ThemedView>
                  <ThemedView style={styles.menuContent}>
                    <ThemedText style={styles.menuLabel}>
                      {item.label}
                    </ThemedText>
                    {item.value && (
                      <ThemedText style={styles.menuValue}>
                        {item.value}
                      </ThemedText>
                    )}
                  </ThemedView>
                  <IconSymbol name="chevron.right" size={18} color="#888" />
                </ThemedView>
              </Pressable>
            ))}
          </ThemedView>
        </ThemedView>

        {/* Security Section */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Bảo mật</ThemedText>
          <ThemedView style={styles.menuList}>
            {securityItems.map((item, index) => (
              <Pressable key={index} onPress={item.onPress}>
                <ThemedView style={styles.menuItem}>
                  <ThemedView
                    style={[
                      styles.menuIconContainer,
                      { backgroundColor: "rgba(52, 199, 89, 0.15)" },
                    ]}
                  >
                    <IconSymbol name={item.icon} size={20} color="#34c759" />
                  </ThemedView>
                  <ThemedView style={styles.menuContent}>
                    <ThemedText style={styles.menuLabel}>
                      {item.label}
                    </ThemedText>
                    {item.description && (
                      <ThemedText style={styles.menuDescription}>
                        {item.description}
                      </ThemedText>
                    )}
                  </ThemedView>
                  <IconSymbol name="chevron.right" size={18} color="#888" />
                </ThemedView>
              </Pressable>
            ))}
          </ThemedView>
        </ThemedView>

        {/* Other Section */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Khác</ThemedText>
          <ThemedView style={styles.menuList}>
            {otherItems.map((item, index) => (
              <Pressable key={index} onPress={item.onPress}>
                <ThemedView style={styles.menuItem}>
                  <ThemedView
                    style={[
                      styles.menuIconContainer,
                      { backgroundColor: "rgba(10, 126, 164, 0.15)" },
                    ]}
                  >
                    <IconSymbol name={item.icon} size={20} color="#0a7ea4" />
                  </ThemedView>
                  <ThemedText style={styles.menuLabel}>{item.label}</ThemedText>
                  <IconSymbol name="chevron.right" size={18} color="#888" />
                </ThemedView>
              </Pressable>
            ))}
          </ThemedView>
        </ThemedView>

        {/* Logout Button */}
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <IconSymbol
            name="rectangle.portrait.and.arrow.right"
            size={20}
            color="#ff3b30"
          />
          <ThemedText style={styles.logoutText}>Đăng xuất</ThemedText>
        </Pressable>

        {/* App Version */}
        <ThemedText style={styles.version}>Version 1.0.0</ThemedText>
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
    paddingBottom: 40,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 16,
  },
  emptyTitle: {
    textAlign: "center",
  },
  emptyText: {
    textAlign: "center",
    opacity: 0.6,
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
  profileHeader: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 12,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  name: {
    fontSize: 24,
  },
  email: {
    opacity: 0.6,
    fontSize: 14,
  },
  balanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 8,
  },
  balanceText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  menuList: {
    gap: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: 12,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  menuContent: {
    flex: 1,
    gap: 2,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  menuValue: {
    fontSize: 13,
    opacity: 0.6,
  },
  menuDescription: {
    fontSize: 12,
    opacity: 0.6,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    marginTop: 8,
  },
  logoutText: {
    color: "#ff3b30",
    fontSize: 16,
    fontWeight: "600",
  },
  version: {
    textAlign: "center",
    fontSize: 12,
    opacity: 0.4,
    marginTop: 24,
  },
});
