import React, { useState, useEffect } from "react";
import { View, FlatList, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Feather.glyphMap;
  category: "residential" | "commercial";
}

const residentialServices: ServiceItem[] = [
  {
    id: "res-missed-trash",
    title: "Missed Trash Pickup",
    description: "Report a missed trash collection",
    icon: "trash-2",
    category: "residential",
  },
  {
    id: "res-missed-recycling",
    title: "Missed Recycling",
    description: "Report a missed recycling collection",
    icon: "refresh-cw",
    category: "residential",
  },
  {
    id: "res-missed-yard-waste",
    title: "Missed Yard Waste",
    description: "Report a missed yard waste collection",
    icon: "feather",
    category: "residential",
  },
  {
    id: "res-roll-cart",
    title: "Roll Cart Request",
    description: "Request a new or replacement roll cart",
    icon: "box",
    category: "residential",
  },
  {
    id: "res-roll-off",
    title: "Roll Off Requests",
    description: "Request roll off container service",
    icon: "truck",
    category: "residential",
  },
  {
    id: "res-bulk-special",
    title: "Bulk & Special Collection",
    description: "Schedule bulk item or special pickup",
    icon: "package",
    category: "residential",
  },
];

const commercialServices: ServiceItem[] = [
  {
    id: "com-missed-trash",
    title: "Missed Trash Pickup",
    description: "Report a missed commercial trash collection",
    icon: "trash-2",
    category: "commercial",
  },
  {
    id: "com-missed-recycling",
    title: "Missed Recycling",
    description: "Report a missed commercial recycling collection",
    icon: "refresh-cw",
    category: "commercial",
  },
  {
    id: "com-missed-yard-waste",
    title: "Missed Yard Waste",
    description: "Report a missed commercial yard waste collection",
    icon: "feather",
    category: "commercial",
  },
  {
    id: "com-roll-cart",
    title: "Roll Cart Services",
    description: "Commercial roll cart service options",
    icon: "box",
    category: "commercial",
  },
  {
    id: "com-roll-off",
    title: "Roll Off Requests",
    description: "Request commercial roll off container",
    icon: "truck",
    category: "commercial",
  },
  {
    id: "com-new-requirements",
    title: "Requirements for Establishing Commercial Service",
    description: "Learn requirements for new commercial accounts",
    icon: "file-text",
    category: "commercial",
  },
  {
    id: "com-payment-options",
    title: "Payment Options",
    description: "View payment options for commercial services",
    icon: "credit-card",
    category: "commercial",
  },
  {
    id: "com-new-garbage",
    title: "Establish New Garbage Service",
    description: "Set up new commercial garbage collection",
    icon: "plus-square",
    category: "commercial",
  },
  {
    id: "com-new-recycle",
    title: "Establish New Recycle Service",
    description: "Set up new commercial recycling service",
    icon: "refresh-cw",
    category: "commercial",
  },
  {
    id: "com-front-load",
    title: "Front Load Dumpster",
    description: "Front load dumpster rental and service",
    icon: "box",
    category: "commercial",
  },
  {
    id: "com-special-collection",
    title: "Commercial Special Collection",
    description: "Schedule special commercial pickup",
    icon: "star",
    category: "commercial",
  },
  {
    id: "com-hand-pick",
    title: "Commercial Hand-Pick Up",
    description: "Commercial hand-pick up service",
    icon: "clipboard",
    category: "commercial",
  },
];

type CategoryTab = "residential" | "commercial";

function CategoryTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: CategoryTab;
  onTabChange: (tab: CategoryTab) => void;
}) {
  const { theme } = useTheme();

  const tabs: { id: CategoryTab; label: string; gradient: string[]; icon: keyof typeof Feather.glyphMap }[] = [
    { id: "residential", label: "Residential", gradient: FuturisticGradients.residential, icon: "home" },
    { id: "commercial", label: "Commercial", gradient: FuturisticGradients.commercial, icon: "briefcase" },
  ];

  return (
    <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.tabsContainer}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <Pressable
            key={tab.id}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onTabChange(tab.id);
            }}
            style={styles.tabWrapper}
          >
            {isActive ? (
              <LinearGradient
                colors={tab.gradient as [string, string, ...string[]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.tab}
              >
                <Feather name={tab.icon} size={20} color="#FFFFFF" />
                <ThemedText type="h4" style={styles.tabTextActive}>
                  {tab.label}
                </ThemedText>
              </LinearGradient>
            ) : (
              <View
                style={[
                  styles.tab,
                  {
                    backgroundColor: theme.backgroundSecondary,
                    borderColor: theme.cardBorder,
                    borderWidth: 1.5,
                  },
                ]}
              >
                <Feather name={tab.icon} size={20} color={theme.textSecondary} />
                <ThemedText type="h4" style={{ color: theme.text }}>
                  {tab.label}
                </ThemedText>
              </View>
            )}
          </Pressable>
        );
      })}
    </Animated.View>
  );
}

function ServiceReminder({ index }: { index: number }) {
  const { theme } = useTheme();
  const reminderIndex = index % ServiceReminders.length;
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
      entering={FadeInUp.delay(200).duration(500)}
      style={[styles.reminderCard, { backgroundColor: BrandColors.glow + "15", borderColor: BrandColors.glow + "40" }]}
    >
      <Animated.View style={sparkleStyle}>
        <Feather name="heart" size={20} color={BrandColors.green} />
      </Animated.View>
      <ThemedText type="small" style={[styles.reminderText, { color: theme.text }]}>
        {ServiceReminders[reminderIndex]}
      </ThemedText>
      <Animated.View style={sparkleStyle}>
        <Feather name="star" size={16} color="#FFD600" />
      </Animated.View>
    </Animated.View>
  );
}

