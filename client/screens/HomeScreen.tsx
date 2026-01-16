import React, { useState, useCallback } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
import { useAuth } from "@/hooks/useAuth";
import { Spacing, BorderRadius, BrandColors } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ServiceCategory {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
  gradientColors: [string, string];
}

const serviceCategories: ServiceCategory[] = [
  {
    id: "residential",
    title: "Residential Services",
    description: "Trash, recycling, and yard waste pickup for homes",
    icon: "home",
    color: BrandColors.blue,
    gradientColors: [BrandColors.blue, BrandColors.blueDark],
  },
  {
    id: "commercial",
    title: "Commercial Services",
    description: "Business and commercial waste management solutions",
    icon: "briefcase",
    color: BrandColors.green,
    gradientColors: [BrandColors.green, BrandColors.greenDark],
  },
];

function WelcomeHeader({ userName }: { userName: string }) {
  const { theme } = useTheme();

  return (
    <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.welcomeHeader}>
      <View>
        <ThemedText type="body" style={{ color: theme.textSecondary }}>
          Welcome back,
        </ThemedText>
        <ThemedText type="h2">{userName}</ThemedText>
      </View>
      <View style={[styles.avatarContainer, { backgroundColor: BrandColors.blue }]}>
        <Feather name="user" size={24} color="#FFFFFF" />
      </View>
    </Animated.View>
  );
}

function ServiceCategoryCard({
  category,
  index,
  onPress,
}: {
  category: ServiceCategory;
  index: number;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <Animated.View entering={FadeInDown.delay(200 + index * 100).duration(500)}>
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.categoryCard, animatedStyle]}
      >
        <LinearGradient
          colors={category.gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.categoryGradient}
        >
          <View style={styles.categoryIconContainer}>
            <Feather name={category.icon} size={40} color="#FFFFFF" />
          </View>
          <View style={styles.categoryContent}>
            <ThemedText type="h3" style={styles.categoryTitle}>
              {category.title}
            </ThemedText>
            <ThemedText type="body" style={styles.categoryDescription}>
              {category.description}
            </ThemedText>
          </View>
          <View style={styles.categoryArrow}>
            <Feather name="chevron-right" size={28} color="rgba(255,255,255,0.8)" />
          </View>
        </LinearGradient>
      </AnimatedPressable>
    </Animated.View>
  );
}

function QuickActionCard({
  icon,
  title,
  onPress,
  color,
  delay,
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  onPress: () => void;
  color: string;
  delay: number;
}) {
  const { theme } = useTheme();
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

  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(500)} style={{ flex: 1 }}>
      <AnimatedPressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.quickActionCard,
          { backgroundColor: theme.backgroundDefault },
          animatedStyle,
        ]}
      >
        <View style={[styles.quickActionIcon, { backgroundColor: color }]}>
          <Feather name={icon} size={24} color="#FFFFFF" />
        </View>
        <ThemedText type="h4" style={styles.quickActionTitle}>
          {title}
        </ThemedText>
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  }, []);

  const handleCategoryPress = useCallback((categoryId: string) => {
    navigation.navigate("Main", { screen: "ServicesTab", params: { category: categoryId } });
  }, [navigation]);

  const handleReportIssue = useCallback(() => {
    navigation.navigate("ReportIssue");
  }, [navigation]);

  const userName = user?.firstName || "Guest";

  const renderHeader = () => (
    <View>
      <WelcomeHeader userName={userName} />

      <Animated.View entering={FadeInDown.delay(150).duration(500)}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Our Services
        </ThemedText>
      </Animated.View>

      {serviceCategories.map((category, index) => (
        <ServiceCategoryCard
          key={category.id}
          category={category}
          index={index}
          onPress={() => handleCategoryPress(category.id)}
        />
      ))}

      <Animated.View entering={FadeInDown.delay(450).duration(500)}>
        <ThemedText type="h3" style={[styles.sectionTitle, { marginTop: Spacing["2xl"] }]}>
          Quick Actions
        </ThemedText>
      </Animated.View>

      <View style={styles.quickActionsRow}>
        <QuickActionCard
          icon="alert-circle"
          title="Report Issue"
          onPress={handleReportIssue}
          color={BrandColors.blue}
          delay={500}
        />
        <QuickActionCard
          icon="calendar"
          title="View Schedule"
          onPress={() => handleCategoryPress("residential")}
          color={BrandColors.green}
          delay={550}
        />
      </View>

      <View style={styles.quickActionsRow}>
        <QuickActionCard
          icon="phone"
          title="Contact Us"
          onPress={() => {}}
          color="#7B1FA2"
          delay={600}
        />
        <QuickActionCard
          icon="help-circle"
          title="Help & FAQ"
          onPress={() => {}}
          color="#F57C00"
          delay={650}
        />
      </View>
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
        data={[]}
        keyExtractor={() => "header"}
        ListHeaderComponent={renderHeader}
        renderItem={null}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  welcomeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  avatarContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  categoryCard: {
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.lg,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  categoryGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.xl,
    minHeight: 120,
  },
  categoryIconContainer: {
    width: 70,
    height: 70,
    borderRadius: BorderRadius.lg,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.lg,
  },
  categoryContent: {
    flex: 1,
  },
  categoryTitle: {
    color: "#FFFFFF",
    marginBottom: Spacing.xs,
  },
  categoryDescription: {
    color: "rgba(255,255,255,0.85)",
  },
  categoryArrow: {
    marginLeft: Spacing.sm,
  },
  quickActionsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  quickActionCard: {
    alignItems: "center",
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  quickActionTitle: {
    textAlign: "center",
  },
});
