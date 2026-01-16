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
  schedule?: string;
}

interface ContentSection {
  title: string;
  content: string[];
}

interface ServiceInfo {
  title: string;
  description: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
  options: ServiceOption[];
  formQuestions?: string[];
  contentSections?: ContentSection[];
  additionalInfo?: string[];
  links?: { text: string; url: string }[];
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
    description: "Report a missed trash collection. Please complete all required fields below.",
    icon: "trash-2",
    color: BrandColors.green,
    options: [],
    formQuestions: [
      "Service Location (Select your address)",
      "Do you have a county issued roll cart? (Yes/No)",
      "Did the roll cart have excess overflow? (Yes/No)",
      "Was there anything in the roll cart that was not trash?",
      "What time was the roll cart placed at the curb?",
    ],
    additionalInfo: [
      "Would you like to know possible reasons you were missed?",
      "Request Routeware Footage - View footage of collection vehicle at your location",
      "Additional Details (Optional) - Provide any additional information",
      "Photo Required - Take Photo or Choose File from your device",
    ],
  },
  "com-missed-recycling": {
    title: "Missed Recycling",
    description: "Report a missed recycling collection. Please complete all required fields below.",
    icon: "refresh-cw",
    color: BrandColors.green,
    options: [],
    formQuestions: [
      "Service Location (Select your address)",
      "Is there any glass in your roll cart? (Yes/No)",
      "Is everything inside the cart considered recyclable? (Yes/No/Not Sure)",
      "How many boxes are at the curb?",
    ],
    additionalInfo: [
      "Would you like to know possible reasons you were missed?",
      "Request Routeware Footage - View footage of collection vehicle at your location",
      "Additional Details (Optional) - Provide any additional information",
      "Photo Required - Take Photo or Choose File from your device",
    ],
  },
  "com-missed-yard-waste": {
    title: "Missed Yard Waste",
    description: "Report a missed yard waste collection. Please complete all required fields below.",
    icon: "feather",
    color: BrandColors.green,
    options: [],
    formQuestions: [
      "Service Location (Select your address)",
      "What type of debris is it? (Select from dropdown)",
      "How many bags are at the curb currently?",
      "Are there any dirt in the bags? (Yes/No)",
      "Are the bags biodegradable? (Yes/No/N/A loose pile)",
      "Are the tree branches and limbs cut down to 4 feet or less? (Yes/No/N/A no branches)",
      "What time were items placed at the curb?",
    ],
    additionalInfo: [
      "Would you like to know possible reasons you were missed?",
      "Additional Details (Optional) - Provide any additional information",
      "Photo Required - Take Photo or Choose File from your device",
    ],
  },
  "com-roll-cart": {
    title: "Roll Cart Services",
    description: "An annual prorated assessment fee applies when receiving an additional cart. Select the service you need below.",
    icon: "box",
    color: BrandColors.green,
    options: [
      { id: "1", name: "Complimentary 95-Gallon Trash Cart", size: "One complimentary 95-gallon trash roll cart provided to each new residential customer", price: "Free" },
      { id: "2", name: "Complimentary 45-Gallon Recycle Cart", size: "One complimentary 45-gallon recycle roll cart provided to each new residential customer", price: "Free" },
      { id: "3", name: "Additional Trash Roll Cart", size: "Request an additional trash roll cart for your property", price: "$25" },
      { id: "4", name: "New 45-Gallon Recycle Cart", size: "Request a new 45-gallon recycle cart", price: "$42.50" },
      { id: "5", name: "New 65-Gallon Recycle Cart", size: "Request a new 65-gallon recycle cart", price: "$52.30" },
      { id: "6", name: "New Trash Roll Cart", size: "Request a new trash roll cart", price: "$60.55" },
      { id: "7", name: "Damaged Cart", size: "Repair or refurbished replacement provided at no charge", price: "Free" },
      { id: "8", name: "Stolen Cart", size: "Refurbished replacement provided at no charge", price: "Free" },
      { id: "9", name: "Return Cart", size: "Schedule a cart return or pickup", price: "Free" },
    ],
    links: [
      { text: "View Annual Prorated Fee Assessments", url: "https://dekalbcountyga.gov" },
      { text: "Pay via InvoiceCloud Portal", url: "https://dekalbcountyga.gov" },
    ],
  },
  "com-roll-off": {
    title: "Roll Off Request",
    description: "Roll off containers are available for 2-week rental periods. The roll off fee is applied once the container has been serviced by the driver and returned to the Sanitation Division.",
    icon: "truck",
    color: BrandColors.green,
    options: [
      { id: "1", name: "10 Yard Container", size: "2-week rental period", price: "$226" },
      { id: "2", name: "20 Yard Container", size: "2-week rental period", price: "$451" },
      { id: "3", name: "30 Yard Container", size: "2-week rental period", price: "$677" },
      { id: "4", name: "40 Yard Container", size: "2-week rental period", price: "$902" },
      { id: "5", name: "Request Early Pickup", size: "If your container is full before the 2-week period ends, request an early pickup", price: "Included" },
    ],
    links: [
      { text: "Pay via InvoiceCloud Portal", url: "https://dekalbcountyga.gov" },
    ],
  },
  "com-new-requirements": {
    title: "Requirements for Establishing Commercial Sanitation Service",
    description: "Office Location: 3720 Leroy Scott Drive, Decatur, GA 30032\nOffice Hours: Monday - Friday, 9 a.m. - 3 p.m.",
    icon: "file-text",
    color: BrandColors.green,
    options: [],
    contentSections: [
      {
        title: "New Commercial Business Owner",
        content: [
          "1. New commercial business application (signed by Sanitation Division staff only)",
          "2. Photo identification: driver's license, state-issued identification card, or passport",
          "3. Proof of ownership: deed, title, bill of sale or current property tax statement",
          "4. No outstanding sanitation debt associated with property address",
          "5. Prepayment of dumpster delivery and removal fee of $150 per dumpster, plus first month's collection",
        ],
      },
      {
        title: "Commercial Business Tenant/Lease",
        content: [
          "1. New commercial business application (signed by Sanitation Division staff only)",
          "2. Photo identification: driver's license, state-issued identification card, or passport",
          "3. Lease agreement; no subleases accepted",
          "4. Proof of responsibility for sanitation services (included in lease or separate utility agreement)",
          "5. Prepayment of dumpster delivery and removal fee of $150 per dumpster, plus first month's collection",
        ],
      },
      {
        title: "Change in Business Ownership",
        content: [
          "If you are purchasing an existing business, you must establish a new account in your name.",
          "The previous owner's account will be closed upon transfer of ownership.",
          "Please bring proof of purchase and all required documentation listed above.",
        ],
      },
    ],
    additionalInfo: [
      "Ready to Apply?",
      "Each business owner or tenant/renter is required to provide the above documentation at the administrative office.",
    ],
  },
  "com-payment-options": {
    title: "Commercial Garbage and Recycling Payment Options",
    description: "A nonrefundable service charge applies to online, telephone, and in-office credit/debit card payments.",
    icon: "credit-card",
    color: BrandColors.green,
    options: [],
    contentSections: [
      {
        title: "Online Payments",
        content: [
          "Visit Myaccount.dekalbcountyga.gov",
          "Click on the quick pay tab",
          "Enter your account information",
          "Complete payment with credit/debit card",
        ],
      },
      {
        title: "Telephone Payments",
        content: [
          "Call our customer service line during business hours",
          "Have your account number ready",
          "Complete payment with credit/debit card",
        ],
      },
      {
        title: "In-Office Payments",
        content: [
          "Visit: 3720 Leroy Scott Drive, Decatur, GA 30032",
          "Hours: Monday - Friday, 9 a.m. - 3 p.m.",
          "Accepted: Cash, check, credit/debit card",
        ],
      },
    ],
    additionalInfo: [
      "Email confirmation to: CommercialService@dekalbcountyga.gov",
    ],
    links: [
      { text: "Pay via InvoiceCloud Portal", url: "https://dekalbcountyga.gov" },
      { text: "Visit Myaccount.dekalbcountyga.gov", url: "https://myaccount.dekalbcountyga.gov" },
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

  const isFormService = service.formQuestions && service.formQuestions.length > 0;
  const hasContentSections = service.contentSections && service.contentSections.length > 0;

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

        {isFormService ? (
          <>
            <Animated.View entering={FadeInDown.delay(200).duration(400)}>
              <ThemedText type="h3" style={styles.sectionTitle}>
                Trash Collection Details
              </ThemedText>
            </Animated.View>

            {service.formQuestions?.map((question, index) => (
              <Animated.View
                key={index}
                entering={FadeInDown.delay(250 + index * 30).duration(400)}
              >
                <View style={[styles.formQuestionCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.divider }]}>
                  <Feather name="help-circle" size={18} color={service.color} style={{ marginRight: Spacing.sm }} />
                  <ThemedText type="body" style={{ flex: 1 }}>{question}</ThemedText>
                </View>
              </Animated.View>
            ))}

            {service.additionalInfo ? (
              <Animated.View entering={FadeInDown.delay(400).duration(400)}>
                <View style={[styles.infoCard, { backgroundColor: service.color + "15", borderColor: service.color + "30" }]}>
                  {service.additionalInfo.map((info, index) => (
                    <View key={index} style={styles.infoRow}>
                      <Feather name="info" size={16} color={service.color} style={{ marginRight: Spacing.sm }} />
                      <ThemedText type="body" style={{ flex: 1 }}>{info}</ThemedText>
                    </View>
                  ))}
                </View>
              </Animated.View>
            ) : null}

            <Animated.View entering={FadeInDown.delay(500).duration(400)}>
              <Pressable
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
                style={[styles.submitButton, { backgroundColor: service.color }]}
              >
                <ThemedText type="body" style={{ color: "#FFFFFF", fontWeight: "600", fontSize: 18 }}>
                  Submit Request
                </ThemedText>
              </Pressable>
            </Animated.View>
          </>
        ) : null}

        {hasContentSections ? (
          <>
            {service.contentSections?.map((section, sectionIndex) => (
              <Animated.View
                key={sectionIndex}
                entering={FadeInDown.delay(200 + sectionIndex * 100).duration(400)}
              >
                <View style={[styles.contentSection, { backgroundColor: theme.backgroundDefault, borderColor: theme.divider }]}>
                  <ThemedText type="h4" style={[styles.contentSectionTitle, { color: service.color }]}>
                    {section.title}
                  </ThemedText>
                  {section.content.map((item, itemIndex) => (
                    <View key={itemIndex} style={styles.contentItem}>
                      <ThemedText type="body" style={styles.contentText}>{item}</ThemedText>
                    </View>
                  ))}
                </View>
              </Animated.View>
            ))}

            {service.additionalInfo ? (
              <Animated.View entering={FadeInDown.delay(500).duration(400)}>
                <View style={[styles.infoCard, { backgroundColor: service.color + "15", borderColor: service.color + "30" }]}>
                  {service.additionalInfo.map((info, index) => (
                    <View key={index} style={styles.infoRow}>
                      <Feather name="check-circle" size={16} color={service.color} style={{ marginRight: Spacing.sm }} />
                      <ThemedText type="body" style={{ flex: 1, fontWeight: index === 0 ? "600" : "400" }}>{info}</ThemedText>
                    </View>
                  ))}
                </View>
              </Animated.View>
            ) : null}
          </>
        ) : null}

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

        {service.links && service.links.length > 0 ? (
          <Animated.View entering={FadeInDown.delay(600).duration(400)}>
            <ThemedText type="h4" style={[styles.sectionTitle, { marginTop: Spacing.lg }]}>
              Quick Links
            </ThemedText>
            {service.links.map((link, index) => (
              <Pressable
                key={index}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                style={[styles.linkButton, { borderColor: service.color }]}
              >
                <Feather name="external-link" size={18} color={service.color} style={{ marginRight: Spacing.sm }} />
                <ThemedText type="body" style={{ color: service.color }}>{link.text}</ThemedText>
              </Pressable>
            ))}
          </Animated.View>
        ) : null}

        <Animated.View entering={FadeInDown.delay(700).duration(400)}>
          <Pressable
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
            style={[styles.contactButton, { backgroundColor: service.color }]}
          >
            <Feather name="phone" size={22} color="#FFFFFF" style={{ marginRight: Spacing.sm }} />
            <ThemedText type="body" style={{ color: "#FFFFFF", fontWeight: "600", fontSize: 18 }}>
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
  formQuestionCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
  },
  infoCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  submitButton: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.lg,
  },
  contentSection: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
  },
  contentSectionTitle: {
    marginBottom: Spacing.md,
    fontWeight: "600",
  },
  contentItem: {
    marginBottom: Spacing.sm,
  },
  contentText: {
    lineHeight: 24,
  },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    marginBottom: Spacing.sm,
  },
});
