import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
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
  Easing,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import {
  Spacing,
  BorderRadius,
  BrandColors,
  FuturisticGradients,
  GlowEffects,
  ServiceReminders,
} from "@/constants/theme";
import { AuthStackParamList } from "@/navigation/AuthStackNavigator";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function AnimatedTruckPickup({ delay, startX, y, direction }: { delay: number; startX: number; y: number; direction: "left" | "right" }) {
  const translateX = useSharedValue(direction === "right" ? -80 : 400);
  const trashScale = useSharedValue(1);
  const trashOpacity = useSharedValue(1);

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

    trashOpacity.value = withRepeat(
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
    opacity: trashOpacity.value,
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
        <Feather name="trash-2" size={18} color="#4CAF50" />
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
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <LinearGradient
            colors={["#2E7D32", "#43A047"]}
            style={{
              width: 50,
              height: 30,
              borderRadius: 6,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Feather name="truck" size={20} color="#FFFFFF" />
          </LinearGradient>
        </View>
      </Animated.View>
    </>
  );
}

function AnimatedMascot() {
  const bounce = useSharedValue(0);
  const sparkle = useSharedValue(1);
  const rotate = useSharedValue(0);

  useEffect(() => {
    bounce.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    sparkle.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
    rotate.value = withRepeat(
      withSequence(
        withTiming(5, { duration: 1500 }),
        withTiming(-5, { duration: 1500 })
      ),
      -1,
      true
    );
  }, []);

  const bounceStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounce.value }, { rotate: `${rotate.value}deg` }],
  }));

  const sparkleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sparkle.value }],
  }));

  return (
    <Animated.View
      entering={ZoomIn.delay(400).duration(600).springify()}
      style={styles.mascotContainer}
    >
      <Animated.View style={[styles.mascotSparkle, { left: -15, top: -10 }, sparkleStyle]}>
        <Feather name="star" size={20} color="#4CAF50" />
      </Animated.View>
      <Animated.View style={[styles.mascotSparkle, { right: -12, top: 0 }, sparkleStyle]}>
        <Feather name="star" size={14} color="#1976D2" />
      </Animated.View>
      <Animated.View style={[styles.mascotSparkle, { right: 0, bottom: -5 }, sparkleStyle]}>
        <Feather name="star" size={16} color="#2E7D32" />
      </Animated.View>
      <Animated.View style={bounceStyle}>
        <LinearGradient
          colors={["#2E7D32", "#43A047", "#1565C0"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.mascotGradient}
        >
          <Feather name="truck" size={44} color="#FFFFFF" />
        </LinearGradient>
      </Animated.View>
    </Animated.View>
  );
}

interface FeatureCardProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
  gradientColors: string[];
  delay: number;
}

function FeatureCard({ icon, title, description, gradientColors, delay }: FeatureCardProps) {
  const { theme } = useTheme();
  const glowIntensity = useSharedValue(0.2);

  useEffect(() => {
    glowIntensity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 2000 }),
        withTiming(0.2, { duration: 2000 })
      ),
      -1,
      true
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glowIntensity.value,
  }));

  return (
    <Animated.View
      entering={ZoomIn.delay(delay).duration(500).springify()}
      style={[
        styles.featureCard,
        glowStyle,
        {
          backgroundColor: theme.backgroundSecondary,
          borderColor: gradientColors[0] + "40",
          shadowColor: gradientColors[0],
          ...GlowEffects.small,
        },
      ]}
    >
      <LinearGradient
        colors={gradientColors as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.featureIconContainer}
      >
        <Feather name={icon} size={28} color="#FFFFFF" />
      </LinearGradient>
      <View style={styles.featureContent}>
        <ThemedText type="h4" style={styles.featureTitle}>
          {title}
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {description}
        </ThemedText>
      </View>
    </Animated.View>
  );
}

