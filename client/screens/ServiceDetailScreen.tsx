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
  // Residential Services
  "res-missed-trash": {
    title: "Missed Trash Pickup",
    description: "Report a missed residential trash collection. We will schedule a pickup within 24-48 hours of your report.",
    icon: "trash-2",
    color: BrandColors.blue,
    options: [
      { id: "1", name: "Report Missed Pickup", price: "Free", schedule: "Response within 48 hours" },
    ],
  },
  "res-missed-recycling": {
    title: "Missed Recycling",
    description: "Report a missed residential recycling collection. Our team will address your concern promptly.",
    icon: "refresh-cw",
    color: BrandColors.blue,
    options: [
      { id: "1", name: "Report Missed Recycling", price: "Free", schedule: "Response within 48 hours" },
    ],
  },
  "res-missed-yard-waste": {
    title: "Missed Yard Waste",
    description: "Report a missed yard waste collection. Available during seasonal collection periods.",
    icon: "feather",
    color: BrandColors.blue,
    options: [
      { id: "1", name: "Report Missed Yard Waste", price: "Free", schedule: "Response within 48 hours" },
    ],
  },
  "res-roll-cart": {
    title: "Roll Cart Request",
    description: "Request a new roll cart, replacement cart, or additional cart for your residential property.",
    icon: "box",
    color: BrandColors.blue,
    options: [
      { id: "1", name: "New Cart", size: "96 Gallon", price: "Contact for pricing", schedule: "Delivery within 5-7 days" },
      { id: "2", name: "Replacement Cart", size: "96 Gallon", price: "Contact for pricing", schedule: "Delivery within 5-7 days" },
      { id: "3", name: "Additional Cart", size: "96 Gallon", price: "Contact for pricing", schedule: "Delivery within 5-7 days" },
    ],
  },
  "res-roll-off": {
    title: "Roll Off Requests",
    description: "Request a roll off container for residential projects, renovations, or cleanouts.",
    icon: "truck",
    color: BrandColors.blue,
    options: [
      { id: "1", name: "Small Container", size: "10 Yard", price: "Contact for pricing", schedule: "By appointment" },
      { id: "2", name: "Medium Container", size: "20 Yard", price: "Contact for pricing", schedule: "By appointment" },
      { id: "3", name: "Large Container", size: "30 Yard", price: "Contact for pricing", schedule: "By appointment" },
    ],
  },
  "res-bulk-special": {
    title: "Bulk & Special Collection",
    description: "Schedule pickup for bulk items like furniture, appliances, and other large items.",
    icon: "package",
    color: BrandColors.blue,
    options: [
      { id: "1", name: "Bulk Item Pickup", price: "Contact for pricing", schedule: "By appointment" },
      { id: "2", name: "Special Collection", price: "Contact for pricing", schedule: "By appointment" },
    ],
  },
  // Commercial Services
  "com-missed-trash": {
    title: "Missed Trash Pickup",
    description: "Report a missed commercial trash collection. We prioritize commercial accounts for quick resolution.",
    icon: "trash-2",
    color: BrandColors.green,
    options: [
      { id: "1", name: "Report Missed Pickup", price: "Free", schedule: "Response within 24 hours" },
    ],
  },
  "com-missed-recycling": {
    title: "Missed Recycling",
    description: "Report a missed commercial recycling collection. Our team will respond promptly.",
    icon: "refresh-cw",
    color: BrandColors.green,
    options: [
      { id: "1", name: "Report Missed Recycling", price: "Free", schedule: "Response within 24 hours" },
    ],
  },
  "com-missed-yard-waste": {
    title: "Missed Yard Waste",
    description: "Report a missed commercial yard waste collection.",
    icon: "feather",
    color: BrandColors.green,
    options: [
      { id: "1", name: "Report Missed Yard Waste", price: "Free", schedule: "Response within 24 hours" },
    ],
  },
  "com-roll-cart": {
    title: "Roll Cart Request",
    description: "Request commercial roll cart service for your business property.",
    icon: "box",
    color: BrandColors.green,
    options: [
      { id: "1", name: "Commercial Roll Cart", size: "96 Gallon", price: "Contact for pricing", schedule: "Delivery within 3-5 days" },
    ],
  },
  "com-roll-off": {
    title: "Roll Off Requests",
    description: "Request commercial roll off container service for your business.",
    icon: "truck",
    color: BrandColors.green,
    options: [
      { id: "1", name: "Small Container", size: "10 Yard", price: "Contact for pricing", schedule: "By appointment" },
      { id: "2", name: "Medium Container", size: "20 Yard", price: "Contact for pricing", schedule: "By appointment" },
      { id: "3", name: "Large Container", size: "30 Yard", price: "Contact for pricing", schedule: "By appointment" },
      { id: "4", name: "Extra Large", size: "40 Yard", price: "Contact for pricing", schedule: "By appointment" },
    ],
  },
  "com-new-requirements": {
    title: "Requirements for Establishing New Commercial",
    description: "Learn about the requirements for establishing a new commercial sanitation account with DeKalb County.",
    icon: "file-text",
    color: BrandColors.green,
    options: [
      { id: "1", name: "Business License Required", price: "N/A", schedule: "Submit with application" },
      { id: "2", name: "Property Documentation", price: "N/A", schedule: "Submit with application" },
      { id: "3", name: "Service Agreement", price: "N/A", schedule: "Review and sign" },
    ],
  },
  "com-payment-options": {
    title: "Commercial Garbage and Recycling Payment Options",
    description: "View available payment options for commercial garbage and recycling services.",
    icon: "credit-card",
    color: BrandColors.green,
    options: [
      { id: "1", name: "Monthly Billing", price: "Standard", schedule: "Due by 15th of month" },
      { id: "2", name: "Quarterly Billing", price: "5% discount", schedule: "Due at start of quarter" },
      { id: "3", name: "Annual Billing", price: "10% discount", schedule: "Due at start of year" },
      { id: "4", name: "Auto-Pay", price: "Available", schedule: "Automatic monthly" },
    ],
  },
  "com-new-garbage": {
    title: "Establish New Garbage Service",
    description: "Set up new commercial garbage collection service for your business.",
    icon: "plus-square",
    color: BrandColors.green,
    options: [
      { id: "1", name: "New Account Setup", price: "Contact for quote", schedule: "Setup within 5-7 days" },
    ],
  },
  "com-new-recycle": {
    title: "Establish New Recycle Service",
    description: "Set up new commercial recycling service for your business. Help reduce waste and go green.",
    icon: "refresh-cw",
    color: BrandColors.green,
    options: [
      { id: "1", name: "New Recycling Account", price: "Contact for quote", schedule: "Setup within 5-7 days" },
    ],
  },
  "com-front-load": {
    title: "Front Load Dumpster",
    description: "Front load dumpster rental and service for commercial properties.",
    icon: "box",
    color: BrandColors.green,
    options: [
      { id: "1", name: "2 Yard Dumpster", size: "2 Cubic Yards", price: "Contact for pricing", schedule: "Weekly pickup" },
      { id: "2", name: "4 Yard Dumpster", size: "4 Cubic Yards", price: "Contact for pricing", schedule: "Weekly pickup" },
      { id: "3", name: "6 Yard Dumpster", size: "6 Cubic Yards", price: "Contact for pricing", schedule: "Weekly pickup" },
      { id: "4", name: "8 Yard Dumpster", size: "8 Cubic Yards", price: "Contact for pricing", schedule: "Weekly pickup" },
    ],
  },
  "com-special-collection": {
    title: "Commercial Special Collection",
    description: "Schedule special commercial pickup for items outside regular collection.",
    icon: "star",
    color: BrandColors.green,
    options: [
      { id: "1", name: "Special Pickup Request", price: "Contact for quote", schedule: "By appointment" },
    ],
  },
  "com-hand-pick": {
    title: "Commercial Hand-Pick Up",
    description: "Commercial hand-pick up service for businesses with specific collection needs.",
    icon: "hand",
    color: BrandColors.green,
    options: [
      { id: "1", name: "Hand-Pick Up Service", price: "Contact for pricing", schedule: "Scheduled service" },
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
