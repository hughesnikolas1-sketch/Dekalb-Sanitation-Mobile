import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Switch,
  Pressable,
  Platform,
  Image,
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
import { Spacing, BorderRadius } from "@/constants/theme";
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
  children,
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  children: React.ReactNode;
}) {
  const { theme } = useTheme();

  return (
    <View style={[styles.settingRow, { backgroundColor: theme.backgroundDefault }]}>
      <View style={[styles.settingIcon, { backgroundColor: theme.primary }]}>
        <Feather name={icon} size={18} color="#FFFFFF" />
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
  const { theme, isDark } = useTheme();

  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const savedSettings = await getUserSettings();
    setSettings(savedSettings);
    setAddress(savedSettings.address);
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

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing.xl,
          paddingHorizontal: Spacing.lg,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
      >
        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          style={styles.avatarContainer}
        >
          <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
            <Image
              source={require("../../assets/images/icon.png")}
              style={styles.avatarImage}
              resizeMode="contain"
            />
          </View>
          <ThemedText type="h2" style={styles.appTitle}>
            Dekalb County
          </ThemedText>
          <ThemedText type="body" style={{ opacity: 0.7 }}>
            Sanitation Services
          </ThemedText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150).duration(400)}>
          <SectionHeader title="SERVICE ADDRESS" />
          <View
            style={[
              styles.addressCard,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <View style={[styles.addressIcon, { backgroundColor: theme.primary }]}>
              <Feather name="map-pin" size={20} color="#FFFFFF" />
            </View>
            <TextInput
              style={[styles.addressInput, { color: theme.text }]}
              value={address}
              onChangeText={handleAddressChange}
              onBlur={handleAddressBlur}
              placeholder="Enter your address"
              placeholderTextColor={theme.textSecondary}
              testID="input-address"
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <SectionHeader title="NOTIFICATIONS" />
          <View style={styles.settingsGroup}>
            <SettingRow icon="bell" title="Enable Notifications">
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={() => toggleSetting("notificationsEnabled")}
                trackColor={{
                  false: theme.backgroundTertiary,
                  true: theme.primary,
                }}
                thumbColor={Platform.OS === "ios" ? undefined : "#FFFFFF"}
                testID="switch-notifications"
              />
            </SettingRow>
            <SettingRow icon="calendar" title="Pickup Reminders">
              <Switch
                value={settings.pickupReminders}
                onValueChange={() => toggleSetting("pickupReminders")}
                trackColor={{
                  false: theme.backgroundTertiary,
                  true: theme.primary,
                }}
                thumbColor={Platform.OS === "ios" ? undefined : "#FFFFFF"}
                disabled={!settings.notificationsEnabled}
                testID="switch-reminders"
              />
            </SettingRow>
            <SettingRow icon="alert-circle" title="Service Alerts">
              <Switch
                value={settings.serviceAlerts}
                onValueChange={() => toggleSetting("serviceAlerts")}
                trackColor={{
                  false: theme.backgroundTertiary,
                  true: theme.primary,
                }}
                thumbColor={Platform.OS === "ios" ? undefined : "#FFFFFF"}
                disabled={!settings.notificationsEnabled}
                testID="switch-alerts"
              />
            </SettingRow>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(250).duration(400)}>
          <SectionHeader title="ABOUT" />
          <View style={styles.settingsGroup}>
            <SettingRow icon="info" title="App Version">
              <ThemedText type="small" style={{ opacity: 0.7 }}>
                1.0.0
              </ThemedText>
            </SettingRow>
            <SettingRow icon="phone" title="Contact Support">
              <ThemedText type="small" style={{ color: theme.primary }}>
                404-555-0123
              </ThemedText>
            </SettingRow>
            <SettingRow icon="globe" title="Website">
              <ThemedText type="small" style={{ color: theme.primary }}>
                dekalbcounty.gov
              </ThemedText>
            </SettingRow>
          </View>
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
    marginBottom: Spacing["3xl"],
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
    overflow: "hidden",
  },
  avatarImage: {
    width: 60,
    height: 60,
  },
  appTitle: {
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
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
  },
  addressIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.lg,
  },
  addressInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: Spacing.xs,
  },
  settingsGroup: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.xs,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  settingTitle: {
    flex: 1,
  },
});
