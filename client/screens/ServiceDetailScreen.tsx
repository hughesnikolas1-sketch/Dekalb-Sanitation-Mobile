import React from "react";
import { View, ScrollView, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { RouteProp, useRoute } from "@react-navigation/native";
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
import { Spacing, BorderRadius, BrandColors } from "@/constants/theme";
import { ServicesStackParamList } from "@/navigation/ServicesStackNavigator";

type ServiceDetailRouteProp = RouteProp<ServicesStackParamList, "ServiceDetail">;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ServiceOption {
  id: string;
  name: string;
  size?: string;
  price: string;
  schedule: string;
}

interface ServiceInfo {
  title: string;
  description: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
  options: ServiceOption[];
}

const serviceDetails: Record<string, ServiceInfo> = {
  "trash-pickup": {
    title: "Trash Pickup",
    description: "Weekly curbside trash collection for your home. Place your bins at the curb by 6:00 AM on your collection day.",
    icon: "trash-2",
    color: BrandColors.blue,
    options: [
      { id: "1", name: "Standard Service", size: "96 Gallon Cart", price: "$18.50/month", schedule: "Weekly" },
      { id: "2", name: "Large Household", size: "Additional 96 Gallon Cart", price: "$9.25/month", schedule: "Weekly" },
    ],
  },
  "recycling": {
    title: "Recycling",
    description: "Bi-weekly curbside recycling collection. Accepted materials include paper, cardboard, plastic bottles, and aluminum cans.",
    icon: "refresh-cw",
    color: BrandColors.green,
    options: [
      { id: "1", name: "Standard Recycling", size: "96 Gallon Cart", price: "Included", schedule: "Bi-weekly" },
      { id: "2", name: "Extra Recycling", size: "Additional Cart", price: "$5.00/month", schedule: "Bi-weekly" },
    ],
  },
  "yard-waste": {
    title: "Yard Waste",
    description: "Seasonal yard waste collection including leaves, grass clippings, and small branches. Available March through November.",
    icon: "feather",
    color: BrandColors.greenDark,
    options: [
      { id: "1", name: "Yard Waste Service", size: "Up to 10 bags/bundles", price: "$8.00/month", schedule: "Weekly (seasonal)" },
      { id: "2", name: "Extended Service", size: "Unlimited bags/bundles", price: "$15.00/month", schedule: "Weekly (seasonal)" },
    ],
  },
  "bulk-pickup": {
    title: "Bulk Item Pickup",
    description: "Schedule pickup for large items like furniture, appliances, and mattresses. Must call 48 hours in advance.",
    icon: "package",
    color: BrandColors.blue,
    options: [
      { id: "1", name: "Single Item", size: "1 large item", price: "$25.00", schedule: "By appointment" },
      { id: "2", name: "Multiple Items", size: "Up to 5 items", price: "$50.00", schedule: "By appointment" },
    ],
  },
  "holiday-schedule": {
    title: "Holiday Schedule",
    description: "Collection schedules may change during major holidays. If your regular collection day falls on a holiday, pickup moves to the next business day.",
    icon: "calendar",
    color: "#7B1FA2",
    options: [],
  },
  "dumpster-rental": {
    title: "Dumpster Rental",
    description: "Temporary and permanent dumpster rentals for businesses. Various sizes available to meet your needs.",
    icon: "box",
    color: BrandColors.green,
    options: [
      { id: "1", name: "Small Dumpster", size: "2 Cubic Yards", price: "$85/month", schedule: "Weekly pickup" },
      { id: "2", name: "Medium Dumpster", size: "4 Cubic Yards", price: "$150/month", schedule: "Weekly pickup" },
      { id: "3", name: "Large Dumpster", size: "8 Cubic Yards", price: "$275/month", schedule: "Weekly pickup" },
    ],
  },
  "scheduled-pickup": {
    title: "Scheduled Pickup",
    description: "Regular commercial waste collection tailored to your business needs. Flexible scheduling options available.",
    icon: "clock",
    color: BrandColors.green,
    options: [
      { id: "1", name: "Weekly Service", size: "Standard", price: "Starting at $100/month", schedule: "1x per week" },
      { id: "2", name: "Bi-Weekly Service", size: "Standard", price: "Starting at $175/month", schedule: "2x per week" },
      { id: "3", name: "Daily Service", size: "Standard", price: "Starting at $350/month", schedule: "5x per week" },
    ],
  },
  "recycling-program": {
    title: "Commercial Recycling",
    description: "Comprehensive recycling solutions for businesses. Help your company go green while reducing waste costs.",
    icon: "refresh-cw",
    color: BrandColors.green,
    options: [
      { id: "1", name: "Basic Recycling", size: "2 Yard Container", price: "$75/month", schedule: "Weekly" },
      { id: "2", name: "Full Recycling", size: "4 Yard Container", price: "$125/month", schedule: "Weekly" },
    ],
  },
  "compactor-service": {
    title: "Compactor Service",
    description: "Industrial waste compactors for high-volume businesses. Reduce pickup frequency and save money.",
    icon: "minimize-2",
    color: BrandColors.green,
    options: [
      { id: "1", name: "Compactor Rental", size: "30 Yard", price: "$500/month", schedule: "As needed" },
      { id: "2", name: "Compactor + Service", size: "30 Yard", price: "$750/month", schedule: "Weekly" },
    ],
  },
  "construction-waste": {
    title: "Construction Waste",
    description: "Roll-off containers for construction sites and renovation projects. Various sizes for any project.",
    icon: "tool",
    color: BrandColors.green,
    options: [
      { id: "1", name: "Small Roll-off", size: "10 Yard", price: "$350/rental", schedule: "7-day rental" },
      { id: "2", name: "Medium Roll-off", size: "20 Yard", price: "$450/rental", schedule: "7-day rental" },
      { id: "3", name: "Large Roll-off", size: "30 Yard", price: "$550/rental", schedule: "7-day rental" },
    ],
  },
};

function OptionCard({ option, color }: { option: ServiceOption; color: string }) {
  const { theme } = useTheme();
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
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
      style={[
        styles.optionCard,
        { backgroundColor: theme.backgroundDefault, borderColor: theme.divider },
        animatedStyle,
      ]}
    >
      <View style={styles.optionHeader}>
        <ThemedText type="h4">{option.name}</ThemedText>
        <ThemedText type="h4" style={{ color }}>
          {option.price}
        </ThemedText>
      </View>
      {option.size ? (
        <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
          {option.size}
        </ThemedText>
      ) : null}
      <View style={styles.scheduleRow}>
        <Feather name="calendar" size={16} color={theme.textSecondary} />
        <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: Spacing.xs }}>
          {option.schedule}
        </ThemedText>
      </View>
    </AnimatedPressable>
  );
}

