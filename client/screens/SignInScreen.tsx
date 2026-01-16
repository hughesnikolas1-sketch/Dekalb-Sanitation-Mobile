import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
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
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, BrandColors } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useAuth } from "@/hooks/useAuth";
import { getApiUrl } from "@/lib/query-client";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const scale = useSharedValue(1);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  const isValid = email.trim().length > 0 && password.length >= 6;

  const handleSignIn = useCallback(async () => {
    if (!isValid) return;

    setIsLoading(true);
    setError("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Sign in failed");
      }

      await signIn(data.user, data.token);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.reset({
        index: 0,
        routes: [{ name: "Main" }],
      });
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  }, [email, password, isValid, navigation, signIn]);

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
      >
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <ThemedText type="h1" style={styles.title}>
            Welcome Back
          </ThemedText>
          <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
            Sign in to access your sanitation services
          </ThemedText>
        </Animated.View>

        {error ? (
          <Animated.View
            entering={FadeInDown.duration(300)}
            style={[styles.errorContainer, { backgroundColor: theme.error + "15" }]}
          >
            <Feather name="alert-circle" size={20} color={theme.error} />
            <ThemedText type="small" style={{ color: theme.error, flex: 1, marginLeft: Spacing.sm }}>
              {error}
            </ThemedText>
          </Animated.View>
        ) : null}

        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.form}>
          <View style={styles.inputGroup}>
            <ThemedText type="h4" style={styles.label}>
              Email Address
            </ThemedText>
            <View
              style={[
                styles.inputContainer,
                { backgroundColor: theme.backgroundDefault, borderColor: theme.divider },
              ]}
            >
              <Feather name="mail" size={22} color={theme.textSecondary} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor={theme.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                testID="input-email"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText type="h4" style={styles.label}>
              Password
            </ThemedText>
            <View
              style={[
                styles.inputContainer,
                { backgroundColor: theme.backgroundDefault, borderColor: theme.divider },
              ]}
            >
              <Feather name="lock" size={22} color={theme.textSecondary} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor={theme.textSecondary}
                secureTextEntry={!showPassword}
                autoComplete="password"
                testID="input-password"
              />
              <Pressable onPress={() => setShowPassword(!showPassword)}>
                <Feather
                  name={showPassword ? "eye-off" : "eye"}
                  size={22}
                  color={theme.textSecondary}
                />
              </Pressable>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <AnimatedPressable
            onPress={handleSignIn}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={!isValid || isLoading}
            style={[
              styles.signInButton,
              { backgroundColor: isValid ? BrandColors.blue : theme.backgroundTertiary },
              animatedButtonStyle,
            ]}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <ThemedText type="button" style={{ color: "#FFFFFF" }}>
                Sign In
              </ThemedText>
            )}
          </AnimatedPressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.footer}>
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            Don't have an account?{" "}
          </ThemedText>
          <Pressable onPress={() => navigation.navigate("CreateAccount")}>
            <ThemedText type="link" style={{ color: BrandColors.green }}>
              Create Account
            </ThemedText>
          </Pressable>
        </Animated.View>
      </KeyboardAwareScrollViewCompat>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing["3xl"],
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: Spacing["3xl"],
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
  },
  form: {
    gap: Spacing.xl,
    marginBottom: Spacing["3xl"],
  },
  inputGroup: {
    gap: Spacing.sm,
  },
  label: {
    marginLeft: Spacing.xs,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    gap: Spacing.md,
  },
  input: {
    flex: 1,
    fontSize: 18,
    height: "100%",
  },
  signInButton: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing["2xl"],
  },
});
