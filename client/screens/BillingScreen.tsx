import React from "react";
import {
  View,
  StyleSheet,
  FlatList,
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
import GarbageTruckLoader from "@/components/GarbageTruckLoader";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { Spacing, BorderRadius, BrandColors, FuturisticGradients } from "@/constants/theme";

interface Transaction {
  id: string;
  type: string;
  description: string;
  amount: number;
  status: string;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  completed: "#4CAF50",
  pending: "#FF9800",
  failed: "#F44336",
  refunded: "#9C27B0",
};

export default function BillingScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const { data: transactions = [], isLoading, refetch, isRefetching } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
    enabled: !!user,
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatAmount = (amount: number) => {
    return `$${(amount / 100).toFixed(2)}`;
  };

  const renderTransaction = ({ item, index }: { item: Transaction; index: number }) => {
    const statusColor = STATUS_COLORS[item.status] || STATUS_COLORS.pending;

    return (
      <Animated.View entering={FadeInDown.delay(index * 100).duration(400)}>
        <View style={[styles.transactionCard, { backgroundColor: theme.backgroundSecondary }]}>
          <View style={styles.transactionRow}>
            <View style={styles.transactionLeft}>
              <View style={[styles.transactionIcon, { backgroundColor: BrandColors.green + "20" }]}>
                <Feather
                  name={item.status === "completed" ? "check-circle" : item.status === "pending" ? "clock" : "alert-circle"}
                  size={20}
                  color={statusColor}
                />
              </View>
              <View style={styles.transactionInfo}>
                <ThemedText type="body" style={{ fontWeight: "600" }}>
                  {item.description}
                </ThemedText>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  {formatDate(item.createdAt)}
                </ThemedText>
              </View>
            </View>
            <View style={styles.transactionRight}>
              <ThemedText type="body" style={{ fontWeight: "700", color: BrandColors.green }}>
                {formatAmount(item.amount)}
              </ThemedText>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            </View>
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIcon, { backgroundColor: BrandColors.green + "20" }]}>
        <Feather name="credit-card" size={40} color={BrandColors.green} />
      </View>
      <ThemedText type="h4" style={{ marginTop: Spacing.lg, textAlign: "center" }}>
        No Transactions Yet
      </ThemedText>
      <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: "center", marginTop: Spacing.sm }}>
        Your payment history will appear here when you make payments for services.
      </ThemedText>
    </View>
  );

  const renderSummary = () => {
    const completedTransactions = transactions.filter((t) => t.status === "completed");
    const totalSpent = completedTransactions.reduce((sum, t) => sum + t.amount, 0);

    return (
      <Animated.View entering={FadeInDown.delay(200).duration(400)}>
        <View style={[styles.summaryCard, { backgroundColor: theme.backgroundSecondary }]}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                Total Transactions
              </ThemedText>
              <ThemedText type="h3" style={{ color: BrandColors.blue }}>
                {transactions.length}
              </ThemedText>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: theme.divider }]} />
            <View style={styles.summaryItem}>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                Total Spent
              </ThemedText>
              <ThemedText type="h3" style={{ color: BrandColors.green }}>
                {formatAmount(totalSpent)}
              </ThemedText>
            </View>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={renderTransaction}
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
          <>
            <Animated.View entering={FadeInDown.duration(400)}>
              <LinearGradient
                colors={FuturisticGradients.greenBlue as [string, string, ...string[]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerCard}
              >
                <View style={styles.headerIcon}>
                  <Feather name="credit-card" size={28} color="#FFFFFF" />
                </View>
                <ThemedText type="h3" style={{ color: "#FFFFFF", marginTop: Spacing.sm }}>
                  Billing & Payments
                </ThemedText>
                <ThemedText type="small" style={{ color: "rgba(255,255,255,0.8)", marginTop: Spacing.xs }}>
                  View your payment history and transactions
                </ThemedText>
              </LinearGradient>
            </Animated.View>

            {transactions.length > 0 ? renderSummary() : null}

            {transactions.length > 0 ? (
              <ThemedText type="h4" style={{ marginTop: Spacing.lg, marginBottom: Spacing.md }}>
                Recent Transactions
              </ThemedText>
            ) : null}
          </>
        }
        ListEmptyComponent={isLoading ? (
          <View style={styles.loadingState}>
            <GarbageTruckLoader message="Loading transactions..." size="large" color={BrandColors.green} />
          </View>
        ) : renderEmptyState()}
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
  summaryCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryDivider: {
    width: 1,
    height: 40,
  },
  transactionCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  transactionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: Spacing.xs,
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
