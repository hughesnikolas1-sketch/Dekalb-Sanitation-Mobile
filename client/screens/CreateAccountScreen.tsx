import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
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

interface InputFieldProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: "default" | "email-address" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words";
  secureTextEntry?: boolean;
  testID: string;
}

function InputField({
  icon,
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  autoCapitalize = "sentences",
  secureTextEntry = false,
  testID,
}: InputFieldProps) {
  const { theme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.inputGroup}>
      <ThemedText type="h4" style={styles.label}>
        {label}
      </ThemedText>
      <View
        style={[
          styles.inputContainer,
          { backgroundColor: theme.backgroundDefault, borderColor: theme.divider },
        ]}
      >
        <Feather name={icon} size={22} color={theme.textSecondary} />
        <TextInput
          style={[styles.input, { color: theme.text }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.textSecondary}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          secureTextEntry={secureTextEntry && !showPassword}
          testID={testID}
        />
        {secureTextEntry ? (
          <Pressable onPress={() => setShowPassword(!showPassword)}>
            <Feather
              name={showPassword ? "eye-off" : "eye"}
              size={22}
              color={theme.textSecondary}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export default function CreateAccountScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { signIn } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
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

  const isValid =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    email.trim().length > 0 &&
    phone.trim().length >= 10 &&
    address.trim().length > 0 &&
    password.length >= 6;

  const handleCreateAccount = useCallback(async () => {
    if (!isValid) return;

    setIsLoading(true);
    setError("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          serviceAddress: address.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      await signIn(data.user, data.token);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.reset({
        index: 0,
        routes: [{ name: "Main" }],
      });
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  }, [firstName, lastName, email, phone, address, password, isValid, navigation, signIn]);

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
            Create Account
          </ThemedText>
          <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
            Sign up to manage your sanitation services
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
          <View style={styles.nameRow}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <ThemedText type="h4" style={styles.label}>
                First Name
              </ThemedText>
              <View
                style={[
                  styles.inputContainer,
                  { backgroundColor: theme.backgroundDefault, borderColor: theme.divider },
                ]}
              >
                <Feather name="user" size={22} color={theme.textSecondary} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="First"
                  placeholderTextColor={theme.textSecondary}
                  autoCapitalize="words"
                  testID="input-firstname"
                />
              </View>
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <ThemedText type="h4" style={styles.label}>
                Last Name
              </ThemedText>
              <View
                style={[
                  styles.inputContainer,
                  { backgroundColor: theme.backgroundDefault, borderColor: theme.divider },
                ]}
              >
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Last"
                  placeholderTextColor={theme.textSecondary}
                  autoCapitalize="words"
                  testID="input-lastname"
                />
              </View>
            </View>
          </View>

          <InputField
            icon="mail"
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            testID="input-email"
          />

          <InputField
            icon="phone"
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            placeholder="(555) 123-4567"
            keyboardType="phone-pad"
            testID="input-phone"
          />

          <InputField
            icon="map-pin"
            label="Service Address"
            value={address}
            onChangeText={setAddress}
            placeholder="123 Main Street, City, GA"
            autoCapitalize="words"
            testID="input-address"
          />

          <InputField
            icon="lock"
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Create a password (6+ characters)"
            secureTextEntry
            autoCapitalize="none"
            testID="input-password"
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <AnimatedPressable
            onPress={handleCreateAccount}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={!isValid || isLoading}
            style={[
              styles.createButton,
              { backgroundColor: isValid ? BrandColors.green : theme.backgroundTertiary },
              animatedButtonStyle,
            ]}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <ThemedText type="button" style={{ color: "#FFFFFF" }}>
                Create Account
              </ThemedText>
            )}
          </AnimatedPressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.footer}>
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            Already have an account?{" "}
          </ThemedText>
          <Pressable onPress={() => navigation.navigate("SignIn")}>
            <ThemedText type="link" style={{ color: BrandColors.blue }}>
              Sign In
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
    paddingTop: Spacing["2xl"],
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: Spacing["2xl"],
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
  },
  form: {
    gap: Spacing.lg,
    marginBottom: Spacing["2xl"],
  },
  nameRow: {
    flexDirection: "row",
    gap: Spacing.md,
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
  createButton: {
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
