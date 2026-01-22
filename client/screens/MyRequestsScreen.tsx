import React from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useQuery } from "@tanstack/react-query";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { LiveAgentBanner } from "@/components/LiveAgentBanner";
import { FloatingParticles } from "@/components/FloatingParticles";
import GarbageTruckLoader from "@/components/GarbageTruckLoader";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { Spacing, BorderRadius, BrandColors, FuturisticGradients } from "@/constants/theme";

interface ServiceRequest {
  id: string;
  serviceType: string;
  serviceId: string;
  status: string;
  formData: any;
  amount: number | null;
  createdAt: string;
  updatedAt: string;
}

const STATUS_CONFIG: Record<string, { color: string; icon: keyof typeof Feather.glyphMap; label: string }> = {
  pending: { color: "#FF9800", icon: "clock", label: "Pending" },
  pending_payment: { color: "#FF9800", icon: "credit-card", label: "Awaiting Payment" },
  paid: { color: "#2196F3", icon: "check-circle", label: "Payment Received" },
  submitted: { color: "#4CAF50", icon: "send", label: "Submitted" },
  investigating: { color: "#9C27B0", icon: "search", label: "Under Investigation" },
  in_progress: { color: "#2196F3", icon: "truck", label: "In Progress" },
  scheduled: { color: "#00BCD4", icon: "calendar", label: "Scheduled" },
  completed: { color: "#4CAF50", icon: "check", label: "Completed" },
  cancelled: { color: "#F44336", icon: "x-circle", label: "Cancelled" },
};

const SERVICE_NAMES: Record<string, string> = {
  "residential-trash": "Trash Pickup",
  "residential-recycling": "Recycling",
  "residential-yard-waste": "Yard Waste",
  "residential-bulk-pickup": "Bulk Item Pickup",
  "residential-roll-off": "Roll-Off Container",
  "residential-roll-cart": "Roll Cart Service",
  "commercial-dumpster": "Dumpster Rental",
  "commercial-scheduled-pickup": "Scheduled Pickup",
  "commercial-recycling": "Commercial Recycling",
  "commercial-compactor": "Compactor Service",
  "commercial-construction": "Construction Waste",
  "commercial-roll-off": "Commercial Roll-Off",
  "commercial-roll-cart": "Commercial Roll Cart",
};

export default function MyRequestsScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const { data: requests = [], isLoading, refetch, isRefetching } = useQuery<ServiceRequest[]>({
    queryKey: ["/api/service-requests"],
    enabled: !!user,
  });

  const getStatusConfig = (status: string) => {
    return STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  };

  const getServiceName = (serviceId: string) => {
    return SERVICE_NAMES[serviceId] || serviceId.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const renderRequest = ({ item, index }: { item: ServiceRequest; index: number }) => {
    const statusConfig = getStatusConfig(item.status);
    const isResidential = item.serviceId.startsWith("residential");

    return (
      <Animated.View entering={FadeInDown.delay(index * 100).duration(400)}>
        <View style={[styles.requestCard, { backgroundColor: theme.backgroundSecondary }]}>
          <View style={styles.requestHeader}>
            <View style={[styles.serviceIcon, { backgroundColor: isResidential ? BrandColors.blue + "20" : BrandColors.green + "20" }]}>
              <Feather
                name={isResidential ? "home" : "briefcase"}
                size={20}
                color={isResidential ? BrandColors.blue : BrandColors.green}
              />
            </View>
            <View style={styles.requestInfo}>
              <ThemedText type="body" style={{ fontWeight: "600" }}>
                {getServiceName(item.serviceId)}
              </ThemedText>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                {formatDate(item.createdAt)}
              </ThemedText>
            </View>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + "15" }]}>
            <Feather name={statusConfig.icon} size={16} color={statusConfig.color} />
            <ThemedText type="small" style={{ color: statusConfig.color, marginLeft: Spacing.xs, fontWeight: "600" }}>
              {statusConfig.label}
            </ThemedText>
          </View>

          {item.status === "investigating" ? (
            <View style={[styles.noticeBox, { backgroundColor: "#FFF3E0" }]}>
              <Feather name="info" size={16} color="#F57C00" />
              <ThemedText type="small" style={{ color: "#E65100", marginLeft: Spacing.sm, flex: 1 }}>
                We are investigating your request. Please allow 1-10 business days for delivery after investigation is complete.
              </ThemedText>
            </View>
          ) : null}

          {item.amount ? (
            <View style={styles.amountRow}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Amount:
              </ThemedText>
              <ThemedText type="body" style={{ fontWeight: "700", color: BrandColors.green }}>
                ${(item.amount / 100).toFixed(2)}
              </ThemedText>
            </View>
          ) : null}

          <View style={styles.requestFooter}>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              Request ID: {item.id.slice(0, 8)}...
            </ThemedText>
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIcon, { backgroundColor: BrandColors.blue + "20" }]}>
        <Feather name="file-text" size={40} color={BrandColors.blue} />
      </View>
      <ThemedText type="h4" style={{ marginTop: Spacing.lg, textAlign: "center" }}>
        No Requests Yet
      </ThemedText>
      <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: "center", marginTop: Spacing.sm }}>
        When you submit service requests, they will appear here with status updates.
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <FloatingParticles count={8} />
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={renderRequest}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: insets.bottom + 100,
          paddingHorizontal: Spacing.lg,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
        ListHeaderComponent={
          <Animated.View entering={FadeInDown.duration(400)}>
            <LinearGradient
              colors={FuturisticGradients.greenBlue as [string, string, ...string[]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.headerCard}
            >
              <View style={styles.headerIcon}>
                <Feather name="file-text" size={28} color="#FFFFFF" />
              </View>
              <ThemedText type="h3" style={{ color: "#FFFFFF", marginTop: Spacing.sm }}>
                My Requests
              </ThemedText>
              <ThemedText type="small" style={{ color: "rgba(255,255,255,0.8)", marginTop: Spacing.xs }}>
                Track the status of your service requests
              </ThemedText>
            </LinearGradient>
          </Animated.View>
        }
        ListEmptyComponent={isLoading ? (
          <View style={styles.loadingState}>
            <GarbageTruckLoader message="Loading your requests..." size="large" color={BrandColors.blue} />
          </View>
        ) : renderEmptyState()}
        ListFooterComponent={<LiveAgentBanner />}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    alignItems: "center",
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  requestCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  requestHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  serviceIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  requestInfo: {
    flex: 1,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  noticeBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.08)",
  },
  requestFooter: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing.xl * 2,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingState: {
    paddingVertical: Spacing.xl * 2,
    alignItems: "center",
  },
});
