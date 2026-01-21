import React, { useEffect } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
  FadeInUp,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, BrandColors } from "@/constants/theme";

const AnimatedView = Animated.createAnimatedComponent(View);

interface LiveAgentBannerProps {
  onPress?: () => void;
}

export function LiveAgentBanner({ onPress }: LiveAgentBannerProps) {
  const { theme } = useTheme();
  const pulse = useSharedValue(1);
  const glow = useSharedValue(0.3);
  const bounce = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
    glow.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1500 }),
        withTiming(0.3, { duration: 1500 })
      ),
      -1,
      true
    );
    bounce.value = withRepeat(
      withSequence(
        withTiming(-3, { duration: 600, easing: Easing.out(Easing.ease) }),
        withTiming(0, { duration: 600, easing: Easing.bounce })
      ),
      -1,
      true
    );
  }, []);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounce.value }, { scale: pulse.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
  }));

  return (
    <Animated.View 
      entering={FadeInUp.delay(300).duration(500)}
      style={styles.container}
    >
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress?.();
        }}
      >
        <LinearGradient
          colors={["#E3F2FD", "#BBDEFB", "#E1F5FE"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.banner}
        >
          <AnimatedView style={[styles.glowCircle, glowStyle]} />
          
          <AnimatedView style={[styles.iconContainer, iconStyle]}>
            <LinearGradient
              colors={[BrandColors.blue, "#1976D2"]}
              style={styles.iconGradient}
            >
              <Feather name="message-circle" size={24} color="#FFFFFF" />
              <View style={styles.onlineDot} />
            </LinearGradient>
          </AnimatedView>

          <View style={styles.textContainer}>
            <ThemedText type="body" style={styles.title}>
              Question about your request? 🤔
            </ThemedText>
            <ThemedText type="small" style={styles.subtitle}>
              Live agent on standby ready to assist! If you get stuck on something, click the live agent button for quick responses! 💬✨
            </ThemedText>
          </View>

          <View style={styles.arrowContainer}>
            <Feather name="chevron-right" size={20} color={BrandColors.blue} />
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderColor: BrandColors.blue + "40",
    overflow: "hidden",
  },
  glowCircle: {
    position: "absolute",
    left: -20,
    top: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: BrandColors.blue,
  },
  iconContainer: {
    marginRight: Spacing.md,
  },
  iconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: BrandColors.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: "700",
    color: "#1565C0",
    marginBottom: 2,
  },
  subtitle: {
    color: "#1976D2",
    lineHeight: 18,
  },
  arrowContainer: {
    marginLeft: Spacing.sm,
  },
});
