import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from "react-native-reanimated";
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";
import { BrandColors } from "@/constants/theme";

const AnimatedView = Animated.createAnimatedComponent(View);

interface DCLogoProps {
  size?: number;
  animate?: boolean;
  celebrating?: boolean;
}

export function DCLogo({ size = 60, animate = false, celebrating = false }: DCLogoProps) {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const bounce = useSharedValue(0);
  const glow = useSharedValue(0);

  useEffect(() => {
    if (celebrating) {
      scale.value = withSequence(
        withSpring(1.3, { damping: 3, stiffness: 200 }),
        withSpring(1, { damping: 5 })
      );
      rotation.value = withSequence(
        withTiming(-15, { duration: 100 }),
        withTiming(15, { duration: 100 }),
        withTiming(-10, { duration: 100 }),
        withTiming(10, { duration: 100 }),
        withTiming(0, { duration: 100 })
      );
      bounce.value = withSequence(
        withTiming(-20, { duration: 150 }),
        withSpring(0, { damping: 4 })
      );
      glow.value = withSequence(
        withTiming(1, { duration: 200 }),
        withDelay(300, withTiming(0, { duration: 400 }))
      );
    }
  }, [celebrating]);

  useEffect(() => {
    if (animate) {
      bounce.value = withRepeat(
        withSequence(
          withTiming(-8, { duration: 400, easing: Easing.out(Easing.ease) }),
          withTiming(0, { duration: 400, easing: Easing.in(Easing.ease) })
        ),
        -1,
        false
      );
      glow.value = withRepeat(
        withSequence(
          withTiming(0.5, { duration: 1000 }),
          withTiming(0, { duration: 1000 })
        ),
        -1,
        false
      );
    }
  }, [animate]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
      { translateY: bounce.value },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glow.value, [0, 1], [0, 0.8]),
    transform: [{ scale: interpolate(glow.value, [0, 1], [1, 1.5]) }],
  }));

  return (
    <AnimatedView style={[styles.container, { width: size, height: size }, animatedStyle]}>
      <AnimatedView style={[styles.glow, { width: size * 1.5, height: size * 1.5 }, glowStyle]} />
      <View style={[styles.logoContainer, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#1E88E5" />
              <Stop offset="50%" stopColor={BrandColors.blue} />
              <Stop offset="100%" stopColor="#0D47A1" />
            </LinearGradient>
            <LinearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#43A047" />
              <Stop offset="50%" stopColor={BrandColors.green} />
              <Stop offset="100%" stopColor="#1B5E20" />
            </LinearGradient>
          </Defs>
          <Path
            d="M15 15 L15 85 Q15 90 20 90 L45 90 Q70 90 70 65 L70 40 Q70 15 45 15 L20 15 Q15 15 15 20 Z M30 30 L40 30 Q50 30 50 45 L50 60 Q50 75 40 75 L30 75 Z"
            fill="url(#blueGrad)"
          />
          <Path
            d="M85 30 Q85 15 70 15 L55 15 Q45 15 45 25 L45 35 Q55 25 70 35 Q85 45 85 60 L85 75 Q85 90 70 90 L55 90 Q45 90 45 80 L45 70 Q55 80 70 70 Q85 60 85 45 Z"
            fill="url(#greenGrad)"
          />
        </Svg>
      </View>
    </AnimatedView>
  );
}

export function SelectionCelebration({ visible }: { visible: boolean }) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);

  useEffect(() => {
    if (visible) {
      opacity.value = withSequence(
        withTiming(1, { duration: 200 }),
        withDelay(800, withTiming(0, { duration: 300 }))
      );
      scale.value = withSequence(
        withSpring(1.2, { damping: 4 }),
        withDelay(600, withTiming(0.5, { duration: 200 }))
      );
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  if (!visible) return null;

  return (
    <AnimatedView style={[styles.celebration, animatedStyle]}>
      <DCLogo size={80} celebrating={true} />
    </AnimatedView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  glow: {
    position: "absolute",
    borderRadius: 100,
    backgroundColor: "rgba(30, 136, 229, 0.3)",
  },
  celebration: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -40,
    marginTop: -40,
    zIndex: 1000,
  },
});
