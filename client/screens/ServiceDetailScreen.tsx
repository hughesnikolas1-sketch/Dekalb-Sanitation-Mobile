import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { RouteProp, useRoute } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, WasteColors } from "@/constants/theme";
import { ServicesStackParamList } from "@/navigation/ServicesStackNavigator";

type ServiceDetailRouteProp = RouteProp<ServicesStackParamList, "ServiceDetail">;

interface GuidelineItem {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
}

const serviceContent: Record<
  string,
  { intro: string; guidelines: GuidelineItem[] }
> = {
  schedule: {
    intro:
      "Dekalb County provides weekly trash collection and bi-weekly recycling pickup for all residents. Yard waste is collected monthly during spring and fall seasons.",
    guidelines: [
      {
        icon: "calendar",
        title: "Trash Collection",
        description: "Every Tuesday - Place bins curbside by 6:00 AM",
      },
      {
        icon: "refresh-cw",
        title: "Recycling Collection",
        description: "Every other Wednesday - Blue bins only",
      },
      {
        icon: "feather",
        title: "Yard Waste",
        description: "First Thursday monthly - Brown bags or bundled branches",
      },
    ],
  },
  whatgoeswhere: {
    intro:
      "Proper sorting helps our community recycle more effectively and keeps hazardous materials out of landfills.",
    guidelines: [
      {
        icon: "trash-2",
        title: "Regular Trash",
        description:
          "Food waste, plastic bags, styrofoam, diapers, broken ceramics",
      },
      {
        icon: "refresh-cw",
        title: "Recycling",
        description:
          "Clean paper, cardboard, plastic bottles #1-5, aluminum cans, glass",
      },
      {
        icon: "feather",
        title: "Yard Waste",
        description: "Grass clippings, leaves, small branches under 4 feet",
      },
      {
        icon: "alert-triangle",
        title: "Special Disposal",
        description:
          "Batteries, electronics, paint, chemicals - see Special Services",
      },
    ],
  },
  bulk: {
    intro:
      "Large items like furniture, appliances, and mattresses require a special pickup appointment. Schedule at least 48 hours in advance.",
    guidelines: [
      {
        icon: "phone",
        title: "Schedule Pickup",
        description: "Call 404-555-0123 or use the Report Issue feature",
      },
      {
        icon: "box",
        title: "Accepted Items",
        description:
          "Furniture, mattresses, appliances (doors removed), large toys",
      },
      {
        icon: "x-circle",
        title: "Not Accepted",
        description:
          "Construction debris, tires, hazardous materials, auto parts",
      },
    ],
  },
  holiday: {
    intro:
      "Collection schedules may change during major holidays. Check this section before each holiday for updates.",
    guidelines: [
      {
        icon: "star",
        title: "Observed Holidays",
        description:
          "New Year's Day, Memorial Day, July 4th, Labor Day, Thanksgiving, Christmas",
      },
      {
        icon: "arrow-right",
        title: "Holiday Delay",
        description:
          "If holiday falls on your pickup day, collection moves to the next day",
      },
      {
        icon: "bell",
        title: "Notifications",
        description: "Enable alerts in Profile to receive holiday schedule updates",
      },
    ],
  },
  special: {
    intro:
      "Certain materials require special handling and cannot be placed in regular trash or recycling bins.",
    guidelines: [
      {
        icon: "battery",
        title: "Electronics & Batteries",
        description:
          "Drop off at Dekalb Recycling Center, 123 Green Way",
      },
      {
        icon: "droplet",
        title: "Household Chemicals",
        description:
          "Paint, cleaners, pesticides - monthly hazmat collection events",
      },
      {
        icon: "disc",
        title: "Motor Oil & Fluids",
        description:
          "Free drop-off at participating auto parts stores",
      },
      {
        icon: "thermometer",
        title: "Medical Waste",
        description:
          "Sharps containers available at pharmacies and fire stations",
      },
    ],
  },
  guidelines: {
    intro:
      "Following these preparation guidelines ensures efficient collection and keeps our crews safe.",
    guidelines: [
      {
        icon: "clock",
        title: "Timing",
        description: "Place bins at curb by 6:00 AM on collection day",
      },
      {
        icon: "maximize",
        title: "Placement",
        description:
          "Bins 3 feet apart, handles facing street, lid closed",
      },
      {
        icon: "package",
        title: "Bag Requirements",
        description:
          "All trash must be bagged. Maximum bag weight: 50 lbs",
      },
      {
        icon: "sun",
        title: "After Collection",
        description:
          "Remove bins from curb by 8:00 PM on collection day",
      },
    ],
  },
};

function GuidelineCard({
  item,
  index,
}: {
  item: GuidelineItem;
  index: number;
}) {
  const { theme } = useTheme();

  return (
    <Animated.View
      entering={FadeInDown.delay(150 + index * 50).duration(400)}
      style={[styles.guidelineCard, { backgroundColor: theme.backgroundDefault }]}
    >
      <View style={[styles.guidelineIcon, { backgroundColor: theme.primary }]}>
        <Feather name={item.icon} size={20} color="#FFFFFF" />
      </View>
      <View style={styles.guidelineContent}>
        <ThemedText type="h4">{item.title}</ThemedText>
        <ThemedText
          type="small"
          style={{ opacity: 0.7, marginTop: Spacing.xs }}
        >
          {item.description}
        </ThemedText>
      </View>
    </Animated.View>
  );
}

export default function ServiceDetailScreen() {
  const route = useRoute<ServiceDetailRouteProp>();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const { serviceId } = route.params;
  const content = serviceContent[serviceId] || serviceContent.schedule;

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing.xl,
          paddingHorizontal: Spacing.lg,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <ThemedText
            type="body"
            style={[styles.intro, { opacity: 0.8 }]}
          >
            {content.intro}
          </ThemedText>
        </Animated.View>

        <View style={styles.guidelinesContainer}>
          {content.guidelines.map((item, index) => (
            <GuidelineCard key={item.title} item={item} index={index} />
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  intro: {
    marginBottom: Spacing.xl,
    lineHeight: 24,
  },
  guidelinesContainer: {
    gap: Spacing.md,
  },
  guidelineCard: {
    flexDirection: "row",
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
  },
  guidelineIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.lg,
  },
  guidelineContent: {
    flex: 1,
  },
});
