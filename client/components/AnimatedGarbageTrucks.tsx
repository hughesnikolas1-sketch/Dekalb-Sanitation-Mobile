import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
  interpolate,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { BrandColors } from "@/constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface TruckProps {
  delay: number;
  duration: number;
  topOffset: number;
  size: number;
  opacity: number;
}

const GarbageTruck = ({ delay, duration, topOffset, size, opacity }: TruckProps) => {
  const position = useSharedValue(-size * 2);
  
  useEffect(() => {
    position.value = withDelay(
      delay,
      withRepeat(
        withTiming(SCREEN_WIDTH + size * 2, {
          duration,
          easing: Easing.linear,
        }),
        -1,
        false
      )
    );
  }, [delay, duration, size]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: position.value }],
  }));

  return (
    <Animated.View style={[styles.truck, { top: topOffset, opacity }, animatedStyle]}>
      <View style={[styles.truckBody, { width: size, height: size * 0.6 }]}>
        <Feather name="truck" size={size} color={BrandColors.green} />
      </View>
    </Animated.View>
  );
};

interface TrashItemProps {
  delay: number;
  left: number;
  topOffset: number;
}

const TrashItem = ({ delay, left, topOffset }: TrashItemProps) => {
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  useEffect(() => {
    // Animate trash disappearing and reappearing
    opacity.value = withDelay(
      delay,
      withRepeat(
        withTiming(0, { duration: 500, easing: Easing.out(Easing.ease) }),
        -1,
        true
      )
    );
    scale.value = withDelay(
      delay,
      withRepeat(
        withTiming(0.5, { duration: 500, easing: Easing.out(Easing.ease) }),
        -1,
        true
      )
    );
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.trash, { left, top: topOffset }, animatedStyle]}>
      <Feather name="trash-2" size={12} color={BrandColors.blue} />
    </Animated.View>
  );
};

interface AnimatedGarbageTrucksProps {
  height?: number;
}

export default function AnimatedGarbageTrucks({ height = 50 }: AnimatedGarbageTrucksProps) {
  const trucks: TruckProps[] = [
    { delay: 0, duration: 8000, topOffset: 5, size: 20, opacity: 0.7 },
    { delay: 2000, duration: 10000, topOffset: 25, size: 16, opacity: 0.5 },
    { delay: 4000, duration: 7000, topOffset: 15, size: 18, opacity: 0.6 },
    { delay: 6000, duration: 9000, topOffset: 30, size: 14, opacity: 0.4 },
  ];

  const trashItems: TrashItemProps[] = [
    { delay: 1000, left: SCREEN_WIDTH * 0.15, topOffset: 10 },
    { delay: 3000, left: SCREEN_WIDTH * 0.35, topOffset: 25 },
    { delay: 5000, left: SCREEN_WIDTH * 0.55, topOffset: 8 },
    { delay: 7000, left: SCREEN_WIDTH * 0.75, topOffset: 20 },
    { delay: 2500, left: SCREEN_WIDTH * 0.45, topOffset: 32 },
    { delay: 4500, left: SCREEN_WIDTH * 0.65, topOffset: 15 },
  ];

  return (
    <View style={[styles.container, { height }]} pointerEvents="none">
      {trashItems.map((trash, index) => (
        <TrashItem key={`trash-${index}`} {...trash} />
      ))}
      {trucks.map((truck, index) => (
        <GarbageTruck key={`truck-${index}`} {...truck} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
    zIndex: 10,
  },
  truck: {
    position: "absolute",
    left: 0,
  },
  truckBody: {
    justifyContent: "center",
    alignItems: "center",
  },
  trash: {
    position: "absolute",
  },
});