function ActionButton({
  title,
  onPress,
  gradientColors,
  outlined,
  delay,
}: {
  title: string;
  onPress: () => void;
  gradientColors: string[];
  outlined?: boolean;
  delay: number;
}) {
  const { theme } = useTheme();
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
    shadowOpacity: outlined ? 0 : glowIntensity.value,
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
    <Animated.View entering={FadeInDown.delay(delay).duration(500).springify()}>
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.actionButton,
          animatedStyle,
          glowStyle,
          {
            shadowColor: gradientColors[0],
            ...GlowEffects.medium,
          },
        ]}
      >
        {outlined ? (
          <View
            style={[
              styles.outlinedButton,
              { borderColor: gradientColors[0] },
            ]}
          >
            <ThemedText
              type="h4"
              style={{
                color: gradientColors[0],
                textAlign: "center",
              }}
            >
              {title}
            </ThemedText>
          </View>
        ) : (
          <LinearGradient
            colors={gradientColors as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <ThemedText
              type="h4"
              style={{
                color: "#FFFFFF",
                textAlign: "center",
              }}
            >
              {title}
            </ThemedText>
          </LinearGradient>
        )}
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  const handleCreateAccount = () => {
    navigation.navigate("CreateAccount");
  };

  const handleSignIn = () => {
    navigation.navigate("SignIn");
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <LinearGradient
        colors={FuturisticGradients.hero as unknown as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <AnimatedTruckPickup delay={0} startX={-80} y={30} direction="right" />
        <AnimatedTruckPickup delay={1500} startX={400} y={100} direction="left" />
        <AnimatedTruckPickup delay={3000} startX={-80} y={170} direction="right" />

        <View style={[styles.headerContent, { paddingTop: insets.top + Spacing.xl }]}>
          <Animated.View entering={FadeInUp.delay(100).duration(600)}>
            <Image
              source={require("../../assets/images/icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>
          <Animated.View entering={FadeInUp.delay(200).duration(600)}>
            <ThemedText type="h2" style={styles.welcomeText}>
              Welcome to
            </ThemedText>
            <ThemedText type="h1" style={styles.brandText}>
              DeKalb Sanitation
            </ThemedText>
          </Animated.View>
          <Animated.View entering={FadeInUp.delay(300).duration(600)}>
            <ThemedText type="body" style={styles.tagline}>
              Making our community cleaner and greener, one pickup at a time.
            </ThemedText>
          </Animated.View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <AnimatedMascot />

        <Animated.View entering={FadeInDown.delay(500).duration(500)}>
          <View style={[styles.reminderBanner, { backgroundColor: BrandColors.glow + "15", borderColor: BrandColors.glow + "40" }]}>
            <Feather name="heart" size={18} color={BrandColors.green} />
            <ThemedText type="small" style={[styles.reminderText, { color: theme.text }]}>
              {ServiceReminders[0]}
            </ThemedText>
            <Feather name="star" size={14} color="#FFD600" />
          </View>
        </Animated.View>

        <View style={styles.featuresContainer}>
          <FeatureCard
            icon="truck"
            title="Reliable Pickup"
            description="Regular schedules you can count on"
            gradientColors={FuturisticGradients.residential}
            delay={600}
          />
          <FeatureCard
            icon="refresh-cw"
            title="Green Recycling"
            description="Comprehensive recycling programs"
            gradientColors={FuturisticGradients.commercial}
            delay={700}
          />
          <FeatureCard
            icon="feather"
            title="Yard Waste"
            description="Seasonal yard debris collection"
            gradientColors={["#7C4DFF", "#651FFF", "#B388FF"]}
            delay={800}
          />
        </View>

        <View style={styles.buttonsContainer}>
          <ActionButton
            title="Create Account"
            onPress={handleCreateAccount}
            gradientColors={FuturisticGradients.residential}
            delay={900}
          />
          <ActionButton
            title="Sign In"
            onPress={handleSignIn}
            gradientColors={FuturisticGradients.commercial}
            outlined
            delay={1000}
          />
        </View>

        <Animated.View entering={FadeInDown.delay(1100).duration(500)}>
          <ThemedText
            type="caption"
            style={[styles.footnote, { color: theme.textSecondary }]}
          >
            New users will be asked to provide their name, service address, phone number, and email
          </ThemedText>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingBottom: Spacing["3xl"],
    overflow: "hidden",
  },
  headerContent: {
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    zIndex: 10,
  },
  logo: {
    width: 90,
    height: 90,
    marginBottom: Spacing.lg,
  },
  welcomeText: {
    color: "#FFFFFF",
    textAlign: "center",
    opacity: 0.9,
  },
  brandText: {
    color: "#FFFFFF",
    textAlign: "center",
    marginTop: Spacing.xs,
  },
  tagline: {
    color: "#FFFFFF",
    textAlign: "center",
    marginTop: Spacing.lg,
    opacity: 0.9,
    paddingHorizontal: Spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  mascotContainer: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  mascotGradient: {
    width: 90,
    height: 90,
    borderRadius: 45,
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
    zIndex: 10,
  },
  reminderBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
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
  featuresContainer: {
    gap: Spacing.md,
    marginBottom: Spacing["2xl"],
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1.5,
  },
  featureIconContainer: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.lg,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    marginBottom: Spacing.xs,
  },
  buttonsContainer: {
    gap: Spacing.md,
    marginBottom: Spacing["2xl"],
  },
  actionButton: {
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
  },
  gradientButton: {
    height: Spacing.buttonHeight,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  outlinedButton: {
    height: Spacing.buttonHeight,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
    borderWidth: 2,
    borderRadius: BorderRadius.xl,
    backgroundColor: "transparent",
  },
  footnote: {
    textAlign: "center",
    paddingHorizontal: Spacing.lg,
  },
});
