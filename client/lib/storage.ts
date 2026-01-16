import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEYS = {
  USER_ADDRESS: "@dekalb_user_address",
  NOTIFICATIONS_ENABLED: "@dekalb_notifications_enabled",
  PICKUP_REMINDERS: "@dekalb_pickup_reminders",
  SERVICE_ALERTS: "@dekalb_service_alerts",
};

export interface UserSettings {
  address: string;
  notificationsEnabled: boolean;
  pickupReminders: boolean;
  serviceAlerts: boolean;
}

export const defaultSettings: UserSettings = {
  address: "",
  notificationsEnabled: true,
  pickupReminders: true,
  serviceAlerts: true,
};

export async function getUserSettings(): Promise<UserSettings> {
  try {
    const [address, notifications, reminders, alerts] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.USER_ADDRESS),
      AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED),
      AsyncStorage.getItem(STORAGE_KEYS.PICKUP_REMINDERS),
      AsyncStorage.getItem(STORAGE_KEYS.SERVICE_ALERTS),
    ]);

    return {
      address: address || defaultSettings.address,
      notificationsEnabled:
        notifications !== null
          ? notifications === "true"
          : defaultSettings.notificationsEnabled,
      pickupReminders:
        reminders !== null
          ? reminders === "true"
          : defaultSettings.pickupReminders,
      serviceAlerts:
        alerts !== null ? alerts === "true" : defaultSettings.serviceAlerts,
    };
  } catch (error) {
    console.error("Error loading settings:", error);
    return defaultSettings;
  }
}

export async function saveUserAddress(address: string): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_ADDRESS, address);
  } catch (error) {
    console.error("Error saving address:", error);
  }
}

export async function saveNotificationSetting(
  key: "notificationsEnabled" | "pickupReminders" | "serviceAlerts",
  value: boolean
): Promise<void> {
  try {
    const storageKey = {
      notificationsEnabled: STORAGE_KEYS.NOTIFICATIONS_ENABLED,
      pickupReminders: STORAGE_KEYS.PICKUP_REMINDERS,
      serviceAlerts: STORAGE_KEYS.SERVICE_ALERTS,
    }[key];

    await AsyncStorage.setItem(storageKey, value.toString());
  } catch (error) {
    console.error("Error saving notification setting:", error);
  }
}

export interface ReportedIssue {
  id: string;
  type: "missed" | "damaged" | "other";
  date: string;
  description: string;
  createdAt: string;
}

const ISSUES_KEY = "@dekalb_reported_issues";

export async function getReportedIssues(): Promise<ReportedIssue[]> {
  try {
    const data = await AsyncStorage.getItem(ISSUES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error loading issues:", error);
    return [];
  }
}

export async function saveReportedIssue(
  issue: Omit<ReportedIssue, "id" | "createdAt">
): Promise<ReportedIssue> {
  try {
    const issues = await getReportedIssues();
    const newIssue: ReportedIssue = {
      ...issue,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    issues.unshift(newIssue);
    await AsyncStorage.setItem(ISSUES_KEY, JSON.stringify(issues));
    return newIssue;
  } catch (error) {
    console.error("Error saving issue:", error);
    throw error;
  }
}
