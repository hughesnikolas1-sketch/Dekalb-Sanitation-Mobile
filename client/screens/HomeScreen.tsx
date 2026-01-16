import React, { useState, useCallback } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, WasteColors } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import {
  generateUpcomingPickups,
  getNextPickup,
  formatPickupDate,
  getDaysUntil,
  getPickupTypeIcon,
  getPickupTypeColor,
  PickupSchedule,
} from "@/lib/pickupData";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function NextPickupCard({ pickup }: { pickup: PickupSchedule | null }) {
  const { theme, isDark } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!pickup) {
    return (
      <View
        style={[
          styles.nextPickupCard,
          { backgroundColor: theme.backgroundDefault },
        ]}
      >
        <ThemedText type="body" style={{ opacity: 0.7 }}>
          No upcoming pickups scheduled
        </ThemedText>
      </View>
    );
  }

  const daysUntil = getDaysUntil(pickup.date);
  const pickupColor = getPickupTypeColor(pickup.type, isDark);

  return (
    <Animated.View
      entering={FadeInDown.delay(100).duration(400)}
      style={[
        styles.nextPickupCard,
        { backgroundColor: theme.backgroundDefault },
        animatedStyle,
      ]}
    >
      <View style={styles.nextPickupHeader}>
        <View style={[styles.pickupIconLarge, { backgroundColor: pickupColor }]}>
          <Feather
            name={getPickupTypeIcon(pickup.type) as any}
            size={32}
            color="#FFFFFF"
          />
        </View>
        <View style={styles.nextPickupInfo}>
          <ThemedText type="small" style={{ opacity: 0.7 }}>
            Next Pickup
          </ThemedText>
          <ThemedText type="h2">{formatPickupDate(pickup.date)}</ThemedText>
          <ThemedText type="body" style={{ color: pickupColor }}>
            {pickup.label}
          </ThemedText>
        </View>
      </View>
      <View style={styles.countdownContainer}>
        <View style={[styles.countdownBadge, { backgroundColor: pickupColor }]}>
          <ThemedText
            type="h1"
            style={{ color: "#FFFFFF", fontWeight: "700" }}
          >
            {daysUntil}
          </ThemedText>
          <ThemedText type="small" style={{ color: "#FFFFFF", opacity: 0.9 }}>
            {daysUntil === 1 ? "day" : "days"}
          </ThemedText>
        </View>
      </View>
    </Animated.View>
  );
}

function PickupListItem({
  pickup,
  index,
}: {
  pickup: PickupSchedule;
  index: number;
}) {
  const { theme, isDark } = useTheme();
  const pickupColor = getPickupTypeColor(pickup.type, isDark);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  return (
    <Animated.View entering={FadeInDown.delay(200 + index * 50).duration(400)}>
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.pickupItem,
          { backgroundColor: theme.backgroundDefault },
          animatedStyle,
        ]}
      >
        <View style={[styles.pickupIcon, { backgroundColor: pickupColor }]}>
          <Feather
            name={getPickupTypeIcon(pickup.type) as any}
            size={20}
            color="#FFFFFF"
          />
        </View>
        <View style={styles.pickupItemInfo}>
          <ThemedText type="h4">{pickup.label}</ThemedText>
          <ThemedText type="small" style={{ opacity: 0.7 }}>
            {formatPickupDate(pickup.date)}
          </ThemedText>
        </View>
        <View style={styles.pickupItemDays}>
          <ThemedText type="h4" style={{ color: pickupColor }}>
            {getDaysUntil(pickup.date)}d
          </ThemedText>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme, isDark } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [refreshing, setRefreshing] = useState(false);
  const [pickups, setPickups] = useState(generateUpcomingPickups);
  const [nextPickup, setNextPickup] = useState(getNextPickup);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => {
      setPickups(generateUpcomingPickups());
      setNextPickup(getNextPickup());
      setRefreshing(false);
    }, 800);
  }, []);

  const handleReportIssue = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate("ReportIssue");
  }, [navigation]);

  const upcomingPickups = pickups.slice(1, 5);

  const renderHeader = () => (
    <View>
      <NextPickupCard pickup={nextPickup} />

      {upcomingPickups.length > 0 ? (
        <Animated.View entering={FadeInDown.delay(150).duration(400)}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            Upcoming Schedule
          </ThemedText>
        </Animated.View>
      ) : null}
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing["5xl"] + 60,
          paddingHorizontal: Spacing.lg,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        data={upcomingPickups}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        renderItem={({ item, index }) => (
          <PickupListItem pickup={item} index={index} />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      <AnimatedPressable
        onPress={handleReportIssue}
        style={[styles.fab, { backgroundColor: theme.primary }]}
      >
        <Feather name="alert-circle" size={24} color="#FFFFFF" />
        <ThemedText style={styles.fabText}>Report Issue</ThemedText>
      </AnimatedPressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  nextPickupCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  nextPickupHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  pickupIconLarge: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.lg,
  },
  nextPickupInfo: {
    flex: 1,
  },
  countdownContainer: {
    position: "absolute",
    top: Spacing.xl,
    right: Spacing.xl,
  },
  countdownBadge: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    minWidth: 60,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  pickupItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  pickupIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  pickupItemInfo: {
    flex: 1,
  },
  pickupItemDays: {
    alignItems: "flex-end",
  },
  fab: {
    position: "absolute",
    bottom: 100,
    right: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.full,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  fabText: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: Spacing.sm,
  },
});
