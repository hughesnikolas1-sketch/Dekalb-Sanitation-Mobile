import React, { useEffect, useState } from "react";
import { View, StyleSheet, Dimensions, Modal } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
  interpolate,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { BrandColors, Spacing, FuturisticGradients } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { LinearGradient } from "expo-linear-gradient";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface ConfettiPiece {
  id: number;
  x: number;
  delay: number;
  color: string;
  size: number;
  rotation: number;
}

interface SuccessTruckAnimationProps {
  visible: boolean;
  onComplete: () => void;
  message?: string;
  subMessage?: string;
}

const ConfettiItem = ({ piece }: { piece: ConfettiPiece }) => {
  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    translateY.value = withDelay(
      piece.delay,
      withTiming(SCREEN_HEIGHT + 100, {
        duration: 3000,
        easing: Easing.out(Easing.quad),
      })
    );
    translateX.value = withDelay(
      piece.delay,
      withTiming(Math.random() * 100 - 50, {
        duration: 3000,
        easing: Easing.inOut(Easing.sine),
      })
    );
    rotate.value = withDelay(
      piece.delay,
      withTiming(720, {
        duration: 3000,
        easing: Easing.linear,
      })
    );
    opacity.value = withDelay(
      piece.delay + 2000,
      withTiming(0, { duration: 1000 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.confetti,
        {
          left: piece.x,
          backgroundColor: piece.color,
          width: piece.size,
          height: piece.size * 0.6,
          borderRadius: piece.size * 0.15,
        },
        animatedStyle,
      ]}
    />
  );
};

export default function SuccessTruckAnimation({
  visible,
  onComplete,
  message = "Request Submitted!",
  subMessage = "Our team is on the way!",
}: SuccessTruckAnimationProps) {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const truckPosition = useSharedValue(-150);
  const truckScale = useSharedValue(0.5);
  const contentOpacity = useSharedValue(0);
  const contentScale = useSharedValue(0.8);
  const checkmarkScale = useSharedValue(0);
  const sparkleOpacity = useSharedValue(0);

  const confettiColors = [
    BrandColors.blue,
    BrandColors.green,
    "#FFD700",
    "#FF6B6B",
    "#4ECDC4",
    "#9B59B6",
    "#F39C12",
  ];

  useEffect(() => {
    if (visible) {
      const pieces: ConfettiPiece[] = [];
      for (let i = 0; i < 40; i++) {
        pieces.push({
          id: i,
          x: Math.random() * SCREEN_WIDTH,
          delay: Math.random() * 500,
          color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
          size: 8 + Math.random() * 8,
          rotation: Math.random() * 360,
        });
      }
      setConfetti(pieces);

      truckPosition.value = withSequence(
        withTiming(SCREEN_WIDTH / 2 - 60, {
          duration: 1200,
          easing: Easing.out(Easing.back(1.2)),
        }),
        withDelay(2000, withTiming(SCREEN_WIDTH + 150, {
          duration: 800,
          easing: Easing.in(Easing.ease),
        }))
      );

      truckScale.value = withSequence(
        withTiming(1.2, { duration: 800, easing: Easing.out(Easing.back(1.5)) }),
        withTiming(1, { duration: 200 }),
        withDelay(1800, withTiming(0.8, { duration: 300 }))
      );

      contentOpacity.value = withDelay(600, withTiming(1, { duration: 400 }));
      contentScale.value = withDelay(600, withTiming(1, { duration: 400, easing: Easing.out(Easing.back(1.5)) }));

      checkmarkScale.value = withDelay(
        800,
        withSequence(
          withTiming(1.3, { duration: 200 }),
          withTiming(1, { duration: 150 })
        )
      );

      sparkleOpacity.value = withDelay(
        900,
        withSequence(
          withTiming(1, { duration: 200 }),
          withTiming(0.5, { duration: 300 }),
          withTiming(1, { duration: 300 }),
          withTiming(0.5, { duration: 300 }),
          withTiming(0, { duration: 500 })
        )
      );

      const timer = setTimeout(() => {
        onComplete();
      }, 4000);

      return () => clearTimeout(timer);
    } else {
      setConfetti([]);
      truckPosition.value = -150;
      truckScale.value = 0.5;
      contentOpacity.value = 0;
      contentScale.value = 0.8;
      checkmarkScale.value = 0;
      sparkleOpacity.value = 0;
    }
  }, [visible]);

  const truckAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: truckPosition.value },
      { scale: truckScale.value },
    ],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ scale: contentScale.value }],
  }));

  const checkmarkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkmarkScale.value }],
  }));

  const sparkleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: sparkleOpacity.value,
  }));

  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        {confetti.map((piece) => (
          <ConfettiItem key={piece.id} piece={piece} />
        ))}

        <Animated.View style={[styles.truckContainer, truckAnimatedStyle]}>
          <LinearGradient
            colors={FuturisticGradients.commercial as [string, string, ...string[]]}
            style={styles.truckBody}
          >
            <View style={styles.truckBack}>
              <Feather name="check" size={32} color="#FFFFFF" />
            </View>
            <View style={styles.truckCab}>
              <Feather name="truck" size={28} color="#FFFFFF" />
            </View>
          </LinearGradient>
          
          <View style={styles.wheels}>
            <View style={styles.wheel} />
            <View style={styles.wheel} />
          </View>

          <Animated.View style={[styles.sparkles, sparkleAnimatedStyle]}>
            <Feather name="star" size={16} color="#FFD700" style={{ position: "absolute", top: -20, left: 10 }} />
            <Feather name="star" size={12} color="#FFD700" style={{ position: "absolute", top: -15, right: 5 }} />
            <Feather name="star" size={14} color="#FFD700" style={{ position: "absolute", top: -25, left: 50 }} />
          </Animated.View>
        </Animated.View>

        <Animated.View style={[styles.content, contentAnimatedStyle]}>
          <Animated.View style={[styles.checkmarkContainer, checkmarkAnimatedStyle]}>
            <LinearGradient
              colors={[BrandColors.green, BrandColors.greenDark]}
              style={styles.checkmarkCircle}
            >
              <Feather name="check" size={40} color="#FFFFFF" />
            </LinearGradient>
          </Animated.View>

          <ThemedText type="h2" style={styles.message}>
            {message}
          </ThemedText>
          <ThemedText type="body" style={styles.subMessage}>
            {subMessage}
          </ThemedText>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  confetti: {
    position: "absolute",
    top: 0,
  },
  truckContainer: {
    position: "absolute",
    top: "35%",
  },
  truckBody: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 8,
    alignItems: "center",
  },
  truckBack: {
    width: 60,
    height: 50,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 4,
  },
  truckCab: {
    width: 50,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  wheels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    marginTop: -8,
  },
  wheel: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#333",
    borderWidth: 3,
    borderColor: "#555",
  },
  sparkles: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  content: {
    alignItems: "center",
    marginTop: 120,
  },
  checkmarkContainer: {
    marginBottom: Spacing.lg,
  },
  checkmarkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: BrandColors.green,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  message: {
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subMessage: {
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
  },
});
