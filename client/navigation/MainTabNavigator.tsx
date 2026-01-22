import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet } from "react-native";
import HomeStackNavigator from "@/navigation/HomeStackNavigator";
import ServicesStackNavigator from "@/navigation/ServicesStackNavigator";
import ProfileStackNavigator from "@/navigation/ProfileStackNavigator";
import AdminDashboardScreen from "@/screens/AdminDashboardScreen";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { BrandColors } from "@/constants/theme";

export type MainTabParamList = {
  HomeTab: undefined;
  ServicesTab: undefined;
  ProfileTab: undefined;
  AdminTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  const { theme, isDark } = useTheme();
  const { user } = useAuth();

  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={{
        tabBarActiveTintColor: theme.tabIconSelected,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: Platform.select({
            ios: "transparent",
            android: theme.backgroundRoot,
          }),
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : null,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Feather name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ServicesTab"
        component={ServicesStackNavigator}
        options={{
          title: "Services",
          tabBarIcon: ({ color, size }) => (
            <Feather name="list" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" size={size} color={color} />
          ),
        }}
      />
      {user?.isAdmin ? (
        <Tab.Screen
          name="AdminTab"
          component={AdminDashboardScreen}
          options={{
            title: "Admin",
            tabBarIcon: ({ color, size }) => (
              <Feather name="shield" size={size} color={color} />
            ),
            tabBarActiveTintColor: BrandColors.green,
          }}
        />
      ) : null}
    </Tab.Navigator>
  );
}
