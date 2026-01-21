import React, { useState, useEffect } from "react";
import { View, Pressable, StyleSheet, Modal } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  FadeIn,
  FadeOut,
  SlideInLeft,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, FuturisticGradients } from "@/constants/theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface MenuItem {
  id: string;
  icon: keyof typeof Feather.glyphMap;
  title: string;
  emoji: string;
  onPress: () => void;
}

interface NavigationMenuProps {
  onNavigate: (screen: string) => void;
}

export function NavigationMenu({ onNavigate }: NavigationMenuProps) {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const iconRotate = useSharedValue(0);
  const iconPulse = useSharedValue(1);

  useEffect(() => {
    iconPulse.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${iconRotate.value}deg` },
      { scale: iconPulse.value },
    ],
  }));

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    iconRotate.value = withSpring(isOpen ? 0 : 90);
    setIsOpen(!isOpen);
  };

  const handleMenuPress = (screen: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsOpen(false);
    iconRotate.value = withSpring(0);
    onNavigate(screen);
  };

  const menuItems: MenuItem[] = [
    { id: "addresses", icon: "map-pin", title: "My Addresses", emoji: "📍", onPress: () => handleMenuPress("addresses") },
    { id: "requests", icon: "file-text", title: "My Requests", emoji: "📋", onPress: () => handleMenuPress("requests") },
    { id: "billing", icon: "credit-card", title: "Billing & Payments", emoji: "💳", onPress: () => handleMenuPress("billing") },
    { id: "issues", icon: "alert-circle", title: "Sanitation Issues", emoji: "⚠️", onPress: () => handleMenuPress("issues") },
    { id: "rate", icon: "star", title: "Rate Experience", emoji: "⭐", onPress: () => handleMenuPress("rate") },
  ];

  return (
    <>
      <View style={styles.menuButton}>
        <Pressable onPress={handleToggle} testID="menu-toggle-button">
          <Animated.View style={iconStyle}>
            <LinearGradient
              colors={FuturisticGradients.greenBlue as [string, string, ...string[]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.menuButtonGradient}
            >
              <Feather name={isOpen ? "x" : "menu"} size={22} color="#FFFFFF" />
              <View style={styles.menuBadge}>
                <ThemedText style={{ fontSize: 10 }}>🌟</ThemedText>
              </View>
            </LinearGradient>
          </Animated.View>
        </Pressable>
      </View>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setIsOpen(false)}>
          <Animated.View
            entering={SlideInLeft.duration(300)}
            style={[styles.menuContainer, { backgroundColor: theme.backgroundSecondary }]}
          >
            <View style={styles.menuHeader}>
              <ThemedText type="h3" style={{ color: theme.text }}>
                🏠 Menu
              </ThemedText>
            </View>
            {menuItems.map((item, index) => (
              <Animated.View
                key={item.id}
                entering={FadeIn.delay(index * 80).duration(300)}
              >
                <Pressable
                  style={[styles.menuItem, { borderBottomColor: theme.divider }]}
                  onPress={item.onPress}
                  testID={`menu-item-${item.id}`}
                >
                  <View style={styles.menuItemLeft}>
                    <ThemedText style={{ fontSize: 20 }}>{item.emoji}</ThemedText>
                    <ThemedText type="body" style={[styles.menuItemText, { color: theme.text }]}>
                      {item.title}
                    </ThemedText>
                  </View>
                  <Feather name="chevron-right" size={20} color={theme.textSecondary} />
                </Pressable>
              </Animated.View>
            ))}
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    position: "absolute",
    top: 50,
    left: 16,
    zIndex: 100,
  },
  menuButtonGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  menuBadge: {
    position: "absolute",
    top: -4,
    right: -4,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  menuContainer: {
    position: "absolute",
    top: 100,
    left: 16,
    width: 280,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  menuHeader: {
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  menuItemText: {
    fontSize: 16,
  },
});
