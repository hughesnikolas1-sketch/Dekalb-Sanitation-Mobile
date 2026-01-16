import React, { useState } from "react";
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
} from "react-native";
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, GlowEffects } from "@/constants/theme";

interface FormQuestionProps {
  question: string;
  type: "text" | "yesno" | "select";
  options?: string[];
  value: string;
  onChangeValue: (value: string) => void;
  placeholder?: string;
  index?: number;
  color?: string;
}

export function FormQuestion({
  question,
  type,
  options,
  value,
  onChangeValue,
  placeholder = "Enter your answer...",
  index = 0,
  color = "#00B0FF",
}: FormQuestionProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = (selectedValue: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSequence(
      withSpring(0.95),
      withSpring(1)
    );
    onChangeValue(selectedValue);
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).duration(400).springify()}
      style={[
        styles.questionContainer,
        {
          backgroundColor: colors.backgroundSecondary,
          borderColor: color + "40",
        },
      ]}
    >
      <View style={styles.questionHeader}>
        <View style={[styles.questionIcon, { backgroundColor: color + "20" }]}>
          <Feather name="help-circle" size={20} color={color} />
        </View>
        <ThemedText type="body" style={styles.questionText}>
          {question}
        </ThemedText>
      </View>

      {type === "text" ? (
        <TextInput
          style={[
            styles.textInput,
            {
              backgroundColor: colors.backgroundDefault,
              borderColor: value ? color : colors.cardBorder,
              color: colors.text,
            },
          ]}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          value={value}
          onChangeText={onChangeValue}
          multiline
          numberOfLines={2}
        />
      ) : type === "yesno" ? (
        <View style={styles.yesNoContainer}>
          <Animated.View style={animatedStyle}>
            <Pressable
              onPress={() => handlePress("Yes")}
              style={[
                styles.yesNoButton,
                {
                  backgroundColor: value === "Yes" ? "#00E676" : colors.backgroundDefault,
                  borderColor: value === "Yes" ? "#00E676" : colors.cardBorder,
                  ...GlowEffects.neonGreen,
                  shadowOpacity: value === "Yes" ? 0.5 : 0,
                },
              ]}
            >
              <Feather
                name="check-circle"
                size={24}
                color={value === "Yes" ? "#FFFFFF" : colors.textSecondary}
              />
              <ThemedText
                type="body"
                style={{
                  marginLeft: Spacing.sm,
                  color: value === "Yes" ? "#FFFFFF" : colors.text,
                  fontWeight: value === "Yes" ? "600" : "400",
                }}
              >
                Yes
              </ThemedText>
            </Pressable>
          </Animated.View>

          <Animated.View style={animatedStyle}>
            <Pressable
              onPress={() => handlePress("No")}
              style={[
                styles.yesNoButton,
                {
                  backgroundColor: value === "No" ? "#FF5252" : colors.backgroundDefault,
                  borderColor: value === "No" ? "#FF5252" : colors.cardBorder,
                  shadowColor: "#FF5252",
                  shadowOpacity: value === "No" ? 0.5 : 0,
                  shadowRadius: 15,
                  elevation: value === "No" ? 8 : 0,
                },
              ]}
            >
              <Feather
                name="x-circle"
                size={24}
                color={value === "No" ? "#FFFFFF" : colors.textSecondary}
              />
              <ThemedText
                type="body"
                style={{
                  marginLeft: Spacing.sm,
                  color: value === "No" ? "#FFFFFF" : colors.text,
                  fontWeight: value === "No" ? "600" : "400",
                }}
              >
                No
              </ThemedText>
            </Pressable>
          </Animated.View>
        </View>
      ) : type === "select" && options ? (
        <View style={styles.selectContainer}>
          {options.map((option, idx) => (
            <Pressable
              key={idx}
              onPress={() => handlePress(option)}
              style={[
                styles.selectOption,
                {
                  backgroundColor: value === option ? color : colors.backgroundDefault,
                  borderColor: value === option ? color : colors.cardBorder,
                  shadowColor: color,
                  shadowOpacity: value === option ? 0.4 : 0,
                  shadowRadius: 10,
                  elevation: value === option ? 6 : 0,
                },
              ]}
            >
              <View
                style={[
                  styles.radioOuter,
                  { borderColor: value === option ? "#FFFFFF" : colors.textSecondary },
                ]}
              >
                {value === option ? <View style={styles.radioInner} /> : null}
              </View>
              <ThemedText
                type="small"
                style={{
                  marginLeft: Spacing.sm,
                  color: value === option ? "#FFFFFF" : colors.text,
                  flex: 1,
                }}
              >
                {option}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      ) : null}
    </Animated.View>
  );
}

interface ServiceReminderProps {
  message: string;
  color?: string;
}

export function ServiceReminder({ message, color = "#00E676" }: ServiceReminderProps) {
  const { colors } = useTheme();
  const sparkle = useSharedValue(1);

  React.useEffect(() => {
    sparkle.value = withSequence(
      withTiming(1.1, { duration: 500 }),
      withTiming(1, { duration: 500 }),
      withTiming(1.1, { duration: 500 }),
      withTiming(1, { duration: 500 })
    );
  }, []);

  const sparkleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sparkle.value }],
  }));

  return (
    <Animated.View
      entering={FadeInDown.duration(600).springify()}
      style={[
        styles.reminderContainer,
        {
          backgroundColor: color + "15",
          borderColor: color + "40",
        },
      ]}
    >
      <Animated.View style={sparkleStyle}>
        <Feather name="heart" size={22} color={color} />
      </Animated.View>
      <ThemedText
        type="small"
        style={[styles.reminderText, { color: colors.text }]}
      >
        {message}
      </ThemedText>
      <Animated.View style={sparkleStyle}>
        <Feather name="star" size={18} color={color} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  questionContainer: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1.5,
  },
  questionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  questionIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  questionText: {
    flex: 1,
    lineHeight: 24,
  },
  textInput: {
    borderWidth: 2,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    fontSize: 18,
    minHeight: 80,
    textAlignVertical: "top",
  },
  yesNoContainer: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  yesNoButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    minWidth: 120,
    justifyContent: "center",
  },
  selectContainer: {
    gap: Spacing.sm,
  },
  selectOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
  },
  reminderContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    marginVertical: Spacing.md,
    gap: Spacing.sm,
  },
  reminderText: {
    flex: 1,
    textAlign: "center",
    fontStyle: "italic",
  },
});
