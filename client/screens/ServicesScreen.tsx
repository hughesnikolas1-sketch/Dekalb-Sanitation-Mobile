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
  {
    id: "trash-pickup",
    title: "Trash Pickup",
    description: "Weekly curbside trash collection service",
    icon: "trash-2",
    category: "residential",
  },
  {
    id: "recycling",
    title: "Recycling",
    description: "Bi-weekly recycling pickup for paper, plastic, and more",
    icon: "refresh-cw",
    category: "residential",
  },
  {
    id: "yard-waste",
    title: "Yard Waste",
    description: "Seasonal collection of leaves, branches, and debris",
    icon: "feather",
    category: "residential",
  },
  {
    id: "bulk-pickup",
    title: "Bulk Item Pickup",
    description: "Schedule pickup for large items like furniture",
    icon: "package",
    category: "residential",
  },
  {
    id: "holiday-schedule",
    title: "Holiday Schedule",
    description: "View pickup schedule changes during holidays",
    icon: "calendar",
    category: "residential",
  },
  {
    id: "dumpster-rental",
    title: "Dumpster Rental",
    description: "Temporary dumpster rental for businesses",
    icon: "box",
    category: "commercial",
  },
  {
    id: "scheduled-pickup",
    title: "Scheduled Pickup",
    description: "Regular commercial waste collection",
    icon: "clock",
    category: "commercial",
  },
  {
    id: "recycling-program",
    title: "Recycling Program",
    description: "Commercial recycling solutions",
    icon: "refresh-cw",
    category: "commercial",
  },
  {
    id: "compactor-service",
    title: "Compactor Service",
    description: "Waste compactor rental and service",
    icon: "minimize-2",
    category: "commercial",
  },
  {
    id: "construction-waste",
    title: "Construction Waste",
    description: "Debris removal for construction sites",
    icon: "tool",
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
    scale.value = withSpring(0.98, { damping: 15, stiffness: 150 });
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

  const iconColor = item.category === "residential" ? BrandColors.blue : BrandColors.green;

  return (
    <Animated.View entering={FadeInDown.delay(150 + index * 50).duration(400)}>
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.serviceCard,
          { backgroundColor: theme.backgroundDefault },
          animatedStyle,
        ]}
      >
        <View style={[styles.iconContainer, { backgroundColor: iconColor }]}>
          <Feather name={item.icon} size={26} color="#FFFFFF" />
        </View>
        <View style={styles.serviceInfo}>
          <ThemedText type="h4">{item.title}</ThemedText>
          <ThemedText
            type="small"
            style={{ opacity: 0.7, marginTop: Spacing.xs }}
          >
            {item.description}
          </ThemedText>
        </View>
        <Feather name="chevron-right" size={24} color={theme.textSecondary} />
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
          paddingHorizontal: Spacing.xl,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        data={filteredServices}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
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
  },
  serviceCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.lg,
  },
  serviceInfo: {
    flex: 1,
  },
});
