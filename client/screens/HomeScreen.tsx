import React, { useState, useCallback, useEffect } from "react";
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
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  ZoomIn,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { NavigationMenu } from "@/components/NavigationMenu";
import { LiveChatButton } from "@/components/LiveChatButton";
import { LiveAgentBanner } from "@/components/LiveAgentBanner";
import { FloatingParticles } from "@/components/FloatingParticles";
import AnimatedGarbageTrucks from "@/components/AnimatedGarbageTrucks";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import {
  Spacing,
  BorderRadius,
  BrandColors,
  FuturisticGradients,
  GlowEffects,
  ServiceReminders,
} from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ServiceCategory {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Feather.glyphMap;
  gradientColors: string[];
  glowColor: string;
}

const serviceCategories: ServiceCategory[] = [
  {
    id: "residential",
    title: "Residential Services",
    description: "Trash, recycling, and yard waste pickup for your home",
    icon: "home",
    gradientColors: FuturisticGradients.residential,
    glowColor: BrandColors.blue,
  },
  {
    id: "commercial",
    title: "Commercial Services",
    description: "Business and commercial waste management solutions",
    icon: "briefcase",
    gradientColors: FuturisticGradients.commercial,
    glowColor: BrandColors.green,
  },
];

function AnimatedShiningSun({ x, y }: { x: number; y: number }) {
  const rayScale = useSharedValue(1);
  const sunRotate = useSharedValue(0);

  useEffect(() => {
    rayScale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1200 }),
        withTiming(1, { duration: 1200 })
      ),
      -1,
      true
    );
    sunRotate.value = withRepeat(
      withTiming(360, { duration: 15000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const sunStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rayScale.value }, { rotate: `${sunRotate.value}deg` }],
  }));

  return (
    <Animated.View style={[{ position: "absolute", left: x, top: y }, sunStyle]}>
      <ThemedText style={{ fontSize: 28 }}>☀️</ThemedText>
    </Animated.View>
  );
}

function AnimatedRecycleBottle({ y }: { y: number }) {
  const bottleX = useSharedValue(-20);
  const bottleY = useSharedValue(0);
  const bottleScale = useSharedValue(1);

  useEffect(() => {
    bottleX.value = withRepeat(
      withSequence(
        withTiming(40, { duration: 1200, easing: Easing.out(Easing.ease) }),
        withTiming(40, { duration: 400 }),
        withTiming(-20, { duration: 0 })
      ),
      -1,
      false
    );
    bottleY.value = withRepeat(
      withSequence(
        withTiming(-15, { duration: 600 }),
        withTiming(20, { duration: 600 }),
        withTiming(20, { duration: 400 }),
        withTiming(0, { duration: 0 })
      ),
      -1,
      false
    );
    bottleScale.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200 }),
        withTiming(0, { duration: 200 }),
        withTiming(0, { duration: 200 }),
        withTiming(1, { duration: 0 })
      ),
      -1,
      false
    );
  }, []);

  const bottleStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: bottleX.value },
      { translateY: bottleY.value },
      { scale: bottleScale.value },
    ],
  }));

  return (
    <View style={{ position: "absolute", right: 30, top: y }}>
      <View style={{ position: "absolute", left: 40, top: 18 }}>
        <ThemedText style={{ fontSize: 22 }}>♻️</ThemedText>
      </View>
      <Animated.View style={[{ position: "absolute", left: 0, top: 0 }, bottleStyle]}>
        <ThemedText style={{ fontSize: 16 }}>🧴</ThemedText>
      </Animated.View>
    </View>
  );
}

