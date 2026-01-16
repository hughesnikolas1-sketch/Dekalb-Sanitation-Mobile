import React, { useState } from "react";
import { View, FlatList, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
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
import { Spacing, BorderRadius, BrandColors } from "@/constants/theme";
import { ServicesStackParamList } from "@/navigation/ServicesStackNavigator";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Feather.glyphMap;
  category: "residential" | "commercial";
}

const allServices: ServiceItem[] = [
  // Residential Services
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
  // Commercial Services
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
    title: "Roll Cart Request",
    description: "Request commercial roll cart service",
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
    title: "Requirements for Establishing New Commercial",
    description: "Learn requirements for new commercial accounts",
    icon: "file-text",
    category: "commercial",
  },
  {
    id: "com-payment-options",
    title: "Commercial Garbage and Recycling Payment Options",
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
    icon: "hand",
    category: "commercial",
  },
];

type CategoryTab = "all" | "residential" | "commercial";

function CategoryTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: CategoryTab;
  onTabChange: (tab: CategoryTab) => void;
}) {
  const { theme } = useTheme();

  const tabs: { id: CategoryTab; label: string }[] = [
    { id: "all", label: "All" },
    { id: "residential", label: "Residential" },
    { id: "commercial", label: "Commercial" },
  ];

  return (
    <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.tabsContainer}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <Pressable
            key={tab.id}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onTabChange(tab.id);
            }}
            style={[
              styles.tab,
              {
                backgroundColor: isActive ? BrandColors.blue : theme.backgroundDefault,
                borderColor: isActive ? BrandColors.blue : theme.divider,
              },
            ]}
          >
            <ThemedText
              type="h4"
              style={{
                color: isActive ? "#FFFFFF" : theme.text,
              }}
            >
              {tab.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </Animated.View>
  );
}

function ServiceCard({
  item,
  index,
}: {
  item: ServiceItem;
  index: number;
}) {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<ServicesStackParamList>>();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 150 });
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

  const isResidential = item.category === "residential";
  const cardBgColor = isResidential ? "#E3F2FD" : "#E8F5E9";
  const iconBgColor = isResidential ? BrandColors.blue : BrandColors.green;
  const borderColor = isResidential ? "#90CAF9" : "#A5D6A7";

  return (
    <Animated.View 
      entering={FadeInDown.delay(100 + index * 40).duration(400)}
      style={styles.gridItem}
    >
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.serviceCardGrid,
          { 
            backgroundColor: cardBgColor,
            borderColor: borderColor,
          },
          animatedStyle,
        ]}
      >
        <View style={[styles.iconContainerGrid, { backgroundColor: iconBgColor }]}>
          <Feather name={item.icon} size={28} color="#FFFFFF" />
        </View>
        <ThemedText type="h4" style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </ThemedText>
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function ServicesScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const [activeTab, setActiveTab] = useState<CategoryTab>("all");

  const filteredServices = activeTab === "all"
    ? allServices
    : allServices.filter((s) => s.category === activeTab);

  const renderHeader = () => (
    <View>
      <CategoryTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <Animated.View entering={FadeInDown.delay(120).duration(400)}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          {activeTab === "all"
            ? "All Services"
            : activeTab === "residential"
            ? "Residential Services"
            : "Commercial Services"}
        </ThemedText>
      </Animated.View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing.xl,
          paddingHorizontal: Spacing.lg,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        data={filteredServices}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        renderItem={({ item, index }) => (
          <ServiceCard item={item} index={index} />
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
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    borderWidth: 1,
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.xs,
  },
  gridRow: {
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  gridItem: {
    width: "48%",
  },
  serviceCardGrid: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 140,
    borderWidth: 1.5,
  },
  iconContainerGrid: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  cardTitle: {
    textAlign: "center",
    fontSize: 15,
    lineHeight: 20,
  },
});
