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

function AnimatedTruckPickup({ delay, y, direction }: { delay: number; y: number; direction: "left" | "right" }) {
  const translateX = useSharedValue(direction === "right" ? -80 : 400);
  const trashScale = useSharedValue(1);

  useEffect(() => {
    const endX = direction === "right" ? 400 : -80;
    const pickupPoint = direction === "right" ? 150 : 200;
    
    translateX.value = withRepeat(
      withSequence(
        withTiming(pickupPoint, { duration: 2000 + delay, easing: Easing.linear }),
        withTiming(pickupPoint, { duration: 800 }),
        withTiming(endX, { duration: 2000 + delay, easing: Easing.linear }),
        withTiming(direction === "right" ? -80 : 400, { duration: 0 })
      ),
      -1,
      false
    );

    trashScale.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000 + delay }),
        withTiming(0, { duration: 400 }),
        withTiming(0, { duration: 2400 + delay }),
        withTiming(1, { duration: 0 })
      ),
      -1,
      false
    );
  }, []);

  const truckStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { scaleX: direction === "left" ? -1 : 1 },
    ],
  }));

  const trashStyle = useAnimatedStyle(() => ({
    transform: [{ scale: trashScale.value }],
    opacity: trashScale.value,
  }));

  const pickupX = direction === "right" ? 150 : 200;

  return (
    <>
      <Animated.View
        style={[
          {
            position: "absolute",
            top: y + 15,
            left: pickupX + 20,
          },
          trashStyle,
        ]}
      >
        <Feather name="trash-2" size={16} color="#4CAF50" />
      </Animated.View>
      <Animated.View
        style={[
          {
            position: "absolute",
            top: y,
            left: 0,
          },
          truckStyle,
        ]}
      >
        <LinearGradient
          colors={["#2E7D32", "#43A047"]}
          style={{
            width: 45,
            height: 26,
            borderRadius: 5,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Feather name="truck" size={18} color="#FFFFFF" />
        </LinearGradient>
      </Animated.View>
    </>
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
        <AnimatedTruckPickup delay={0} y={15} direction="right" />
        <AnimatedTruckPickup delay={1200} y={55} direction="left" />

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
            shadowColor: category.glowColor,
            ...GlowEffects.medium,
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
    navigation.navigate("Main", { screen: "ServicesTab", params: { category: categoryId } });
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
          Choose Your Service
        </ThemedText>
        <ThemedText type="body" style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
          Tap to explore all available options
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
          Quick Actions
        </ThemedText>
      </Animated.View>

      <View style={styles.quickActionsRow}>
        <QuickActionCard
          icon="alert-circle"
          title="Report Issue"
          onPress={handleReportIssue}
          gradientColors={["#FF5252", "#FF1744"]}
          delay={700}
        />
        <QuickActionCard
          icon="calendar"
          title="View Schedule"
          onPress={() => handleCategoryPress("residential")}
          gradientColors={FuturisticGradients.residential}
          delay={750}
        />
      </View>

      <View style={styles.quickActionsRow}>
        <QuickActionCard
          icon="phone"
          title="Contact Us"
          onPress={() => {}}
          gradientColors={["#7C4DFF", "#651FFF"]}
          delay={800}
        />
        <QuickActionCard
          icon="help-circle"
          title="Help & FAQ"
          onPress={() => {}}
          gradientColors={["#FF9100", "#FF6D00"]}
          delay={850}
        />
      </View>

      <Animated.View
        entering={FadeInDown.delay(900).duration(500)}
        style={[styles.helpBanner, { backgroundColor: theme.backgroundSecondary, borderColor: BrandColors.glow + "40" }]}
      >
        <Feather name="phone-call" size={24} color={BrandColors.glow} />
        <View style={styles.helpBannerContent}>
          <ThemedText type="h4">Need Assistance?</ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Our team is here to help you 24/7
          </ThemedText>
        </View>
        <Feather name="chevron-right" size={24} color={theme.textSecondary} />
      </Animated.View>
    </View>
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
