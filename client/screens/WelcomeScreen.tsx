import React from "react";
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
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, BrandColors, Typography } from "@/constants/theme";
import { AuthStackParamList } from "@/navigation/AuthStackNavigator";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface FeatureCardProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
  color: string;
  delay: number;
}

function FeatureCard({ icon, title, description, color, delay }: FeatureCardProps) {
  const { theme } = useTheme();

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(500)}
      style={[styles.featureCard, { backgroundColor: theme.backgroundDefault }]}
    >
      <View style={[styles.featureIconContainer, { backgroundColor: color }]}>
        <Feather name={icon} size={28} color="#FFFFFF" />
      </View>
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
  variant,
  delay,
}: {
  title: string;
  onPress: () => void;
  variant: "primary" | "secondary";
  delay: number;
}) {
  const { theme } = useTheme();
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

  const isPrimary = variant === "primary";

  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(500)}>
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.actionButton,
          animatedStyle,
          isPrimary
            ? { backgroundColor: BrandColors.blue }
            : {
                backgroundColor: "transparent",
                borderWidth: 2,
                borderColor: BrandColors.green,
              },
        ]}
      >
        <ThemedText
          type="button"
          style={{
            color: isPrimary ? "#FFFFFF" : BrandColors.green,
            textAlign: "center",
          }}
        >
          {title}
        </ThemedText>
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
        colors={[BrandColors.blue, BrandColors.green]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
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
        <Animated.View entering={FadeInDown.delay(400).duration(500)}>
          <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
            Manage your services easily from anywhere
          </ThemedText>
        </Animated.View>

        <View style={styles.featuresContainer}>
          <FeatureCard
            icon="truck"
            title="Reliable Pickup"
            description="Regular schedules you can count on"
            color={BrandColors.blue}
            delay={500}
          />
          <FeatureCard
            icon="refresh-cw"
            title="Green Recycling"
            description="Comprehensive recycling programs"
            color={BrandColors.green}
            delay={600}
          />
          <FeatureCard
            icon="feather"
            title="Yard Waste"
            description="Seasonal yard debris collection"
            color={BrandColors.greenDark}
            delay={700}
          />
        </View>

        <View style={styles.buttonsContainer}>
          <ActionButton
            title="Create Account"
            onPress={handleCreateAccount}
            variant="primary"
            delay={800}
          />
          <ActionButton
            title="Sign In"
            onPress={handleSignIn}
            variant="secondary"
            delay={900}
          />
        </View>

        <Animated.View entering={FadeInDown.delay(1000).duration(500)}>
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
  },
  headerContent: {
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  logo: {
    width: 80,
    height: 80,
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
    paddingTop: Spacing["2xl"],
  },
  subtitle: {
    textAlign: "center",
    marginBottom: Spacing["2xl"],
  },
  featuresContainer: {
    gap: Spacing.lg,
    marginBottom: Spacing["3xl"],
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
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
    gap: Spacing.lg,
    marginBottom: Spacing["2xl"],
  },
  actionButton: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  footnote: {
    textAlign: "center",
    paddingHorizontal: Spacing.lg,
  },
});
