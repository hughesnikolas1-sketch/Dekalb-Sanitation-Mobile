import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

interface Particle {
  id: number;
  x: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
}

const PARTICLE_COLORS = [
  "#1565C0", "#2E7D32", "#42A5F5", "#66BB6A", 
  "#4FC3F7", "#81C784", "#00BCD4", "#8BC34A",
  "#FFD54F", "#FF8A65", "#BA68C8", "#4DD0E1"
];

const PARTICLE_SHAPES = ["circle", "star", "diamond", "heart"] as const;
type ParticleShape = typeof PARTICLE_SHAPES[number];

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * width,
    size: 4 + Math.random() * 8,
    color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
    duration: 4000 + Math.random() * 4000,
    delay: Math.random() * 2000,
  }));
}

function FloatingParticle({ particle }: { particle: Particle }) {
  const translateY = useSharedValue(height + 50);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);
  const rotation = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      particle.delay,
      withRepeat(
        withTiming(-100, { duration: particle.duration, easing: Easing.linear }),
        -1,
        false
      )
    );

    translateX.value = withDelay(
      particle.delay,
      withRepeat(
        withSequence(
          withTiming(20, { duration: particle.duration / 4 }),
          withTiming(-20, { duration: particle.duration / 2 }),
          withTiming(0, { duration: particle.duration / 4 })
        ),
        -1,
        true
      )
    );

    opacity.value = withDelay(
      particle.delay,
      withRepeat(
        withSequence(
          withTiming(0.6, { duration: particle.duration / 4 }),
          withTiming(0.8, { duration: particle.duration / 2 }),
          withTiming(0, { duration: particle.duration / 4 })
        ),
        -1,
        false
      )
    );

    scale.value = withDelay(
      particle.delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: particle.duration / 3 }),
          withTiming(1.2, { duration: particle.duration / 3 }),
          withTiming(0.8, { duration: particle.duration / 3 })
        ),
        -1,
        true
      )
    );

    rotation.value = withDelay(
      particle.delay,
      withRepeat(
        withTiming(360, { duration: particle.duration * 2, easing: Easing.linear }),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        animatedStyle,
        {
          left: particle.x,
          width: particle.size,
          height: particle.size,
          borderRadius: particle.size / 2,
          backgroundColor: particle.color,
          shadowColor: particle.color,
        },
      ]}
    />
  );
}

interface FloatingParticlesProps {
  count?: number;
}

export function FloatingParticles({ count = 15 }: FloatingParticlesProps) {
  const particles = React.useMemo(() => generateParticles(count), [count]);

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((particle) => (
        <FloatingParticle key={particle.id} particle={particle} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
    zIndex: 0,
  },
  particle: {
    position: "absolute",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 3,
  },
});
