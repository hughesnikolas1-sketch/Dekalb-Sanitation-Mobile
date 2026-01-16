import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, Pressable, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { RouteProp, useRoute } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeInDown,
  FadeInUp,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import {
  Spacing,
  BorderRadius,
  BrandColors,
  FuturisticGradients,
  GlowEffects,
  ServiceReminders,
} from "@/constants/theme";
import { ServicesStackParamList } from "@/navigation/ServicesStackNavigator";

type ServiceDetailRouteProp = RouteProp<ServicesStackParamList, "ServiceDetail">;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface FormQuestion {
  question: string;
  type: "text" | "yesno" | "select" | "time";
  options?: string[];
  placeholder?: string;
}

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
  gradientColors: string[];
  options: ServiceOption[];
  formQuestions?: FormQuestion[];
  contentSections?: ContentSection[];
  additionalInfo?: string[];
  links?: { text: string; url: string }[];
}

const serviceDetails: Record<string, ServiceInfo> = {
  "res-missed-trash": {
    title: "Missed Trash Pickup",
    description: "Report a missed residential trash collection. We will schedule a pickup within 24-48 hours of your report.",
    icon: "trash-2",
    color: BrandColors.blue,
    gradientColors: FuturisticGradients.residential,
    options: [
      { id: "1", name: "Report Missed Pickup", price: "Free", schedule: "Response within 48 hours" },
    ],
  },
  "res-missed-recycling": {
    title: "Missed Recycling",
    description: "Report a missed residential recycling collection. Our team will address your concern promptly.",
    icon: "refresh-cw",
    color: BrandColors.blue,
    gradientColors: FuturisticGradients.residential,
    options: [
      { id: "1", name: "Report Missed Recycling", price: "Free", schedule: "Response within 48 hours" },
    ],
  },
  "res-missed-yard-waste": {
    title: "Missed Yard Waste",
    description: "Report a missed yard waste collection. Available during seasonal collection periods.",
    icon: "feather",
    color: BrandColors.blue,
    gradientColors: FuturisticGradients.residential,
    options: [
      { id: "1", name: "Report Missed Yard Waste", price: "Free", schedule: "Response within 48 hours" },
    ],
  },
  "res-roll-cart": {
    title: "Roll Cart Request",
    description: "Request a new roll cart, replacement cart, or additional cart for your residential property.",
    icon: "box",
    color: BrandColors.blue,
    gradientColors: FuturisticGradients.residential,
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
    gradientColors: FuturisticGradients.residential,
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
    gradientColors: FuturisticGradients.residential,
    options: [
      { id: "1", name: "Bulk Item Pickup", price: "Contact for pricing", schedule: "By appointment" },
      { id: "2", name: "Special Collection", price: "Contact for pricing", schedule: "By appointment" },
    ],
  },
  "com-missed-trash": {
    title: "Missed Trash Pickup",
    description: "Report a missed trash collection. Please complete all required fields below.",
    icon: "trash-2",
    color: BrandColors.green,
    gradientColors: FuturisticGradients.commercial,
    options: [],
    formQuestions: [
      { question: "Do you have a county issued roll cart?", type: "yesno" },
      { question: "Did the roll cart have excess overflow?", type: "yesno" },
      { question: "Was there anything in the roll cart that was not trash?", type: "text", placeholder: "Describe any non-trash items..." },
      { question: "What time was the roll cart placed at the curb?", type: "time", placeholder: "e.g., 6:00 AM" },
    ],
    additionalInfo: [
      "Would you like to know possible reasons you were missed?",
      "Request Routeware Footage - View footage of collection vehicle at your location",
      "Photo Required - Take Photo or Choose File from your device",
    ],
  },
  "com-missed-recycling": {
    title: "Missed Recycling",
    description: "Report a missed recycling collection. Please complete all required fields below.",
    icon: "refresh-cw",
    color: BrandColors.green,
    gradientColors: FuturisticGradients.commercial,
    options: [],
    formQuestions: [
      { question: "Is there any glass in your roll cart?", type: "yesno" },
      { question: "Is everything inside the cart considered recyclable?", type: "select", options: ["Yes", "No", "Not Sure"] },
      { question: "How many boxes are at the curb?", type: "text", placeholder: "Enter number of boxes..." },
    ],
    additionalInfo: [
      "Would you like to know possible reasons you were missed?",
      "Request Routeware Footage - View footage of collection vehicle at your location",
      "Photo Required - Take Photo or Choose File from your device",
    ],
  },
  "com-missed-yard-waste": {
    title: "Missed Yard Waste",
    description: "Report a missed yard waste collection. Please complete all required fields below.",
    icon: "feather",
    color: BrandColors.green,
    gradientColors: FuturisticGradients.commercial,
    options: [],
    formQuestions: [
      { question: "What type of debris is it?", type: "select", options: ["Leaves", "Grass Clippings", "Branches/Limbs", "Mixed Yard Waste"] },
      { question: "How many bags are at the curb currently?", type: "text", placeholder: "Enter number of bags..." },
      { question: "Are there any dirt in the bags?", type: "yesno" },
      { question: "Are the bags biodegradable?", type: "select", options: ["Yes", "No", "N/A - loose pile"] },
      { question: "Are the tree branches and limbs cut down to 4 feet or less?", type: "select", options: ["Yes", "No", "N/A - no branches"] },
      { question: "What time were items placed at the curb?", type: "time", placeholder: "e.g., 6:00 AM" },
    ],
    additionalInfo: [
      "Would you like to know possible reasons you were missed?",
      "Photo Required - Take Photo or Choose File from your device",
    ],
  },
  "com-roll-cart": {
    title: "Roll Cart Services",
    description: "An annual prorated assessment fee applies when receiving an additional cart. Select the service you need below.",
    icon: "box",
    color: BrandColors.green,
    gradientColors: FuturisticGradients.commercial,
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
    gradientColors: FuturisticGradients.commercial,
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
    gradientColors: FuturisticGradients.commercial,
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
          "3. Property owner authorization or current commercial lease",
          "4. No outstanding sanitation debt associated with property address or applicant",
          "5. Prepayment of dumpster delivery and removal fee of $150 per dumpster, plus first month's collection",
        ],
      },
      {
        title: "Change in Business Ownership",
        content: [
          "When there is a change in business ownership, the incoming owner must:",
          "- Complete a new commercial business application",
          "- Provide all required documentation listed above",
          "- Ensure all prior accounts are closed and settled",
        ],
      },
    ],
    additionalInfo: [
      "Ready to Apply? Visit our office or call for assistance!",
    ],
  },
  "com-payment-options": {
    title: "Commercial Garbage and Recycling Payment Options",
    description: "Choose from multiple convenient ways to pay your commercial sanitation bill.",
    icon: "credit-card",
    color: BrandColors.green,
    gradientColors: FuturisticGradients.commercial,
    options: [],
    contentSections: [
      {
        title: "Online Payments",
        content: [
          "Visit Myaccount.dekalbcountyga.gov",
          "Use the Quick Pay tab for express payment",
          "Email confirmation will be sent upon successful payment",
        ],
      },
      {
        title: "Telephone Payments",
        content: [
          "Call our automated payment line",
          "Have your account number ready",
          "Follow the prompts to complete payment",
        ],
      },
      {
        title: "In-Office Payments",
        content: [
          "Location: 3720 Leroy Scott Drive, Decatur, GA 30032",
          "Hours: Monday - Friday, 9 a.m. - 3 p.m.",
          "Cash, check, money order, and credit/debit cards accepted",
        ],
      },
    ],
    links: [
      { text: "Pay Online Now", url: "https://myaccount.dekalbcountyga.gov" },
    ],
  },
  "com-new-garbage": {
    title: "Establish New Garbage Service",
    description: "Set up new commercial garbage collection service for your business.",
    icon: "plus-square",
    color: BrandColors.green,
    gradientColors: FuturisticGradients.commercial,
    options: [
      { id: "1", name: "2 Yard Dumpster", price: "Contact for pricing", schedule: "Weekly/Bi-weekly" },
      { id: "2", name: "4 Yard Dumpster", price: "Contact for pricing", schedule: "Weekly/Bi-weekly" },
      { id: "3", name: "6 Yard Dumpster", price: "Contact for pricing", schedule: "Weekly/Bi-weekly" },
      { id: "4", name: "8 Yard Dumpster", price: "Contact for pricing", schedule: "Weekly/Bi-weekly" },
    ],
  },
  "com-new-recycle": {
    title: "Establish New Recycle Service",
    description: "Set up new commercial recycling service for your business.",
    icon: "refresh-cw",
    color: BrandColors.green,
    gradientColors: FuturisticGradients.commercial,
    options: [
      { id: "1", name: "Commercial Recycling", price: "Contact for pricing", schedule: "Weekly" },
    ],
  },
  "com-front-load": {
    title: "Front Load Dumpster",
    description: "Front load dumpster service for commercial businesses.",
    icon: "box",
    color: BrandColors.green,
    gradientColors: FuturisticGradients.commercial,
    options: [
      { id: "1", name: "2 Yard Front Load", price: "Contact for pricing", schedule: "Scheduled service" },
      { id: "2", name: "4 Yard Front Load", price: "Contact for pricing", schedule: "Scheduled service" },
      { id: "3", name: "6 Yard Front Load", price: "Contact for pricing", schedule: "Scheduled service" },
      { id: "4", name: "8 Yard Front Load", price: "Contact for pricing", schedule: "Scheduled service" },
    ],
  },
  "com-special-collection": {
    title: "Commercial Special Collection",
    description: "Schedule special commercial pickup for items outside your regular collection schedule.",
    icon: "star",
    color: BrandColors.green,
    gradientColors: FuturisticGradients.commercial,
    options: [
      { id: "1", name: "Special Pickup Request", price: "Contact for quote", schedule: "By appointment" },
    ],
  },
  "com-hand-pick": {
    title: "Commercial Hand-Pick Up",
    description: "Hand-pick up service for commercial businesses with specific collection needs.",
    icon: "clipboard",
    color: BrandColors.green,
    gradientColors: FuturisticGradients.commercial,
    options: [
      { id: "1", name: "Hand-Pick Up Service", price: "Contact for pricing", schedule: "Scheduled service" },
    ],
  },
};

