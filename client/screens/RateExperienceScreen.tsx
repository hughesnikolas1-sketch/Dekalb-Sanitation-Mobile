import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
  Platform,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeInUp, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useMutation } from "@tanstack/react-query";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { Spacing, BorderRadius, BrandColors, FuturisticGradients } from "@/constants/theme";
import { apiRequest, getApiUrl } from "@/lib/query-client";

const STAR_LABELS = ["Poor", "Fair", "Good", "Very Good", "Excellent"];

export default function RateExperienceScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const [experienceRating, setExperienceRating] = useState(0);
  const [accessibilityRating, setAccessibilityRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const submitMutation = useMutation({
    mutationFn: async (data: { experienceRating: number; accessibilityRating: number; feedback: string }) => {
      const url = new URL("/api/feedback", getApiUrl());
      return apiRequest("POST", url.toString(), data);
    },
    onSuccess: () => {
      setIsSubmitted(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: () => {
      if (Platform.OS === "web") {
        window.alert("Failed to submit feedback. Please try again.");
      } else {
        Alert.alert("Error", "Failed to submit feedback. Please try again.");
      }
    },
  });

  const handleSubmit = () => {
    if (experienceRating === 0 || accessibilityRating === 0) {
      if (Platform.OS === "web") {
        window.alert("Please rate both questions before submitting.");
      } else {
        Alert.alert("Missing Rating", "Please rate both questions before submitting.");
      }
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    submitMutation.mutate({ experienceRating, accessibilityRating, feedback });
  };

  const StarRating = ({ rating, onRate, label }: { rating: number; onRate: (n: number) => void; label: string }) => {
    return (
      <View style={styles.starSection}>
        <ThemedText type="body" style={{ fontWeight: "600", marginBottom: Spacing.md }}>
          {label}
        </ThemedText>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Pressable
              key={star}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onRate(star);
              }}
              style={styles.starButton}
            >
              <Feather
                name={star <= rating ? "star" : "star"}
                size={40}
                color={star <= rating ? "#FFD700" : theme.textSecondary + "40"}
                style={star <= rating ? { textShadowColor: "#FFD700", textShadowRadius: 10 } : undefined}
              />
            </Pressable>
          ))}
        </View>
        {rating > 0 ? (
          <ThemedText type="caption" style={{ color: BrandColors.green, marginTop: Spacing.sm, textAlign: "center" }}>
            {STAR_LABELS[rating - 1]}
          </ThemedText>
        ) : null}
      </View>
    );
  };

  if (isSubmitted) {
    return (
      <ThemedView style={styles.container}>
        <ScrollView
          contentContainerStyle={{
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: insets.bottom + 100,
            paddingHorizontal: Spacing.lg,
            alignItems: "center",
          }}
        >
          <Animated.View entering={FadeInUp.duration(600)} style={styles.successContainer}>
            <LinearGradient
              colors={FuturisticGradients.greenBlue as [string, string, ...string[]]}
              style={styles.successIcon}
            >
              <Feather name="heart" size={48} color="#FFFFFF" />
            </LinearGradient>
            <ThemedText type="h2" style={{ textAlign: "center", marginTop: Spacing.xl }}>
              Thank You!
            </ThemedText>
            <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: "center", marginTop: Spacing.md }}>
              Your feedback helps us improve our services and make the app better for everyone in DeKalb County.
            </ThemedText>

            <Pressable
              onPress={() => navigation.goBack()}
              style={{ marginTop: Spacing.xl * 2 }}
            >
              <LinearGradient
                colors={FuturisticGradients.greenBlue as [string, string, ...string[]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.backButton}
              >
                <Feather name="home" size={20} color="#FFFFFF" />
                <ThemedText type="body" style={{ color: "#FFFFFF", marginLeft: Spacing.sm }}>
                  Back to Home
                </ThemedText>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: insets.bottom + 100,
          paddingHorizontal: Spacing.lg,
        }}
      >
        <Animated.View entering={FadeInDown.duration(400)}>
          <LinearGradient
            colors={FuturisticGradients.greenBlue as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerCard}
          >
            <View style={styles.headerIcon}>
              <Feather name="star" size={28} color="#FFFFFF" />
            </View>
            <ThemedText type="h3" style={{ color: "#FFFFFF", marginTop: Spacing.sm }}>
              Rate Your Experience
            </ThemedText>
            <ThemedText type="small" style={{ color: "rgba(255,255,255,0.8)", marginTop: Spacing.xs }}>
              Help us improve our services
            </ThemedText>
          </LinearGradient>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <View style={[styles.questionCard, { backgroundColor: theme.backgroundSecondary }]}>
            <StarRating
              rating={experienceRating}
              onRate={setExperienceRating}
              label="How was your overall experience with DeKalb County Sanitation services?"
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <View style={[styles.questionCard, { backgroundColor: theme.backgroundSecondary }]}>
            <StarRating
              rating={accessibilityRating}
              onRate={setAccessibilityRating}
              label="Was this application easy and accessible for you to use?"
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <View style={[styles.questionCard, { backgroundColor: theme.backgroundSecondary }]}>
            <ThemedText type="body" style={{ fontWeight: "600", marginBottom: Spacing.md }}>
              Any additional feedback? (Optional)
            </ThemedText>
            <TextInput
              style={[styles.feedbackInput, { backgroundColor: theme.backgroundRoot, color: theme.text }]}
              placeholder="Tell us how we can improve..."
              placeholderTextColor={theme.textSecondary}
              value={feedback}
              onChangeText={setFeedback}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500).duration(400)}>
          <Pressable onPress={handleSubmit} disabled={submitMutation.isPending}>
            <LinearGradient
              colors={FuturisticGradients.greenBlue as [string, string, ...string[]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.submitButton, { opacity: experienceRating > 0 && accessibilityRating > 0 ? 1 : 0.6 }]}
            >
              {submitMutation.isPending ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Feather name="send" size={20} color="#FFFFFF" />
                  <ThemedText type="h4" style={{ color: "#FFFFFF", marginLeft: Spacing.sm }}>
                    Submit Feedback
                  </ThemedText>
                </>
              )}
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    alignItems: "center",
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  questionCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  starSection: {
    alignItems: "center",
  },
  starsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  starButton: {
    padding: Spacing.xs,
  },
  feedbackInput: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    fontSize: 16,
    minHeight: 120,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
    marginTop: Spacing.md,
  },
  successContainer: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.xl,
  },
});
