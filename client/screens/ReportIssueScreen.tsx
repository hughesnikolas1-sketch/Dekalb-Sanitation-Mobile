import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { saveReportedIssue } from "@/lib/storage";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type IssueType = "missed" | "damaged" | "other";

interface IssueOption {
  type: IssueType;
  label: string;
  icon: keyof typeof Feather.glyphMap;
  description: string;
}

const issueOptions: IssueOption[] = [
  {
    type: "missed",
    label: "Missed Pickup",
    icon: "truck",
    description: "Collection was not completed on scheduled day",
  },
  {
    type: "damaged",
    label: "Damaged Container",
    icon: "alert-triangle",
    description: "Trash or recycling bin needs repair/replacement",
  },
  {
    type: "other",
    label: "Other Issue",
    icon: "help-circle",
    description: "Report any other sanitation concern",
  },
];

function IssueTypeCard({
  option,
  isSelected,
  onSelect,
}: {
  option: IssueOption;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  return (
    <AnimatedPressable
      onPress={onSelect}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.issueCard,
        {
          backgroundColor: isSelected
            ? theme.primary
            : theme.backgroundDefault,
          borderColor: isSelected ? theme.primary : theme.divider,
        },
        animatedStyle,
      ]}
    >
      <View
        style={[
          styles.issueIcon,
          {
            backgroundColor: isSelected
              ? "rgba(255,255,255,0.2)"
              : theme.backgroundSecondary,
          },
        ]}
      >
        <Feather
          name={option.icon}
          size={24}
          color={isSelected ? "#FFFFFF" : theme.primary}
        />
      </View>
      <View style={styles.issueInfo}>
        <ThemedText
          type="h4"
          style={{ color: isSelected ? "#FFFFFF" : theme.text }}
        >
          {option.label}
        </ThemedText>
        <ThemedText
          type="small"
          style={{
            color: isSelected ? "rgba(255,255,255,0.8)" : theme.textSecondary,
            marginTop: Spacing.xs,
          }}
        >
          {option.description}
        </ThemedText>
      </View>
      {isSelected ? (
        <View style={styles.checkmark}>
          <Feather name="check" size={18} color="#FFFFFF" />
        </View>
      ) : null}
    </AnimatedPressable>
  );
}

export default function ReportIssueScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation();
  const { theme } = useTheme();

  const [selectedType, setSelectedType] = useState<IssueType | null>(null);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = selectedType !== null && description.trim().length > 0;

  const handleSelectType = useCallback((type: IssueType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedType(type);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!isValid || !selectedType) return;

    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await saveReportedIssue({
        type: selectedType,
        date: new Date().toISOString(),
        description: description.trim(),
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      if (Platform.OS === "web") {
        alert("Your issue has been reported. We will address it within 2 business days.");
        navigation.goBack();
      } else {
        Alert.alert(
          "Issue Reported",
          "Thank you for your report. We will address it within 2 business days.",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        "Error",
        "Failed to submit your report. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [isValid, selectedType, description, navigation]);

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xl,
          paddingHorizontal: Spacing.lg,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
      >
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            What type of issue?
          </ThemedText>
          <View style={styles.issueTypes}>
            {issueOptions.map((option, index) => (
              <Animated.View
                key={option.type}
                entering={FadeInDown.delay(150 + index * 50).duration(400)}
              >
                <IssueTypeCard
                  option={option}
                  isSelected={selectedType === option.type}
                  onSelect={() => handleSelectType(option.type)}
                />
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            Describe the issue
          </ThemedText>
          <TextInput
            style={[
              styles.descriptionInput,
              {
                backgroundColor: theme.backgroundDefault,
                color: theme.text,
                borderColor: theme.divider,
              },
            ]}
            value={description}
            onChangeText={setDescription}
            placeholder="Please provide details about the issue..."
            placeholderTextColor={theme.textSecondary}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            testID="input-description"
          />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(350).duration(400)}
          style={styles.submitContainer}
        >
          <Button
            onPress={handleSubmit}
            disabled={!isValid || isSubmitting}
            style={[
              styles.submitButton,
              { backgroundColor: theme.primary },
            ]}
          >
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </Button>
        </Animated.View>
      </KeyboardAwareScrollViewCompat>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  issueTypes: {
    gap: Spacing.md,
    marginBottom: Spacing["2xl"],
  },
  issueCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    borderWidth: 2,
  },
  issueIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.lg,
  },
  issueInfo: {
    flex: 1,
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  descriptionInput: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    fontSize: 16,
    lineHeight: 24,
    minHeight: 120,
    borderWidth: 1,
  },
  submitContainer: {
    marginTop: Spacing["2xl"],
  },
  submitButton: {
    height: 56,
  },
});