function InteractiveFormQuestion({
  question,
  value,
  onChange,
  color,
  index,
}: {
  question: FormQuestion;
  value: string;
  onChange: (val: string) => void;
  color: string;
  index: number;
}) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleOptionPress = (option: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSequence(withSpring(0.97), withSpring(1));
    onChange(option);
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(200 + index * 80).duration(400).springify()}
      style={[
        styles.formCard,
        { backgroundColor: colors.backgroundSecondary, borderColor: color + "40" },
      ]}
    >
      <View style={styles.formQuestionHeader}>
        <LinearGradient
          colors={[color, color + "CC"]}
          style={styles.formQuestionIcon}
        >
          <Feather name="help-circle" size={18} color="#FFFFFF" />
        </LinearGradient>
        <ThemedText type="body" style={styles.formQuestionText}>
          {question.question}
        </ThemedText>
      </View>

      {question.type === "yesno" ? (
        <View style={styles.yesNoContainer}>
          <AnimatedPressable
            onPress={() => handleOptionPress("Yes")}
            style={[
              styles.yesNoButton,
              animatedStyle,
              {
                backgroundColor: value === "Yes" ? "#00E676" : colors.backgroundDefault,
                borderColor: value === "Yes" ? "#00E676" : colors.cardBorder,
                ...(value === "Yes" ? GlowEffects.neonGreen : {}),
              },
            ]}
          >
            <Feather
              name="check-circle"
              size={22}
              color={value === "Yes" ? "#FFFFFF" : colors.textSecondary}
            />
            <ThemedText
              type="body"
              style={{
                marginLeft: Spacing.sm,
                color: value === "Yes" ? "#FFFFFF" : colors.text,
                fontWeight: value === "Yes" ? "600" : "400",
              }}
            >
              Yes
            </ThemedText>
          </AnimatedPressable>

          <AnimatedPressable
            onPress={() => handleOptionPress("No")}
            style={[
              styles.yesNoButton,
              animatedStyle,
              {
                backgroundColor: value === "No" ? "#FF5252" : colors.backgroundDefault,
                borderColor: value === "No" ? "#FF5252" : colors.cardBorder,
                shadowColor: "#FF5252",
                shadowOpacity: value === "No" ? 0.4 : 0,
                shadowRadius: 12,
                elevation: value === "No" ? 6 : 0,
              },
            ]}
          >
            <Feather
              name="x-circle"
              size={22}
              color={value === "No" ? "#FFFFFF" : colors.textSecondary}
            />
            <ThemedText
              type="body"
              style={{
                marginLeft: Spacing.sm,
                color: value === "No" ? "#FFFFFF" : colors.text,
                fontWeight: value === "No" ? "600" : "400",
              }}
            >
              No
            </ThemedText>
          </AnimatedPressable>
        </View>
      ) : question.type === "select" && question.options ? (
        <View style={styles.selectContainer}>
          {question.options.map((option, idx) => (
            <Pressable
              key={idx}
              onPress={() => handleOptionPress(option)}
              style={[
                styles.selectOption,
                {
                  backgroundColor: value === option ? color : colors.backgroundDefault,
                  borderColor: value === option ? color : colors.cardBorder,
                  shadowColor: color,
                  shadowOpacity: value === option ? 0.3 : 0,
                  shadowRadius: 10,
                  elevation: value === option ? 4 : 0,
                },
              ]}
            >
              <View
                style={[
                  styles.radioOuter,
                  { borderColor: value === option ? "#FFFFFF" : colors.textSecondary },
                ]}
              >
                {value === option ? <View style={styles.radioInner} /> : null}
              </View>
              <ThemedText
                type="body"
                style={{
                  marginLeft: Spacing.sm,
                  color: value === option ? "#FFFFFF" : colors.text,
                  flex: 1,
                }}
              >
                {option}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      ) : (
        <TextInput
          style={[
            styles.textInput,
            {
              backgroundColor: colors.backgroundDefault,
              borderColor: value ? color : colors.cardBorder,
              color: colors.text,
            },
          ]}
          placeholder={question.placeholder || "Enter your answer..."}
          placeholderTextColor={colors.textSecondary}
          value={value}
          onChangeText={onChange}
          multiline={question.type === "text"}
          numberOfLines={question.type === "text" ? 2 : 1}
        />
      )}
    </Animated.View>
  );
}

function ServiceReminder({ color }: { color: string }) {
  const { colors } = useTheme();
  const [reminderIndex, setReminderIndex] = useState(Math.floor(Math.random() * ServiceReminders.length));
  const sparkle = useSharedValue(1);

  useEffect(() => {
    sparkle.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  const sparkleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sparkle.value }],
  }));

  return (
    <Animated.View
      entering={FadeInUp.delay(100).duration(500)}
      style={[styles.reminderCard, { backgroundColor: color + "15", borderColor: color + "40" }]}
    >
      <Animated.View style={sparkleStyle}>
        <Feather name="heart" size={20} color={color} />
      </Animated.View>
      <ThemedText type="small" style={[styles.reminderText, { color: colors.text }]}>
        {ServiceReminders[reminderIndex]}
      </ThemedText>
      <Animated.View style={sparkleStyle}>
        <Feather name="star" size={16} color="#FFD600" />
      </Animated.View>
    </Animated.View>
  );
}

