import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolate,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { BrandColors, Spacing } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface GarbageTruckLoaderProps {
  message?: string;
  size?: "small" | "medium" | "large";
  color?: string;
}

export default function GarbageTruckLoader({ 
  message = "Loading...", 
  size = "medium",
  color = BrandColors.green 
}: GarbageTruckLoaderProps) {
  const truckPosition = useSharedValue(0);
  const wheelRotation = useSharedValue(0);
  const truckBounce = useSharedValue(0);
  const exhaustPuff = useSharedValue(0);
  const trashBounce = useSharedValue(0);

  const sizeConfig = {
    small: { truckSize: 28, containerWidth: 120, height: 60 },
    medium: { truckSize: 40, containerWidth: 180, height: 80 },
    large: { truckSize: 56, containerWidth: 240, height: 100 },
  };

  const config = sizeConfig[size];

  useEffect(() => {
    truckPosition.value = withRepeat(
      withTiming(config.containerWidth - config.truckSize, {
        duration: 2000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );

    wheelRotation.value = withRepeat(
      withTiming(360, {
        duration: 800,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    truckBounce.value = withRepeat(
      withSequence(
        withTiming(-3, { duration: 150 }),
        withTiming(0, { duration: 150 })
      ),
      -1,
      false
    );

    exhaustPuff.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0, { duration: 300 })
      ),
      -1,
      false
    );

    trashBounce.value = withRepeat(
      withSequence(
        withTiming(-2, { duration: 200 }),
        withTiming(2, { duration: 200 })
      ),
      -1,
      true
    );
  }, []);

  const truckAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: truckPosition.value },
      { translateY: truckBounce.value },
    ],
  }));

  const wheelAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${wheelRotation.value}deg` }],
  }));

  const exhaustAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(exhaustPuff.value, [0, 1], [0.3, 0.8]),
    transform: [
      { scale: interpolate(exhaustPuff.value, [0, 1], [0.5, 1]) },
      { translateX: interpolate(exhaustPuff.value, [0, 1], [0, -10]) },
    ],
  }));

  const trashAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: trashBounce.value }],
  }));

  return (
    <View style={styles.container}>
      <View style={[styles.trackContainer, { width: config.containerWidth, height: config.height }]}>
        <View style={[styles.road, { width: config.containerWidth }]} />
        
        <Animated.View style={[styles.truckContainer, truckAnimatedStyle]}>
          <Animated.View style={[styles.exhaust, exhaustAnimatedStyle]}>
            <View style={[styles.exhaustPuff, { backgroundColor: color + "40" }]} />
            <View style={[styles.exhaustPuff, styles.exhaustPuff2, { backgroundColor: color + "30" }]} />
          </Animated.View>
          
          <View style={styles.truckWrapper}>
            <View style={[styles.truckBack, { backgroundColor: color }]}>
              <Animated.View style={trashAnimatedStyle}>
                <Feather name="trash-2" size={config.truckSize * 0.35} color="#FFFFFF" />
              </Animated.View>
            </View>
            <View style={[styles.truckCab, { backgroundColor: color }]}>
              <Feather name="truck" size={config.truckSize * 0.5} color="#FFFFFF" />
            </View>
          </View>
          
          <View style={styles.wheelsContainer}>
            <Animated.View style={[styles.wheel, { backgroundColor: "#333" }, wheelAnimatedStyle]}>
              <View style={styles.wheelSpoke} />
            </Animated.View>
            <Animated.View style={[styles.wheel, { backgroundColor: "#333", marginLeft: config.truckSize * 0.4 }, wheelAnimatedStyle]}>
              <View style={styles.wheelSpoke} />
            </Animated.View>
          </View>
        </Animated.View>

        <View style={styles.trashItemsContainer}>
          <Feather name="package" size={12} color={BrandColors.blue} style={{ position: "absolute", left: "20%", bottom: 18 }} />
          <Feather name="archive" size={10} color={BrandColors.green} style={{ position: "absolute", left: "50%", bottom: 16 }} />
          <Feather name="box" size={11} color={BrandColors.blue} style={{ position: "absolute", left: "75%", bottom: 17 }} />
        </View>
      </View>
      
      {message ? (
        <ThemedText type="body" style={[styles.message, { color }]}>
          {message}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
  },
  trackContainer: {
    position: "relative",
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  road: {
    position: "absolute",
    bottom: 8,
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
  },
  truckContainer: {
    position: "absolute",
    bottom: 12,
    left: 0,
  },
  truckWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  truckBack: {
    width: 24,
    height: 20,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  truckCab: {
    width: 18,
    height: 16,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 2,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -2,
  },
  wheelsContainer: {
    flexDirection: "row",
    position: "absolute",
    bottom: -6,
    left: 4,
  },
  wheel: {
    width: 10,
    height: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  wheelSpoke: {
    width: 6,
    height: 1,
    backgroundColor: "#666",
  },
  exhaust: {
    position: "absolute",
    left: -8,
    bottom: 8,
  },
  exhaustPuff: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  exhaustPuff2: {
    position: "absolute",
    left: -4,
    top: 2,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  trashItemsContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
  },
  message: {
    marginTop: Spacing.md,
    fontWeight: "600",
    textAlign: "center",
  },
});
