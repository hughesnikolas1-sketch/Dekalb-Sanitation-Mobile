import React from "react";
import { View, FlatList, StyleSheet, Pressable } from "react-native";
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
import { Spacing, BorderRadius } from "@/constants/theme";
import { ServicesStackParamList } from "@/navigation/ServicesStackNavigator";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
}

const services: ServiceItem[] = [
  {
    id: "schedule",
    title: "Collection Schedule",
    description: "View your weekly pickup calendar",
    icon: "calendar",
    color: "#2D7A3E",
  },
  {
    id: "whatgoeswhere",
    title: "What Goes Where",
    description: "Learn how to sort your waste properly",
    icon: "help-circle",
    color: "#1976D2",
  },
  {
    id: "bulk",
    title: "Bulk Item Pickup",
    description: "Request pickup for large items",
    icon: "package",
    color: "#F57C00",
  },
  {
    id: "holiday",
    title: "Holiday Schedule",
    description: "View schedule changes for holidays",
    icon: "star",
    color: "#7B1FA2",
  },
  {
    id: "special",
    title: "Special Services",
    description: "Electronics, hazardous waste & more",
    icon: "shield",
    color: "#D32F2F",
  },
  {
    id: "guidelines",
    title: "Preparation Guidelines",
    description: "How to prepare waste for collection",
    icon: "check-square",
    color: "#00897B",
  },
];

function ServiceCard({
  item,
  index,
}: {
  item: ServiceItem;
  index: number;
}) {
  const { theme } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<ServicesStackParamList>>();
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

  return (
    <Animated.View entering={FadeInDown.delay(100 + index * 50).duration(400)}>
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
        <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
          <Feather name={item.icon} size={24} color="#FFFFFF" />
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
        <Feather
          name="chevron-right"
          size={20}
          color={theme.textSecondary}
        />
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function ServicesScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

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
        data={services}
        keyExtractor={(item) => item.id}
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
  serviceCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.lg,
  },
  serviceInfo: {
    flex: 1,
  },
});