export default function ServiceDetailScreen() {
  const route = useRoute<ServiceDetailRouteProp>();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const { serviceId } = route.params;
  const service = serviceDetails[serviceId] || {
    title: "Service",
    description: "Service details coming soon.",
    icon: "info",
    color: BrandColors.blue,
    options: [],
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing.xl,
          paddingHorizontal: Spacing.xl,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.headerSection}>
          <View style={[styles.iconLarge, { backgroundColor: service.color }]}>
            <Feather name={service.icon} size={36} color="#FFFFFF" />
          </View>
          <ThemedText type="h2" style={styles.serviceTitle}>
            {service.title}
          </ThemedText>
          <ThemedText type="body" style={[styles.serviceDescription, { color: theme.textSecondary }]}>
            {service.description}
          </ThemedText>
        </Animated.View>

        {service.options.length > 0 ? (
          <>
            <Animated.View entering={FadeInDown.delay(200).duration(400)}>
              <ThemedText type="h3" style={styles.sectionTitle}>
                Pricing & Options
              </ThemedText>
            </Animated.View>

            {service.options.map((option, index) => (
              <Animated.View
                key={option.id}
                entering={FadeInDown.delay(250 + index * 50).duration(400)}
              >
                <OptionCard option={option} color={service.color} />
              </Animated.View>
            ))}
          </>
        ) : null}

        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <Pressable
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
            style={[styles.contactButton, { backgroundColor: service.color }]}
          >
            <Feather name="phone" size={22} color="#FFFFFF" style={{ marginRight: Spacing.sm }} />
            <ThemedText type="button" style={{ color: "#FFFFFF" }}>
              Contact Us for More Info
            </ThemedText>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  iconLarge: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.xl,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  serviceTitle: {
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  serviceDescription: {
    textAlign: "center",
    lineHeight: 26,
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  optionCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.md,
    borderWidth: 1,
  },
  optionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scheduleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.md,
  },
  contactButton: {
    flexDirection: "row",
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.xl,
  },
});
