import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Switch,
  Pressable,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { Spacing, BorderRadius, BrandColors } from "@/constants/theme";
import {
  getUserSettings,
  saveUserAddress,
  saveNotificationSetting,
  UserSettings,
  defaultSettings,
} from "@/lib/storage";

function SettingRow({
  icon,
  title,
  iconColor,
  children,
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  iconColor?: string;
  children: React.ReactNode;
}) {
  const { theme } = useTheme();

  return (
    <View style={[styles.settingRow, { backgroundColor: theme.backgroundDefault }]}>
      <View style={[styles.settingIcon, { backgroundColor: iconColor || theme.primary }]}>
        <Feather name={icon} size={20} color="#FFFFFF" />
      </View>
      <ThemedText type="body" style={styles.settingTitle}>
        {title}
      </ThemedText>
      {children}
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <ThemedText type="small" style={styles.sectionHeader}>
      {title}
    </ThemedText>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { user, signOut } = useAuth();

  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const savedSettings = await getUserSettings();
    setSettings(savedSettings);
    setAddress(user?.serviceAddress || savedSettings.address);
    setIsLoading(false);
  };

  const handleAddressChange = useCallback((text: string) => {
    setAddress(text);
  }, []);

  const handleAddressBlur = useCallback(async () => {
    await saveUserAddress(address);
    setSettings((prev) => ({ ...prev, address }));
  }, [address]);

  const toggleSetting = useCallback(
    async (key: "notificationsEnabled" | "pickupReminders" | "serviceAlerts") => {
      const newValue = !settings[key];
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSettings((prev) => ({ ...prev, [key]: newValue }));
      await saveNotificationSetting(key, newValue);
    },
    [settings]
  );

  const handleSignOut = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (Platform.OS === "web") {
      if (confirm("Are you sure you want to sign out?")) {
        signOut();
      }
    } else {
      Alert.alert(
        "Sign Out",
        "Are you sure you want to sign out?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Sign Out", style: "destructive", onPress: signOut },
        ]
      );
    }
  }, [signOut]);

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ThemedText type="body" style={{ opacity: 0.7 }}>
            Loading settings...
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  const userName = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "Guest";

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing.xl,
          paddingHorizontal: Spacing.xl,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
      >
        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          style={styles.avatarContainer}
        >
          <View style={[styles.avatar, { backgroundColor: BrandColors.blue }]}>
            <Feather name="user" size={40} color="#FFFFFF" />
          </View>
          <ThemedText type="h2" style={styles.userName}>
            {userName}
          </ThemedText>
          {user?.email ? (
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              {user.email}
            </ThemedText>
          ) : null}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150).duration(400)}>
          <SectionHeader title="SERVICE ADDRESS" />
          <View
            style={[
              styles.addressCard,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <View style={[styles.addressIcon, { backgroundColor: BrandColors.green }]}>
              <Feather name="map-pin" size={22} color="#FFFFFF" />
            </View>
            <TextInput
              style={[styles.addressInput, { color: theme.text }]}
              value={address}
              onChangeText={handleAddressChange}
              onBlur={handleAddressBlur}
              placeholder="Enter your service address"
              placeholderTextColor={theme.textSecondary}
              testID="input-address"
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <SectionHeader title="NOTIFICATIONS" />
          <View style={styles.settingsGroup}>
            <SettingRow icon="bell" title="Enable Notifications" iconColor={BrandColors.blue}>
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={() => toggleSetting("notificationsEnabled")}
                trackColor={{
                  false: theme.backgroundTertiary,
                  true: BrandColors.blue,
                }}
                thumbColor={Platform.OS === "ios" ? undefined : "#FFFFFF"}
                testID="switch-notifications"
              />
            </SettingRow>
            <SettingRow icon="calendar" title="Pickup Reminders" iconColor={BrandColors.green}>
              <Switch
                value={settings.pickupReminders}
                onValueChange={() => toggleSetting("pickupReminders")}
                trackColor={{
                  false: theme.backgroundTertiary,
                  true: BrandColors.green,
                }}
                thumbColor={Platform.OS === "ios" ? undefined : "#FFFFFF"}
                disabled={!settings.notificationsEnabled}
                testID="switch-reminders"
              />
            </SettingRow>
            <SettingRow icon="alert-circle" title="Service Alerts" iconColor="#F57C00">
              <Switch
                value={settings.serviceAlerts}
                onValueChange={() => toggleSetting("serviceAlerts")}
                trackColor={{
                  false: theme.backgroundTertiary,
                  true: "#F57C00",
                }}
                thumbColor={Platform.OS === "ios" ? undefined : "#FFFFFF"}
                disabled={!settings.notificationsEnabled}
                testID="switch-alerts"
              />
            </SettingRow>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(250).duration(400)}>
          <SectionHeader title="SUPPORT" />
          <View style={styles.settingsGroup}>
            <SettingRow icon="phone" title="Contact Support" iconColor={BrandColors.blue}>
              <ThemedText type="body" style={{ color: BrandColors.blue }}>
                404-555-0123
              </ThemedText>
            </SettingRow>
            <SettingRow icon="globe" title="Website" iconColor={BrandColors.green}>
              <ThemedText type="body" style={{ color: BrandColors.green }}>
                dekalbcounty.gov
              </ThemedText>
            </SettingRow>
            <SettingRow icon="info" title="App Version" iconColor="#7B1FA2">
              <ThemedText type="body" style={{ color: theme.textSecondary }}>
                1.0.0
              </ThemedText>
            </SettingRow>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <Pressable
            onPress={handleSignOut}
            style={[styles.signOutButton, { borderColor: theme.error }]}
          >
            <Feather name="log-out" size={20} color={theme.error} />
            <ThemedText type="body" style={{ color: theme.error, marginLeft: Spacing.sm, fontWeight: "600" }}>
              Sign Out
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
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  userName: {
    marginBottom: Spacing.xs,
  },
  sectionHeader: {
    opacity: 0.6,
    marginBottom: Spacing.sm,
    marginTop: Spacing.xl,
    marginLeft: Spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  addressCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
  },
  addressIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.lg,
  },
  addressInput: {
    flex: 1,
    fontSize: 18,
    paddingVertical: Spacing.xs,
  },
  settingsGroup: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.xl,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.lg,
  },
  settingTitle: {
    flex: 1,
  },
  signOutButton: {
    flexDirection: "row",
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing["3xl"],
    borderWidth: 2,
  },
});
