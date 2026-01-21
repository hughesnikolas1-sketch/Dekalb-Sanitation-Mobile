import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { LiveAgentBanner } from "@/components/LiveAgentBanner";
import { FloatingParticles } from "@/components/FloatingParticles";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { Spacing, BorderRadius, BrandColors, FuturisticGradients } from "@/constants/theme";
import { apiRequest, getApiUrl } from "@/lib/query-client";

interface Address {
  id: string;
  street: string;
  apt?: string;
  city: string;
  state: string;
  zip: string;
  isDefault: boolean;
}

export default function MyAddressesScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const queryClient = useQueryClient();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: "",
    apt: "",
    city: "",
    state: "GA",
    zip: "",
  });

  const { data: addresses = [], isLoading, refetch } = useQuery<Address[]>({
    queryKey: ["/api/addresses"],
    enabled: !!user,
  });

  const addAddressMutation = useMutation({
    mutationFn: async (address: typeof newAddress) => {
      const url = new URL("/api/addresses", getApiUrl());
      return apiRequest("POST", url.toString(), address);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/addresses"] });
      setShowAddForm(false);
      setNewAddress({ street: "", apt: "", city: "", state: "GA", zip: "" });
      if (Platform.OS === "web") {
        window.alert("Address added successfully!");
      } else {
        Alert.alert("Success", "Address added successfully!");
      }
    },
    onError: () => {
      if (Platform.OS === "web") {
        window.alert("Failed to add address. Please try again.");
      } else {
        Alert.alert("Error", "Failed to add address. Please try again.");
      }
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: async (addressId: string) => {
      const url = new URL(`/api/addresses/${addressId}`, getApiUrl());
      return apiRequest("DELETE", url.toString());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/addresses"] });
    },
  });

  const handleAddAddress = () => {
    if (!newAddress.street || !newAddress.city || !newAddress.zip) {
      if (Platform.OS === "web") {
        window.alert("Please fill in all required fields.");
      } else {
        Alert.alert("Missing Information", "Please fill in all required fields.");
      }
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addAddressMutation.mutate(newAddress);
  };

  const handleDeleteAddress = (addressId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (Platform.OS === "web") {
      if (window.confirm("Are you sure you want to delete this address?")) {
        deleteAddressMutation.mutate(addressId);
      }
    } else {
      Alert.alert(
        "Delete Address",
        "Are you sure you want to delete this address?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: () => deleteAddressMutation.mutate(addressId) },
        ]
      );
    }
  };

  const renderAddress = ({ item, index }: { item: Address; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 100).duration(400)}>
      <View style={[styles.addressCard, { backgroundColor: theme.backgroundSecondary }]}>
        <View style={styles.addressContent}>
          <View style={styles.addressIcon}>
            <LinearGradient
              colors={FuturisticGradients.greenBlue as [string, string, ...string[]]}
              style={styles.iconGradient}
            >
              <Feather name="map-pin" size={20} color="#FFFFFF" />
            </LinearGradient>
          </View>
          <View style={styles.addressDetails}>
            <ThemedText type="body" style={{ fontWeight: "600" }}>
              {item.street}{item.apt ? `, ${item.apt}` : ""}
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {item.city}, {item.state} {item.zip}
            </ThemedText>
            {item.isDefault ? (
              <View style={styles.defaultBadge}>
                <ThemedText type="caption" style={{ color: BrandColors.green, fontWeight: "600" }}>
                  Default Address
                </ThemedText>
              </View>
            ) : null}
          </View>
        </View>
        <Pressable
          onPress={() => handleDeleteAddress(item.id)}
          style={styles.deleteButton}
          hitSlop={12}
        >
          <Feather name="trash-2" size={20} color="#EF5350" />
        </Pressable>
      </View>
    </Animated.View>
  );

  const renderAddForm = () => (
    <Animated.View entering={FadeInUp.duration(400)}>
      <View style={[styles.addFormCard, { backgroundColor: theme.backgroundSecondary }]}>
        <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
          Add New Address
        </ThemedText>

        <TextInput
          style={[styles.input, { backgroundColor: theme.backgroundRoot, color: theme.text }]}
          placeholder="Street Address *"
          placeholderTextColor={theme.textSecondary}
          value={newAddress.street}
          onChangeText={(text) => setNewAddress({ ...newAddress, street: text })}
        />

        <TextInput
          style={[styles.input, { backgroundColor: theme.backgroundRoot, color: theme.text }]}
          placeholder="Apt/Suite/Unit (Optional)"
          placeholderTextColor={theme.textSecondary}
          value={newAddress.apt}
          onChangeText={(text) => setNewAddress({ ...newAddress, apt: text })}
        />

        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.cityInput, { backgroundColor: theme.backgroundRoot, color: theme.text }]}
            placeholder="City *"
            placeholderTextColor={theme.textSecondary}
            value={newAddress.city}
            onChangeText={(text) => setNewAddress({ ...newAddress, city: text })}
          />
          <TextInput
            style={[styles.input, styles.zipInput, { backgroundColor: theme.backgroundRoot, color: theme.text }]}
            placeholder="ZIP *"
            placeholderTextColor={theme.textSecondary}
            value={newAddress.zip}
            onChangeText={(text) => setNewAddress({ ...newAddress, zip: text })}
            keyboardType="number-pad"
            maxLength={5}
          />
        </View>

        <View style={styles.formButtons}>
          <Pressable
            onPress={() => setShowAddForm(false)}
            style={[styles.cancelButton, { borderColor: theme.textSecondary }]}
          >
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              Cancel
            </ThemedText>
          </Pressable>
          <Pressable onPress={handleAddAddress} disabled={addAddressMutation.isPending}>
            <LinearGradient
              colors={FuturisticGradients.greenBlue as [string, string, ...string[]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveButton}
            >
              {addAddressMutation.isPending ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Feather name="plus" size={18} color="#FFFFFF" />
                  <ThemedText type="body" style={{ color: "#FFFFFF", marginLeft: Spacing.xs }}>
                    Save Address
                  </ThemedText>
                </>
              )}
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIcon, { backgroundColor: BrandColors.blue + "20" }]}>
        <Feather name="map-pin" size={40} color={BrandColors.blue} />
      </View>
      <ThemedText type="h4" style={{ marginTop: Spacing.lg, textAlign: "center" }}>
        No Saved Addresses
      </ThemedText>
      <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: "center", marginTop: Spacing.sm }}>
        Add an address to quickly select it when submitting service requests.
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <FloatingParticles count={8} />
      <FlatList
        data={addresses}
        keyExtractor={(item) => item.id}
        renderItem={renderAddress}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: insets.bottom + 100,
          paddingHorizontal: Spacing.lg,
        }}
        ListHeaderComponent={
          <>
            <Animated.View entering={FadeInDown.duration(400)}>
              <LinearGradient
                colors={FuturisticGradients.greenBlue as [string, string, ...string[]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerCard}
              >
                <View style={styles.headerIcon}>
                  <Feather name="map-pin" size={28} color="#FFFFFF" />
                </View>
                <ThemedText type="h3" style={{ color: "#FFFFFF", marginTop: Spacing.sm }}>
                  My Addresses
                </ThemedText>
                <ThemedText type="small" style={{ color: "rgba(255,255,255,0.8)", marginTop: Spacing.xs }}>
                  Manage your saved service addresses
                </ThemedText>
              </LinearGradient>
            </Animated.View>

            {showAddForm ? renderAddForm() : null}

            {!showAddForm ? (
              <Animated.View entering={FadeInDown.delay(200).duration(400)}>
                <Pressable onPress={() => setShowAddForm(true)}>
                  <View style={[styles.addButton, { borderColor: BrandColors.green }]}>
                    <Feather name="plus-circle" size={22} color={BrandColors.green} />
                    <ThemedText type="body" style={{ color: BrandColors.green, marginLeft: Spacing.sm }}>
                      Add New Address
                    </ThemedText>
                  </View>
                </Pressable>
              </Animated.View>
            ) : null}
          </>
        }
        ListEmptyComponent={isLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color={BrandColors.green} />
          </View>
        ) : renderEmptyState()}
        ListFooterComponent={<LiveAgentBanner />}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    alignItems: "center",
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderStyle: "dashed",
    marginBottom: Spacing.lg,
  },
  addressCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  addressContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  addressIcon: {
    marginRight: Spacing.md,
  },
  iconGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  addressDetails: {
    flex: 1,
  },
  defaultBadge: {
    marginTop: Spacing.xs,
  },
  deleteButton: {
    padding: Spacing.sm,
  },
  addFormCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  input: {
    height: 50,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  cityInput: {
    flex: 2,
  },
  zipInput: {
    flex: 1,
  },
  formButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  cancelButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing.xl * 2,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingState: {
    paddingVertical: Spacing.xl * 2,
    alignItems: "center",
  },
});
