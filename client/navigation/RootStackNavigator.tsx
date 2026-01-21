import React from "react";
import { ActivityIndicator, View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabNavigator from "@/navigation/MainTabNavigator";
import AuthStackNavigator from "@/navigation/AuthStackNavigator";
import ReportIssueScreen from "@/screens/ReportIssueScreen";
import MyAddressesScreen from "@/screens/MyAddressesScreen";
import MyRequestsScreen from "@/screens/MyRequestsScreen";
import BillingScreen from "@/screens/BillingScreen";
import RateExperienceScreen from "@/screens/RateExperienceScreen";
import HelpFAQScreen from "@/screens/HelpFAQScreen";
import ViewScheduleScreen from "@/screens/ViewScheduleScreen";
import { LiveChatBubble } from "@/components/LiveChatBubble";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  ReportIssue: undefined;
  MyAddresses: undefined;
  MyRequests: undefined;
  Billing: undefined;
  RateExperience: undefined;
  HelpFAQ: undefined;
  ViewSchedule: undefined;
  SignIn: undefined;
  CreateAccount: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();
  const { isAuthenticated, isLoading } = useAuth();
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.backgroundRoot }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <>
    <Stack.Navigator screenOptions={screenOptions}>
      {isAuthenticated ? (
        <>
          <Stack.Screen
            name="Main"
            component={MainTabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ReportIssue"
            component={ReportIssueScreen}
            options={{
              presentation: "modal",
              headerTitle: "Report Issue",
            }}
          />
          <Stack.Screen
            name="MyAddresses"
            component={MyAddressesScreen}
            options={{ headerTitle: "My Addresses" }}
          />
          <Stack.Screen
            name="MyRequests"
            component={MyRequestsScreen}
            options={{ headerTitle: "My Requests" }}
          />
          <Stack.Screen
            name="Billing"
            component={BillingScreen}
            options={{ headerTitle: "Billing & Payments" }}
          />
          <Stack.Screen
            name="RateExperience"
            component={RateExperienceScreen}
            options={{ headerTitle: "Rate Experience" }}
          />
          <Stack.Screen
            name="HelpFAQ"
            component={HelpFAQScreen}
            options={{ headerTitle: "Help & FAQ" }}
          />
          <Stack.Screen
            name="ViewSchedule"
            component={ViewScheduleScreen}
            options={{ headerTitle: "2026 Schedule" }}
          />
        </>
      ) : (
        <Stack.Screen
          name="Auth"
          component={AuthStackNavigator}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
    {isAuthenticated ? <LiveChatBubble /> : null}
    </>
  );
}
