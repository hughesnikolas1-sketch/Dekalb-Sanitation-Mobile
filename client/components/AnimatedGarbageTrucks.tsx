import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  interpolate,
  ReduceMotion,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { BrandColors } from "@/constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface TruckProps {
  color: string;
  size: number;
  startDelay: number;
  duration: number;
  direction: "left" | "right";
  yPosition: number;
}

const AnimatedTruck = ({ color, size, startDelay, duration, direction, yPosition }: TruckProps) => {
  const position = useSharedValue(direction === "left" ? SCREEN_WIDTH + 100 : -100);
  const wheelRotation = useSharedValue(0);
  const bounce = useSharedValue(0);
  const exhaustPuff = useSharedValue(0);

  useEffect(() => {
    const startPos = direction === "left" ? SCREEN_WIDTH + 100 : -100;
    const endPos = direction === "left" ? -100 : SCREEN_WIDTH + 100;

    position.value = withDelay(
      startDelay,
      withRepeat(
        withSequence(
          withTiming(startPos, { duration: 0 }),
          withTiming(endPos, {
            duration: duration,
            easing: Easing.linear,
          })
        ),
        -1,
        false,
        undefined,
        ReduceMotion.Never
      )
    );

    wheelRotation.value = withRepeat(
      withTiming(360, {
        duration: 400,
        easing: Easing.linear,
      }),
      -1,
      false,
      undefined,
      ReduceMotion.Never
    );

    bounce.value = withRepeat(
      withSequence(
        withTiming(-2, { duration: 100 }),
        withTiming(0, { duration: 100 })
      ),
      -1,
      false,
      undefined,
      ReduceMotion.Never
    );

    exhaustPuff.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0, { duration: 200 })
      ),
      -1,
      false,
      undefined,
      ReduceMotion.Never
    );
  }, []);

  const truckStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: position.value },
      { translateY: bounce.value },
      { scaleX: direction === "left" ? -1 : 1 },
    ],
  }));

  const wheelStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${wheelRotation.value}deg` }],
  }));

  const exhaustStyle = useAnimatedStyle(() => ({
    opacity: interpolate(exhaustPuff.value, [0, 1], [0.3, 0.8]),
    transform: [
      { scale: interpolate(exhaustPuff.value, [0, 1], [0.6, 1.3]) },
    ],
  }));

  const truckWidth = size * 2.5;
  const truckHeight = size * 1.2;
  const wheelSize = size * 0.4;

  return (
    <Animated.View style={[styles.truckContainer, { top: yPosition }, truckStyle]}>
      <Animated.View style={[styles.exhaust, { left: direction === "left" ? truckWidth - 5 : -12 }, exhaustStyle]}>
        <View style={[styles.exhaustPuff, { backgroundColor: "#888", width: size * 0.35, height: size * 0.35, borderRadius: size * 0.175 }]} />
        <View style={[styles.exhaustPuff2, { backgroundColor: "#AAA", width: size * 0.25, height: size * 0.25, borderRadius: size * 0.125 }]} />
      </Animated.View>
      
      <View style={styles.truckBody}>
        <View style={[styles.truckBack, { backgroundColor: color, width: size * 1.3, height: truckHeight, borderTopLeftRadius: size * 0.2, borderTopRightRadius: size * 0.1 }]}>
          <Feather name="trash-2" size={size * 0.5} color="#FFFFFF" />
        </View>
        <View style={[styles.truckCab, { backgroundColor: color, width: size * 1, height: truckHeight * 0.85, borderTopRightRadius: size * 0.25 }]}>
          <View style={[styles.window, { width: size * 0.4, height: size * 0.35, borderRadius: size * 0.08 }]} />
        </View>
      </View>
      
      <View style={[styles.wheelsContainer, { left: size * 0.2 }]}>
        <Animated.View style={[styles.wheel, { width: wheelSize, height: wheelSize, borderRadius: wheelSize / 2 }, wheelStyle]}>
          <View style={[styles.wheelHub, { width: wheelSize * 0.4, height: wheelSize * 0.4, borderRadius: wheelSize * 0.2 }]} />
        </Animated.View>
        <Animated.View style={[styles.wheel, { width: wheelSize, height: wheelSize, borderRadius: wheelSize / 2, marginLeft: size * 1 }, wheelStyle]}>
          <View style={[styles.wheelHub, { width: wheelSize * 0.4, height: wheelSize * 0.4, borderRadius: wheelSize * 0.2 }]} />
        </Animated.View>
      </View>
    </Animated.View>
  );
};

interface AnimatedGarbageTrucksProps {
  variant?: "single" | "double" | "parade";
  height?: number;
}

export default function AnimatedGarbageTrucks({ variant = "double", height = 120 }: AnimatedGarbageTrucksProps) {
  if (variant === "single") {
    return (
      <View style={[styles.container, { height }]} pointerEvents="none">
        <AnimatedTruck
          color={BrandColors.green}
          size={32}
          startDelay={0}
          duration={8000}
          direction="right"
          yPosition={40}
        />
      </View>
    );
  }

  if (variant === "double") {
    return (
      <View style={[styles.container, { height }]} pointerEvents="none">
        <AnimatedTruck
          color={BrandColors.green}
          size={30}
          startDelay={0}
          duration={9000}
          direction="right"
          yPosition={35}
        />
        <AnimatedTruck
          color={BrandColors.blue}
          size={28}
          startDelay={4500}
          duration={7500}
          direction="left"
          yPosition={75}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { height: height + 50 }]} pointerEvents="none">
      <AnimatedTruck
        color={BrandColors.green}
        size={34}
        startDelay={0}
        duration={10000}
        direction="right"
        yPosition={30}
      />
      <AnimatedTruck
        color={BrandColors.blue}
        size={28}
        startDelay={2500}
        duration={8000}
        direction="left"
        yPosition={70}
      />
      <AnimatedTruck
        color="#FF6B35"
        size={26}
        startDelay={5000}
        duration={7000}
        direction="right"
        yPosition={110}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
    overflow: "visible",
    marginBottom: 10,
    pointerEvents: "none",
  },
  truckContainer: {
    position: "absolute",
    left: 0,
    pointerEvents: "none",
  },
  truckBody: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  truckBack: {
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  truckCab: {
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  window: {
    backgroundColor: "rgba(135, 206, 235, 0.8)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
  },
  wheelsContainer: {
    flexDirection: "row",
    position: "absolute",
    bottom: -6,
  },
  wheel: {
    backgroundColor: "#222",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#444",
  },
  wheelHub: {
    backgroundColor: "#666",
  },
  exhaust: {
    position: "absolute",
    bottom: 12,
    flexDirection: "row",
  },
  exhaustPuff: {
    opacity: 0.6,
  },
  exhaustPuff2: {
    position: "absolute",
    left: -6,
    top: 4,
    opacity: 0.4,
  },
});
