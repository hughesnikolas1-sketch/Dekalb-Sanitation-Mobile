import React, { useState } from "react";
import { View, StyleSheet, Pressable, Dimensions, ColorValue } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeInDown,
  FadeInUp,
  ZoomIn,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { DCLogo, SelectionCelebration } from "@/components/DCLogo";
import { useTheme } from "@/hooks/useTheme";
import {
  Spacing,
  BorderRadius,
  BrandColors,
} from "@/constants/theme";

const PRIMARY_GRADIENT: [string, string, string] = ["#1565C0", "#1976D2", "#42A5F5"];
const SECONDARY_GRADIENT: [string, string, string] = ["#2E7D32", "#43A047", "#66BB6A"];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const { width } = Dimensions.get("window");

interface AddressTypeSelectorProps {
  onSelect: (type: "owner" | "tenant", serviceCategory: "residential" | "commercial") => void;
  address: string;
}

export function AddressTypeSelector({ onSelect, address }: AddressTypeSelectorProps) {
  const { theme } = useTheme();
  const [step, setStep] = useState<"ownership" | "service">("ownership");
  const [ownershipType, setOwnershipType] = useState<"owner" | "tenant" | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const handleOwnershipSelect = (type: "owner" | "tenant") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setOwnershipType(type);
    setShowCelebration(true);
    setTimeout(() => {
      setShowCelebration(false);
      setStep("service");
    }, 600);
  };

  const handleServiceSelect = (category: "residential" | "commercial") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setShowCelebration(true);
    setTimeout(() => {
      onSelect(ownershipType!, category);
    }, 400);
  };

  return (
    <ThemedView style={styles.container}>
      <SelectionCelebration visible={showCelebration} />
      
      <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
        <DCLogo size={80} animate={true} />
        <ThemedText type="h1" style={styles.title}>
          DeKalb Sanitation
        </ThemedText>
        <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
          {address ? `Service for: ${address}` : "Set up your service"}
        </ThemedText>
      </Animated.View>

      {step === "ownership" ? (
        <Animated.View entering={FadeInUp.delay(200).duration(500)} style={styles.optionsContainer}>
          <ThemedText type="h3" style={styles.questionText}>
            What is your relationship to this address?
          </ThemedText>

          <AnimatedPressable
            entering={ZoomIn.delay(300).duration(400)}
            style={styles.optionCard}
            onPress={() => handleOwnershipSelect("owner")}
          >
            <LinearGradient
              colors={PRIMARY_GRADIENT}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.optionGradient}
            >
              <View style={styles.optionIconContainer}>
                <Feather name="home" size={40} color="#FFFFFF" />
              </View>
              <ThemedText type="h2" style={styles.optionTitle}>
                I Own This Property
              </ThemedText>
              <ThemedText type="body" style={styles.optionDescription}>
                Property owner with full service control
              </ThemedText>
            </LinearGradient>
          </AnimatedPressable>

          <AnimatedPressable
            entering={ZoomIn.delay(400).duration(400)}
            style={styles.optionCard}
            onPress={() => handleOwnershipSelect("tenant")}
          >
            <LinearGradient
              colors={SECONDARY_GRADIENT}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.optionGradient}
            >
              <View style={styles.optionIconContainer}>
                <Feather name="key" size={40} color="#FFFFFF" />
              </View>
              <ThemedText type="h2" style={styles.optionTitle}>
                I'm a Tenant
              </ThemedText>
              <ThemedText type="body" style={styles.optionDescription}>
                Renting or leasing this property
              </ThemedText>
            </LinearGradient>
          </AnimatedPressable>
        </Animated.View>
      ) : (
        <Animated.View entering={FadeInUp.duration(500)} style={styles.optionsContainer}>
          <ThemedText type="h3" style={styles.questionText}>
            What type of service do you need?
          </ThemedText>

          <AnimatedPressable
            entering={ZoomIn.delay(100).duration(400)}
            style={styles.optionCard}
            onPress={() => handleServiceSelect("residential")}
          >
            <LinearGradient
              colors={PRIMARY_GRADIENT}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.optionGradient}
            >
              <View style={styles.optionIconContainer}>
                <Feather name="home" size={40} color="#FFFFFF" />
              </View>
              <ThemedText type="h2" style={styles.optionTitle}>
                Residential Services
              </ThemedText>
              <ThemedText type="body" style={styles.optionDescription}>
                Home trash, recycling, and yard waste
              </ThemedText>
            </LinearGradient>
          </AnimatedPressable>

          <AnimatedPressable
            entering={ZoomIn.delay(200).duration(400)}
            style={styles.optionCard}
            onPress={() => handleServiceSelect("commercial")}
          >
            <LinearGradient
              colors={SECONDARY_GRADIENT}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.optionGradient}
            >
              <View style={styles.optionIconContainer}>
                <Feather name="briefcase" size={40} color="#FFFFFF" />
              </View>
              <ThemedText type="h2" style={styles.optionTitle}>
                Commercial Services
              </ThemedText>
              <ThemedText type="body" style={styles.optionDescription}>
                Business waste management solutions
              </ThemedText>
            </LinearGradient>
          </AnimatedPressable>
        </Animated.View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  header: {
    alignItems: "center",
    paddingTop: Spacing["3xl"],
    paddingBottom: Spacing.xl,
  },
  title: {
    marginTop: Spacing.lg,
    textAlign: "center",
  },
  subtitle: {
    marginTop: Spacing.sm,
    textAlign: "center",
  },
  optionsContainer: {
    flex: 1,
    paddingTop: Spacing.lg,
  },
  questionText: {
    textAlign: "center",
    marginBottom: Spacing["2xl"],
  },
  optionCard: {
    marginBottom: Spacing.xl,
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  optionGradient: {
    padding: Spacing["2xl"],
    alignItems: "center",
  },
  optionIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  optionTitle: {
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  optionDescription: {
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
  },
});
