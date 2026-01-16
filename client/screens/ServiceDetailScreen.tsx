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
    description: "Report a missed commercial trash collection. Please provide details about your roll cart, pickup time, and upload a photo of items at curb.",
    icon: "trash-2",
    color: BrandColors.green,
    options: [
      { id: "1", name: "Report Missed Collection", price: "Free", schedule: "Response within 24 hours" },
      { id: "2", name: "Request Routeware Footage", price: "Free", schedule: "Available upon request" },
    ],
  },
  "com-missed-recycling": {
    title: "Missed Recycling",
    description: "Report a missed commercial recycling collection. Confirm if items are recyclable and provide details about boxes at curb.",
    icon: "refresh-cw",
    color: BrandColors.green,
    options: [
      { id: "1", name: "Report Missed Collection", price: "Free", schedule: "Response within 24 hours" },
      { id: "2", name: "Request Routeware Footage", price: "Free", schedule: "Available upon request" },
    ],
  },
  "com-missed-yard-waste": {
    title: "Missed Yard Waste",
    description: "Report a missed yard waste collection. Specify debris type, number of bags, and confirm branches are cut to 4 feet or less.",
    icon: "feather",
    color: BrandColors.green,
    options: [
      { id: "1", name: "Report Missed Collection", price: "Free", schedule: "Response within 24 hours" },
      { id: "2", name: "Request Routeware Footage", price: "Free", schedule: "Available upon request" },
    ],
  },
  "com-roll-cart": {
    title: "Roll Cart Services",
    description: "Request new, replacement, or additional roll carts. Annual prorated assessment fee may apply for additional carts.",
    icon: "box",
    color: BrandColors.green,
    options: [
      { id: "1", name: "Complimentary 95-Gallon Trash Cart", size: "95 Gallon", price: "Free", schedule: "New customers" },
      { id: "2", name: "Complimentary 45-Gallon Recycle Cart", size: "45 Gallon", price: "Free", schedule: "New customers" },
      { id: "3", name: "Additional Trash Roll Cart", size: "95 Gallon", price: "$25", schedule: "5-7 days delivery" },
      { id: "4", name: "New 45-Gallon Recycle Cart", size: "45 Gallon", price: "$42.50", schedule: "5-7 days delivery" },
      { id: "5", name: "New 65-Gallon Recycle Cart", size: "65 Gallon", price: "$52.30", schedule: "5-7 days delivery" },
      { id: "6", name: "New Trash Roll Cart", size: "95 Gallon", price: "$60.55", schedule: "5-7 days delivery" },
      { id: "7", name: "Damaged Cart Replacement", size: "Refurbished", price: "Free", schedule: "5-7 days delivery" },
      { id: "8", name: "Stolen Cart Replacement", size: "Refurbished", price: "Free", schedule: "5-7 days delivery" },
      { id: "9", name: "Return Cart", size: "Schedule pickup", price: "Free", schedule: "By appointment" },
    ],
  },
  "com-roll-off": {
    title: "Roll Off Request",
    description: "Commercial roll off containers available for 2-week rental periods. Fee applied when container is serviced and returned.",
    icon: "truck",
    color: BrandColors.green,
    options: [
      { id: "1", name: "10 Yard Container", size: "Small commercial projects", price: "$226", schedule: "2-week rental" },
      { id: "2", name: "20 Yard Container", size: "Medium commercial projects", price: "$451", schedule: "2-week rental" },
      { id: "3", name: "30 Yard Container", size: "Large commercial projects", price: "$677", schedule: "2-week rental" },
      { id: "4", name: "40 Yard Container", size: "Major commercial projects", price: "$902", schedule: "2-week rental" },
      { id: "5", name: "Request Early Pickup", size: "Container full before 2 weeks", price: "Included", schedule: "As needed" },
    ],
  },
  "com-new-requirements": {
    title: "Requirements for Establishing Commercial Sanitation Service",
    description: "Visit: 3720 Leroy Scott Drive, Decatur, GA 30032. Hours: Monday-Friday, 9 a.m. - 3 p.m.",
    icon: "file-text",
    color: BrandColors.green,
    options: [
      { id: "1", name: "New Business Application", size: "Signed by Sanitation Division staff", price: "Required", schedule: "In-person" },
      { id: "2", name: "Photo Identification", size: "Driver's license/State ID/Passport", price: "Required", schedule: "Bring to office" },
      { id: "3", name: "Proof of Ownership or Lease", size: "Deed, title, or lease agreement", price: "Required", schedule: "Bring to office" },
      { id: "4", name: "No Outstanding Debt", size: "Clear sanitation account", price: "Required", schedule: "Verified" },
      { id: "5", name: "Dumpster Delivery & Removal Fee", size: "Per dumpster prepayment", price: "$150", schedule: "Plus first month" },
    ],
  },
  "com-payment-options": {
    title: "Commercial Garbage and Recycling Payment Options",
    description: "A nonrefundable service charge applies to online, telephone, and in-office credit/debit card payments. Email confirmation to CommercialService@dekalbcountyga.gov",
    icon: "credit-card",
    color: BrandColors.green,
    options: [
      { id: "1", name: "Online Payment", size: "Myaccount.dekalbcountyga.gov", price: "Service fee applies", schedule: "24/7 available" },
      { id: "2", name: "Quick Pay", size: "Fast online option", price: "Service fee applies", schedule: "Instant" },
      { id: "3", name: "InvoiceCloud Portal", size: "Alternative payment", price: "Service fee applies", schedule: "24/7 available" },
      { id: "4", name: "Telephone Payment", size: "Call customer service", price: "Service fee applies", schedule: "Business hours" },
      { id: "5", name: "In-Office Payment", size: "3720 Leroy Scott Drive", price: "Service fee applies", schedule: "Mon-Fri 9am-3pm" },
    ],
  },
  "com-new-garbage": {
    title: "Establish New Garbage Service",
    description: "Set up new commercial garbage collection. Visit Sanitation Division office with required documentation.",
    icon: "plus-square",
    color: BrandColors.green,
    options: [
      { id: "1", name: "New Account Application", size: "Business owner", price: "$150 + first month", schedule: "In-person setup" },
      { id: "2", name: "Tenant/Lease Account", size: "Commercial tenant", price: "$150 + first month", schedule: "In-person setup" },
      { id: "3", name: "Change of Ownership", size: "Transfer account", price: "Contact office", schedule: "In-person" },
    ],
  },
  "com-new-recycle": {
    title: "Establish New Recycle Service",
    description: "Add commercial recycling to your business. Reduce waste and help keep DeKalb County green.",
    icon: "refresh-cw",
    color: BrandColors.green,
    options: [
      { id: "1", name: "Commercial Recycling Setup", size: "Add to existing service", price: "Contact for quote", schedule: "5-7 days setup" },
    ],
  },
  "com-front-load": {
    title: "Front Load Dumpster",
    description: "Front load dumpster service for commercial properties. Various sizes available with weekly pickup.",
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
    description: "Schedule special commercial pickup for items outside your regular collection schedule.",
    icon: "star",
    color: BrandColors.green,
    options: [
      { id: "1", name: "Special Pickup Request", price: "Contact for quote", schedule: "By appointment" },
    ],
  },
  "com-hand-pick": {
    title: "Commercial Hand-Pick Up",
    description: "Hand-pick up service for commercial businesses with specific collection needs.",
    icon: "users",
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