function WelcomeHeader({ userName }: { userName: string }) {
  const { theme } = useTheme();
  const waveRotation = useSharedValue(0);
  const [currentReminder, setCurrentReminder] = useState(0);

  useEffect(() => {
    waveRotation.value = withRepeat(
      withSequence(
        withTiming(15, { duration: 200 }),
        withTiming(-15, { duration: 200 }),
        withTiming(15, { duration: 200 }),
        withTiming(0, { duration: 200 })
      ),
      -1,
      false
    );

    const interval = setInterval(() => {
      setCurrentReminder((prev) => (prev + 1) % ServiceReminders.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const waveStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${waveRotation.value}deg` }],
  }));

  return (
    <Animated.View entering={FadeInDown.delay(100).duration(600).springify()}>
      <LinearGradient
        colors={FuturisticGradients.hero as unknown as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.welcomeGradient}
      >
        <AnimatedShiningSun x={270} y={10} />
        <AnimatedRecycleBottle y={45} />

        <View style={styles.welcomeContent}>
          <View style={styles.welcomeTop}>
            <View>
              <View style={styles.greetingRow}>
                <ThemedText type="body" style={styles.welcomeSubtext}>
                  Welcome back
                </ThemedText>
                <Animated.View style={waveStyle}>
                  <ThemedText style={styles.waveEmoji}>Hello!</ThemedText>
                </Animated.View>
              </View>
              <ThemedText type="h1" style={styles.welcomeName}>
                {userName}
              </ThemedText>
            </View>
            <View style={styles.avatarGlow}>
              <View style={styles.avatarContainer}>
                <Feather name="user" size={28} color="#FFFFFF" />
              </View>
            </View>
          </View>

          <Animated.View
            key={currentReminder}
            entering={FadeInUp.duration(400)}
            style={styles.reminderBanner}
          >
            <Feather name="heart" size={18} color="#00E676" />
            <ThemedText type="small" style={styles.reminderText}>
              {ServiceReminders[currentReminder]}
            </ThemedText>
            <Feather name="star" size={16} color="#FFD600" />
          </Animated.View>
        </View>
      </LinearGradient>
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
  const glowIntensity = useSharedValue(0.3);

  useEffect(() => {
    glowIntensity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 1500 }),
        withTiming(0.3, { duration: 1500 })
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
    scale.value = withSpring(0.96, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <Animated.View entering={ZoomIn.delay(300 + index * 150).duration(500).springify()}>
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.categoryCard,
          animatedStyle,
          glowStyle,
          {
            ...GlowEffects.medium,
            shadowColor: category.glowColor,
          },
        ]}
      >
        <LinearGradient
          colors={category.gradientColors as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.categoryGradient}
        >
          <View style={styles.categoryIconWrapper}>
            <View style={styles.categoryIconGlow}>
              <Feather name={category.icon} size={44} color="#FFFFFF" />
            </View>
          </View>
          <View style={styles.categoryContent}>
            <ThemedText type="h2" style={styles.categoryTitle}>
              {category.title}
            </ThemedText>
            <ThemedText type="body" style={styles.categoryDescription}>
              {category.description}
            </ThemedText>
          </View>
          <View style={styles.categoryArrowContainer}>
            <Feather name="arrow-right" size={28} color="rgba(255,255,255,0.9)" />
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
  gradientColors,
  delay,
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  onPress: () => void;
  gradientColors: string[];
  delay: number;
}) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.94, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(500).springify()} style={{ flex: 1 }}>
      <AnimatedPressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.quickActionCard,
          { backgroundColor: theme.backgroundSecondary, borderColor: theme.cardBorder },
          animatedStyle,
        ]}
      >
        <LinearGradient
          colors={gradientColors as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.quickActionIcon}
        >
          <Feather name={icon} size={26} color="#FFFFFF" />
        </LinearGradient>
        <ThemedText type="h4" style={styles.quickActionTitle}>
          {title}
        </ThemedText>
      </AnimatedPressable>
    </Animated.View>
  );
}

function FriendlyMascot() {
  const bounce = useSharedValue(0);
  const sparkle = useSharedValue(1);

  useEffect(() => {
    bounce.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 600, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    sparkle.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  const bounceStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounce.value }],
  }));

  const sparkleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sparkle.value }],
  }));

  return (
    <Animated.View
      entering={ZoomIn.delay(800).duration(600).springify()}
      style={styles.mascotContainer}
    >
      <LinearGradient
        colors={["#2E7D32", "#43A047", "#1565C0"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.mascotGradient}
      >
        <Animated.View style={[styles.mascotSparkle, { left: -10, top: -5 }, sparkleStyle]}>
          <Feather name="star" size={16} color="#4CAF50" />
        </Animated.View>
        <Animated.View style={[styles.mascotSparkle, { right: -8, top: 5 }, sparkleStyle]}>
          <Feather name="star" size={12} color="#1976D2" />
        </Animated.View>
        <Animated.View style={bounceStyle}>
          <Feather name="truck" size={36} color="#FFFFFF" />
        </Animated.View>
      </LinearGradient>
      <ThemedText type="small" style={styles.mascotText}>
        Ready to help!
      </ThemedText>
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
    (navigation as any).navigate("Main", { screen: "ServicesTab", params: { category: categoryId } });
  }, [navigation]);

  const handleReportIssue = useCallback(() => {
    navigation.navigate("ReportIssue");
  }, [navigation]);

  const userName = user?.firstName || "Guest";

  const renderHeader = () => (
    <View>
      <WelcomeHeader userName={userName} />

      <View style={styles.mascotSection}>
        <FriendlyMascot />
      </View>

      <Animated.View entering={FadeInDown.delay(200).duration(500)}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          🎯 Choose Your Service
        </ThemedText>
        <ThemedText type="body" style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
          Tap to explore all available options ✨
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

      <Animated.View entering={FadeInDown.delay(650).duration(500)}>
        <ThemedText type="h3" style={[styles.sectionTitle, { marginTop: Spacing["2xl"] }]}>
          ⚡ Quick Actions
        </ThemedText>
      </Animated.View>

      <View style={styles.quickActionsRow}>
        <QuickActionCard
          icon="alert-circle"
          title="⚠️ Report Issue"
          onPress={handleReportIssue}
          gradientColors={["#FF5252", "#FF1744"]}
          delay={700}
        />
        <QuickActionCard
          icon="calendar"
          title="📅 View Schedule"
          onPress={() => (navigation as any).navigate("ViewSchedule")}
          gradientColors={FuturisticGradients.residential}
          delay={750}
        />
      </View>

      <View style={styles.quickActionsRow}>
        <QuickActionCard
          icon="help-circle"
          title="❓ Help & FAQ"
          onPress={() => (navigation as any).navigate("HelpFAQ")}
          gradientColors={["#FF9100", "#FF6D00"]}
          delay={800}
        />
        <QuickActionCard
          icon="heart"
          title="♿ Disabled Services"
          onPress={() => (navigation as any).navigate("DisabledService")}
          gradientColors={["#9C27B0", "#7B1FA2"]}
          delay={850}
        />
      </View>

      <LiveAgentBanner />
    </View>
  );

  const handleMenuNavigate = useCallback((screen: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const screenMap: Record<string, string> = {
      addresses: "MyAddresses",
      requests: "MyRequests",
      billing: "Billing",
      issues: "ReportIssue",
      rate: "RateExperience",
    };
    const targetScreen = screenMap[screen];
    if (targetScreen) {
      (navigation as any).navigate(targetScreen);
    }
  }, [navigation]);

  return (
    <ThemedView style={styles.container}>
      <AnimatedGarbageTrucks height={45} />
      <FloatingParticles count={12} />
      <NavigationMenu onNavigate={handleMenuNavigate} />
      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: tabBarHeight + Spacing.xl,
          paddingHorizontal: Spacing.lg,
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
      <LiveChatButton />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  welcomeGradient: {
    borderRadius: BorderRadius["2xl"],
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    overflow: "hidden",
    minHeight: 180,
  },
  welcomeContent: {
    zIndex: 10,
  },
  welcomeTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  welcomeSubtext: {
    color: "rgba(255,255,255,0.85)",
  },
  waveEmoji: {
    fontSize: 16,
    color: "#FFD600",
  },
  welcomeName: {
    color: "#FFFFFF",
    marginTop: Spacing.xs,
  },
  avatarGlow: {
    shadowColor: "#00E5FF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 8,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
  },
  reminderBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  reminderText: {
    flex: 1,
    color: "#FFFFFF",
    textAlign: "center",
  },
  mascotSection: {
    alignItems: "center",
    marginVertical: Spacing.md,
  },
  mascotContainer: {
    alignItems: "center",
  },
  mascotGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#00E676",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  mascotSparkle: {
    position: "absolute",
  },
  mascotText: {
    marginTop: Spacing.sm,
    fontWeight: "600",
  },
  sectionTitle: {
    marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    marginBottom: Spacing.lg,
  },
  categoryCard: {
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.lg,
    overflow: "hidden",
  },
  categoryGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.xl,
    minHeight: 140,
  },
  categoryIconWrapper: {
    marginRight: Spacing.lg,
  },
  categoryIconGlow: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.xl,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  categoryContent: {
    flex: 1,
  },
  categoryTitle: {
    color: "#FFFFFF",
    marginBottom: Spacing.xs,
  },
  categoryDescription: {
    color: "rgba(255,255,255,0.9)",
    lineHeight: 24,
  },
  categoryArrowContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  quickActionCard: {
    alignItems: "center",
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  quickActionTitle: {
    textAlign: "center",
  },
  helpBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    marginTop: Spacing.lg,
    borderWidth: 1.5,
    gap: Spacing.md,
  },
  helpBannerContent: {
    flex: 1,
  },
});