function OptionCard({ option, color, index, gradientColors }: { option: ServiceOption; color: string; index: number; gradientColors: string[] }) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);
  const glowIntensity = useSharedValue(0.2);

  useEffect(() => {
    glowIntensity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 1500 }),
        withTiming(0.2, { duration: 1500 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glowIntensity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  return (
    <Animated.View entering={ZoomIn.delay(200 + index * 60).duration(400).springify()}>
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        style={[
          styles.optionCard,
          animatedStyle,
          glowStyle,
          { backgroundColor: colors.backgroundSecondary, borderColor: color + "40", shadowColor: color },
        ]}
      >
        <View style={styles.optionHeader}>
          <View style={styles.optionInfo}>
            <ThemedText type="h4" style={{ flex: 1 }}>{option.name}</ThemedText>
            <LinearGradient
              colors={gradientColors as [string, string, ...string[]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.priceTag}
            >
              <ThemedText type="h4" style={styles.priceText}>
                {option.price}
              </ThemedText>
            </LinearGradient>
          </View>
        </View>
        {option.size ? (
          <ThemedText type="body" style={{ color: colors.textSecondary, marginTop: Spacing.sm }}>
            {option.size}
          </ThemedText>
        ) : null}
        {option.schedule ? (
          <View style={styles.scheduleRow}>
            <Feather name="calendar" size={16} color={color} />
            <ThemedText type="small" style={{ color: colors.textSecondary, marginLeft: Spacing.xs }}>
              {option.schedule}
            </ThemedText>
          </View>
        ) : null}
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function ServiceDetailScreen() {
  const route = useRoute<ServiceDetailRouteProp>();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { colors } = useTheme();

  const { serviceId } = route.params;
  const service = serviceDetails[serviceId] || {
    title: "Service",
    description: "Service details coming soon.",
    icon: "info" as keyof typeof Feather.glyphMap,
    color: BrandColors.blue,
    gradientColors: FuturisticGradients.residential,
    options: [],
  };

  const [formValues, setFormValues] = useState<Record<string, string>>({});

  const updateFormValue = (questionIndex: number, value: string) => {
    setFormValues((prev) => ({ ...prev, [questionIndex]: value }));
  };

  const isFormService = service.formQuestions && service.formQuestions.length > 0;
  const hasContentSections = service.contentSections && service.contentSections.length > 0;

  const handleSubmit = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: tabBarHeight + Spacing.xl,
          paddingHorizontal: Spacing.lg,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={ZoomIn.delay(100).duration(500).springify()}>
          <LinearGradient
            colors={service.gradientColors as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <View style={styles.iconGlow}>
              <Feather name={service.icon} size={44} color="#FFFFFF" />
            </View>
            <ThemedText type="h2" style={styles.serviceTitle}>
              {service.title}
            </ThemedText>
            <ThemedText type="body" style={styles.serviceDescription}>
              {service.description}
            </ThemedText>
          </LinearGradient>
        </Animated.View>

        <ServiceReminder color={service.color} />

        {isFormService ? (
          <>
            <Animated.View entering={FadeInDown.delay(150).duration(400)}>
              <ThemedText type="h3" style={styles.sectionTitle}>
                Complete Your Request
              </ThemedText>
              <ThemedText type="small" style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                Please fill out all required fields below
              </ThemedText>
            </Animated.View>

            {service.formQuestions?.map((question, index) => (
              <InteractiveFormQuestion
                key={index}
                question={question}
                value={formValues[index] || ""}
                onChange={(val) => updateFormValue(index, val)}
                color={service.color}
                index={index}
              />
            ))}

            {service.additionalInfo ? (
              <Animated.View entering={FadeInDown.delay(500).duration(400)}>
                <View style={[styles.infoCard, { backgroundColor: service.color + "15", borderColor: service.color + "40" }]}>
                  <ThemedText type="h4" style={{ color: service.color, marginBottom: Spacing.md }}>
                    Additional Options
                  </ThemedText>
                  {service.additionalInfo.map((info, index) => (
                    <View key={index} style={styles.infoRow}>
                      <Feather name="check-circle" size={16} color={service.color} />
                      <ThemedText type="body" style={{ flex: 1, marginLeft: Spacing.sm }}>{info}</ThemedText>
                    </View>
                  ))}
                </View>
              </Animated.View>
            ) : null}

            <Animated.View entering={FadeInDown.delay(600).duration(400)}>
              <Pressable onPress={handleSubmit}>
                <LinearGradient
                  colors={service.gradientColors as [string, string, ...string[]]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitButton}
                >
                  <Feather name="send" size={22} color="#FFFFFF" style={{ marginRight: Spacing.sm }} />
                  <ThemedText type="h4" style={styles.submitText}>
                    Submit Request
                  </ThemedText>
                </LinearGradient>
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
                <View style={[styles.contentSection, { backgroundColor: colors.backgroundSecondary, borderColor: service.color + "30" }]}>
                  <View style={styles.contentSectionHeader}>
                    <LinearGradient
                      colors={service.gradientColors as [string, string, ...string[]]}
                      style={styles.contentSectionIcon}
                    >
                      <Feather name="file-text" size={18} color="#FFFFFF" />
                    </LinearGradient>
                    <ThemedText type="h4" style={{ color: service.color, flex: 1 }}>
                      {section.title}
                    </ThemedText>
                  </View>
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
                <View style={[styles.infoCard, { backgroundColor: service.color + "15", borderColor: service.color + "40" }]}>
                  {service.additionalInfo.map((info, index) => (
                    <View key={index} style={styles.infoRow}>
                      <Feather name="info" size={16} color={service.color} />
                      <ThemedText type="body" style={{ flex: 1, marginLeft: Spacing.sm, fontWeight: "600" }}>{info}</ThemedText>
                    </View>
                  ))}
                </View>
              </Animated.View>
            ) : null}
          </>
        ) : null}

        {service.options.length > 0 ? (
          <>
            <Animated.View entering={FadeInDown.delay(150).duration(400)}>
              <ThemedText type="h3" style={styles.sectionTitle}>
                Pricing & Options
              </ThemedText>
            </Animated.View>

            {service.options.map((option, index) => (
              <OptionCard
                key={option.id}
                option={option}
                color={service.color}
                index={index}
                gradientColors={service.gradientColors}
              />
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
                <LinearGradient
                  colors={service.gradientColors as [string, string, ...string[]]}
                  style={styles.linkIcon}
                >
                  <Feather name="external-link" size={16} color="#FFFFFF" />
                </LinearGradient>
                <ThemedText type="body" style={{ color: service.color, flex: 1 }}>{link.text}</ThemedText>
                <Feather name="chevron-right" size={20} color={service.color} />
              </Pressable>
            ))}
          </Animated.View>
        ) : null}

        <Animated.View entering={FadeInDown.delay(700).duration(400)}>
          <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}>
            <LinearGradient
              colors={["#7C4DFF", "#651FFF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.contactButton}
            >
              <Feather name="phone" size={22} color="#FFFFFF" style={{ marginRight: Spacing.sm }} />
              <ThemedText type="h4" style={styles.contactText}>
                Contact Us for Help
              </ThemedText>
            </LinearGradient>
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
  headerGradient: {
    borderRadius: BorderRadius["2xl"],
    padding: Spacing.xl,
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  iconGlow: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  serviceTitle: {
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  serviceDescription: {
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    lineHeight: 24,
  },
  reminderCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1.5,
    gap: Spacing.sm,
  },
  reminderText: {
    flex: 1,
    textAlign: "center",
    fontStyle: "italic",
  },
  sectionTitle: {
    marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    marginBottom: Spacing.lg,
  },
  formCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1.5,
  },
  formQuestionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  formQuestionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  formQuestionText: {
    flex: 1,
    lineHeight: 24,
  },
  yesNoContainer: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  yesNoButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
  },
  selectContainer: {
    gap: Spacing.sm,
  },
  selectOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
  },
  textInput: {
    borderWidth: 2,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    fontSize: 18,
    minHeight: 56,
  },
  infoCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1.5,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  submitButton: {
    flexDirection: "row",
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.xl,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.md,
  },
  submitText: {
    color: "#FFFFFF",
  },
  optionCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1.5,
  },
  optionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  optionInfo: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: Spacing.md,
  },
  priceTag: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  priceText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  scheduleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.md,
  },
  contentSection: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1.5,
  },
  contentSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  contentSectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  contentItem: {
    marginBottom: Spacing.sm,
    paddingLeft: Spacing.sm,
  },
  contentText: {
    lineHeight: 24,
  },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  linkIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  contactButton: {
    flexDirection: "row",
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.xl,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.xl,
  },
  contactText: {
    color: "#FFFFFF",
  },
});
