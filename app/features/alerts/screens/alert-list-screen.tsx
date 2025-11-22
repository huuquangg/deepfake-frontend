import { useState, useEffect } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuth } from "@/app/contexts/auth-context";
import { mockApiService } from "@/app/services/mock-api.service";
import { Alert as AlertType } from "@/app/types/alert.types";

export default function AlertListScreen() {
  const colorScheme = useColorScheme();
  const { isAuthenticated } = useAuth();
  const tintColor = Colors[colorScheme ?? "light"].tint;

  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadAlerts();
    }
  }, [isAuthenticated]);

  const loadAlerts = async () => {
    try {
      setIsLoading(true);
      const data = await mockApiService.getAlerts();
      setAlerts(data);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải danh sách cảnh báo");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadAlerts();
    setIsRefreshing(false);
  };

  const handleAlertPress = async (alert: AlertType) => {
    // Mark as read
    if (!alert.isRead) {
      await mockApiService.markAlertAsRead(alert.id);
      setAlerts(
        alerts.map((a) => (a.id === alert.id ? { ...a, isRead: true } : a))
      );
    }

    // Show detail
    Alert.alert(
      alert.title,
      `${alert.message}\n\n📍 Vị trí: ${
        alert.locationAddress || "Không xác định"
      }\n⏰ ${formatDate(alert.createdAt)}`,
      [{ text: "Đóng" }]
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "#ff3b30";
      case "HIGH":
        return "#ff9500";
      case "MEDIUM":
        return "#ffcc00";
      case "LOW":
        return "#34c759";
      default:
        return "#888";
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "Cực kỳ nghiêm trọng";
      case "HIGH":
        return "Nghiêm trọng";
      case "MEDIUM":
        return "Trung bình";
      case "LOW":
        return "Thấp";
      default:
        return severity;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;

    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const unreadCount = alerts.filter((a) => !a.isRead).length;

  if (!isAuthenticated) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.emptyContainer}>
          <IconSymbol name="lock.fill" size={64} color="#888" />
          <ThemedText type="subtitle" style={styles.emptyTitle}>
            Chưa đăng nhập
          </ThemedText>
          <ThemedText style={styles.emptyText}>
            Vui lòng đăng nhập để xem cảnh báo
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

  if (isLoading && !isRefreshing) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.loadingContainer}>
          <IconSymbol name="arrow.clockwise" size={48} color={tintColor} />
          <ThemedText style={styles.loadingText}>Đang tải...</ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      <ThemedView style={styles.content}>
        {/* Header */}
        <ThemedView style={styles.headerSection}>
          <ThemedView style={styles.headerTop}>
            <ThemedText type="title">Cảnh báo</ThemedText>
            {unreadCount > 0 && (
              <ThemedView style={styles.unreadBadge}>
                <ThemedText style={styles.unreadText}>{unreadCount}</ThemedText>
              </ThemedView>
            )}
          </ThemedView>
          <ThemedText style={styles.headerSubtext}>
            Thông báo bảo mật & deepfake detection
          </ThemedText>
        </ThemedView>

        {/* Alerts List */}
        {alerts.length === 0 ? (
          <ThemedView style={styles.emptyState}>
            <IconSymbol name="shield.checkered" size={64} color="#34c759" />
            <ThemedText type="subtitle" style={styles.emptyTitle}>
              Không có cảnh báo
            </ThemedText>
            <ThemedText style={styles.emptyText}>
              Tất cả giao dịch đều an toàn! 🎉
            </ThemedText>
          </ThemedView>
        ) : (
          <ThemedView style={styles.alertsList}>
            {alerts.map((alert) => (
              <Pressable key={alert.id} onPress={() => handleAlertPress(alert)}>
                <ThemedView
                  style={[
                    styles.alertCard,
                    !alert.isRead && styles.alertCardUnread,
                  ]}
                >
                  {/* Icon */}
                  <ThemedView
                    style={[
                      styles.iconContainer,
                      {
                        backgroundColor: `${getSeverityColor(
                          alert.severity
                        )}20`,
                      },
                    ]}
                  >
                    <IconSymbol
                      name="exclamationmark.triangle.fill"
                      size={28}
                      color={getSeverityColor(alert.severity)}
                    />
                  </ThemedView>

                  {/* Alert Content */}
                  <ThemedView style={styles.alertContent}>
                    {/* Severity Badge */}
                    <ThemedView
                      style={[
                        styles.severityBadge,
                        {
                          backgroundColor: `${getSeverityColor(
                            alert.severity
                          )}20`,
                        },
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.severityText,
                          { color: getSeverityColor(alert.severity) },
                        ]}
                      >
                        {getSeverityText(alert.severity)}
                      </ThemedText>
                    </ThemedView>

                    {/* Title */}
                    <ThemedText style={styles.alertTitle}>
                      {alert.title}
                    </ThemedText>

                    {/* Message */}
                    <ThemedText style={styles.alertMessage} numberOfLines={2}>
                      {alert.message}
                    </ThemedText>

                    {/* Meta Info */}
                    <ThemedView style={styles.alertMeta}>
                      <IconSymbol name="clock.fill" size={12} color="#888" />
                      <ThemedText style={styles.alertDate}>
                        {formatDate(alert.createdAt)}
                      </ThemedText>

                      {alert.latitude && alert.longitude && (
                        <>
                          <IconSymbol
                            name="location.fill"
                            size={12}
                            color="#888"
                          />
                          <ThemedText style={styles.alertLocation}>
                            {alert.locationAddress || "Đã ghi nhận vị trí"}
                          </ThemedText>
                        </>
                      )}
                    </ThemedView>
                  </ThemedView>

                  {/* Unread Indicator */}
                  {!alert.isRead && <ThemedView style={styles.unreadDot} />}
                </ThemedView>
              </Pressable>
            ))}
          </ThemedView>
        )}

        {/* Info Note */}
        {alerts.length > 0 && (
          <ThemedView style={styles.infoNote}>
            <IconSymbol name="info.circle.fill" size={20} color={tintColor} />
            <ThemedText style={styles.infoText}>
              Nhấn vào cảnh báo để xem chi tiết
            </ThemedText>
          </ThemedView>
        )}
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
  headerSection: {
    marginBottom: 24,
    gap: 8,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  unreadBadge: {
    backgroundColor: "#ff3b30",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  unreadText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  headerSubtext: {
    fontSize: 14,
    opacity: 0.6,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.7,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 16,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
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
  alertsList: {
    gap: 12,
  },
  alertCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  alertCardUnread: {
    borderWidth: 2,
    borderColor: "rgba(255, 59, 48, 0.2)",
    backgroundColor: "rgba(255, 59, 48, 0.02)",
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  alertContent: {
    flex: 1,
    gap: 8,
  },
  severityBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  alertMessage: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
  alertMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  alertDate: {
    fontSize: 12,
    opacity: 0.6,
  },
  alertLocation: {
    fontSize: 12,
    opacity: 0.6,
  },
  unreadDot: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ff3b30",
  },
  infoNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(10, 126, 164, 0.1)",
    marginTop: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    opacity: 0.8,
  },
});