function ServiceCard({
  item,
  index,
  isResidential,
}: {
  item: ServiceItem;
  index: number;
  isResidential: boolean;
}) {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<ServicesStackParamList>>();
  const scale = useSharedValue(1);
  const glowIntensity = useSharedValue(0.2);

  useEffect(() => {
    glowIntensity.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 1500 }),
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
    scale.value = withSpring(0.94, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("ServiceDetail", {
      serviceId: item.id,
      title: item.title,
    });
  };

  const gradientColors = isResidential
    ? ["#E3F2FD", "#BBDEFB", "#90CAF9"]
    : ["#E8F5E9", "#C8E6C9", "#A5D6A7"];
  const iconGradient = isResidential
    ? FuturisticGradients.residential
    : FuturisticGradients.commercial;
  const glowColor = isResidential ? BrandColors.blue : BrandColors.green;

  return (
    <Animated.View
      entering={ZoomIn.delay(100 + index * 60).duration(400).springify()}
      style={styles.gridItem}
    >
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.serviceCardGrid,
          animatedStyle,
          glowStyle,
          {
            shadowColor: glowColor,
            ...GlowEffects.small,
          },
        ]}
      >
        <LinearGradient
          colors={gradientColors as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          <LinearGradient
            colors={iconGradient as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconContainerGrid}
          >
            <Feather name={item.icon} size={28} color="#FFFFFF" />
          </LinearGradient>
          <ThemedText type="h4" style={styles.cardTitle} numberOfLines={2}>
            {item.title}
          </ThemedText>
          <View style={styles.cardArrow}>
            <Feather name="chevron-right" size={18} color={glowColor} />
          </View>
        </LinearGradient>
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function ServicesScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const route = useRoute<RouteProp<{ params: { category?: string } }, "params">>();

  const initialTab = route.params?.category === "commercial" ? "commercial" : "residential";
  const [activeTab, setActiveTab] = useState<CategoryTab>(initialTab);

  const services = activeTab === "residential" ? residentialServices : commercialServices;
  const sectionGradient = activeTab === "residential"
    ? FuturisticGradients.residential
    : FuturisticGradients.commercial;

  const renderHeader = () => (
    <View>
      <CategoryTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <Animated.View entering={FadeInDown.delay(150).duration(400)}>
        <LinearGradient
          colors={sectionGradient as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.sectionHeader}
        >
          <Feather
            name={activeTab === "residential" ? "home" : "briefcase"}
            size={28}
            color="#FFFFFF"
          />
          <View style={styles.sectionHeaderContent}>
            <ThemedText type="h2" style={styles.sectionTitle}>
              {activeTab === "residential" ? "Residential Services" : "Commercial Services"}
            </ThemedText>
            <ThemedText type="small" style={styles.sectionSubtitle}>
              {activeTab === "residential"
                ? "6 services for your home"
                : "12 services for your business"}
            </ThemedText>
          </View>
        </LinearGradient>
      </Animated.View>

      <ServiceReminder index={activeTab === "residential" ? 0 : 5} />
    </View>
  );

  const renderFooter = () => (
    <Animated.View
      entering={FadeInUp.delay(600).duration(400)}
      style={[styles.helpCard, { backgroundColor: theme.backgroundSecondary, borderColor: theme.cardBorder }]}
    >
      <View style={styles.helpIconWrapper}>
        <LinearGradient
          colors={["#7C4DFF", "#651FFF"]}
          style={styles.helpIcon}
        >
          <Feather name="phone-call" size={24} color="#FFFFFF" />
        </LinearGradient>
      </View>
      <View style={styles.helpContent}>
        <ThemedText type="h4">Need Help Choosing?</ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          Our friendly team is ready to assist you!
        </ThemedText>
      </View>
      <Feather name="chevron-right" size={22} color={theme.textSecondary} />
    </Animated.View>
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: tabBarHeight + Spacing.xl,
          paddingHorizontal: Spacing.lg,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        data={services}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        renderItem={({ item, index }) => (
          <ServiceCard item={item} index={index} isResidential={activeTab === "residential"} />
        )}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabsContainer: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  tabWrapper: {
    flex: 1,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.xl,
    gap: Spacing.sm,
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.md,
    gap: Spacing.lg,
  },
  sectionHeaderContent: {
    flex: 1,
  },
  sectionTitle: {
    color: "#FFFFFF",
    marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    color: "rgba(255,255,255,0.9)",
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
  gridRow: {
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  gridItem: {
    width: "48%",
  },
  serviceCardGrid: {
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
  },
  cardGradient: {
    padding: Spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 160,
  },
  iconContainerGrid: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  cardTitle: {
    textAlign: "center",
    fontSize: 15,
    lineHeight: 20,
  },
  cardArrow: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  helpCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    marginTop: Spacing.lg,
    borderWidth: 1.5,
    gap: Spacing.md,
  },
  helpIconWrapper: {
    shadowColor: "#7C4DFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  helpIcon: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  helpContent: {
    flex: 1,
  },
});
