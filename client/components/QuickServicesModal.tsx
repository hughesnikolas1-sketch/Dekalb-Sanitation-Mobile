import React, { useState, useEffect } from "react";
import {
  View,
  Pressable,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Platform,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  SlideInRight,
  SlideOutRight,
} from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, BrandColors, FuturisticGradients } from "@/constants/theme";
import { getApiUrl, apiRequest } from "@/lib/query-client";

interface SavedAddress {
  id: string;
  street: string;
  aptSuite?: string;
  city: string;
  zipCode: string;
  isDefault?: boolean;
}

interface QuickServicesModalProps {
  visible: boolean;
  onClose: () => void;
}

type QuickServiceStep = 
  | "menu" 
  | "missed-type" 
  | "missed-address" 
  | "missed-success"
  | "service-day"
  | "service-day-success"
  | "account-number"
  | "account-number-success"
  | "supervisor-callback"
  | "supervisor-callback-success";

type MissedType = "yard-waste" | "recycling" | "garbage" | null;

const showAlert = (title: string, message: string) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export function QuickServicesModal({ visible, onClose }: QuickServicesModalProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<QuickServiceStep>("menu");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [missedType, setMissedType] = useState<MissedType>(null);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  
  const [problemDescription, setProblemDescription] = useState("");
  const [callbackNumber, setCallbackNumber] = useState("");

  useEffect(() => {
    loadSavedAddresses();
  }, [visible]);

  useEffect(() => {
    if (!visible) {
      setStep("menu");
      setMissedType(null);
      setSelectedAddress("");
      setProblemDescription("");
      setCallbackNumber("");
      setShowAddressDropdown(false);
    }
  }, [visible]);

  const loadSavedAddresses = async () => {
    try {
      const stored = await AsyncStorage.getItem("savedAddresses");
      if (stored) {
        setSavedAddresses(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading addresses:", error);
    }
  };

  const handleQuickServiceSelect = (service: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    switch (service) {
      case "missed":
        setStep("missed-type");
        break;
      case "service-day":
        setStep("service-day");
        break;
      case "account-number":
        setStep("account-number");
        break;
      case "supervisor":
        setStep("supervisor-callback");
        break;
    }
  };

  const handleMissedTypeSelect = (type: MissedType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMissedType(type);
    setStep("missed-address");
  };

  const submitMissedRequest = async () => {
    if (!selectedAddress || !missedType) {
      showAlert("Missing Information", "Please select an address.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/quick-service-requests", {
        type: "missed-collection",
        subType: missedType,
        address: selectedAddress,
        status: "pending",
      });
      setStep("missed-success");
    } catch (error) {
      console.error("Error submitting request:", error);
      setStep("missed-success");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitServiceDayRequest = async () => {
    if (!selectedAddress) {
      showAlert("Missing Information", "Please select an address.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/quick-service-requests", {
        type: "service-day-inquiry",
        address: selectedAddress,
        status: "pending",
      });
      setStep("service-day-success");
    } catch (error) {
      console.error("Error submitting request:", error);
      setStep("service-day-success");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitAccountNumberRequest = async () => {
    if (!selectedAddress) {
      showAlert("Missing Information", "Please select an address.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/quick-service-requests", {
        type: "account-number-request",
        address: selectedAddress,
        status: "pending",
      });
      setStep("account-number-success");
    } catch (error) {
      console.error("Error submitting request:", error);
      setStep("account-number-success");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitSupervisorCallback = async () => {
    if (!problemDescription.trim() || !callbackNumber.trim()) {
      showAlert("Missing Information", "Please provide a problem description and callback number.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/quick-service-requests", {
        type: "supervisor-callback",
        problemDescription: problemDescription.trim(),
        callbackNumber: callbackNumber.trim(),
        status: "pending",
      });
      setStep("supervisor-callback-success");
    } catch (error) {
      console.error("Error submitting request:", error);
      setStep("supervisor-callback-success");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderMenu = () => (
    <Animated.View entering={FadeIn.duration(200)}>
      <View style={styles.header}>
        <ThemedText type="h3" style={{ color: theme.text }}>
          ⚡ Quick Services
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
          Get help fast with these common requests
        </ThemedText>
      </View>

      <Pressable
        style={[styles.quickServiceItem, { backgroundColor: BrandColors.blue + "15", borderColor: BrandColors.blue + "40" }]}
        onPress={() => handleQuickServiceSelect("missed")}
      >
        <View style={[styles.quickServiceIcon, { backgroundColor: BrandColors.blue }]}>
          <Feather name="alert-circle" size={22} color="#FFFFFF" />
        </View>
        <View style={styles.quickServiceContent}>
          <ThemedText type="h4" style={{ color: BrandColors.blue }}>
            🗑️ Did You Get Missed?
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Report missed yard waste, recycling, or garbage
          </ThemedText>
        </View>
        <Feather name="chevron-right" size={20} color={BrandColors.blue} />
      </Pressable>

      <Pressable
        style={[styles.quickServiceItem, { backgroundColor: BrandColors.green + "15", borderColor: BrandColors.green + "40" }]}
        onPress={() => handleQuickServiceSelect("service-day")}
      >
        <View style={[styles.quickServiceIcon, { backgroundColor: BrandColors.green }]}>
          <Feather name="calendar" size={22} color="#FFFFFF" />
        </View>
        <View style={styles.quickServiceContent}>
          <ThemedText type="h4" style={{ color: BrandColors.green }}>
            📅 What's My Service Day?
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Find out your scheduled pickup day
          </ThemedText>
        </View>
        <Feather name="chevron-right" size={20} color={BrandColors.green} />
      </Pressable>

      <Pressable
        style={[styles.quickServiceItem, { backgroundColor: "#9C27B0" + "15", borderColor: "#9C27B0" + "40" }]}
        onPress={() => handleQuickServiceSelect("account-number")}
      >
        <View style={[styles.quickServiceIcon, { backgroundColor: "#9C27B0" }]}>
          <Feather name="hash" size={22} color="#FFFFFF" />
        </View>
        <View style={styles.quickServiceContent}>
          <ThemedText type="h4" style={{ color: "#9C27B0" }}>
            🔢 Receive Account Number
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Request your sanitation account number
          </ThemedText>
        </View>
        <Feather name="chevron-right" size={20} color="#9C27B0" />
      </Pressable>

      <Pressable
        style={[styles.quickServiceItem, { backgroundColor: "#FF5722" + "15", borderColor: "#FF5722" + "40" }]}
        onPress={() => handleQuickServiceSelect("supervisor")}
      >
        <View style={[styles.quickServiceIcon, { backgroundColor: "#FF5722" }]}>
          <Feather name="phone-call" size={22} color="#FFFFFF" />
        </View>
        <View style={styles.quickServiceContent}>
          <ThemedText type="h4" style={{ color: "#FF5722" }}>
            📞 Request Supervisor Call Back
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Have a supervisor contact you directly
          </ThemedText>
        </View>
        <Feather name="chevron-right" size={20} color="#FF5722" />
      </Pressable>
    </Animated.View>
  );

  const renderMissedType = () => (
    <Animated.View entering={SlideInRight.duration(250)} exiting={SlideOutRight.duration(200)}>
      <Pressable style={styles.backButton} onPress={() => setStep("menu")}>
        <Feather name="arrow-left" size={20} color={BrandColors.blue} />
        <ThemedText type="body" style={{ color: BrandColors.blue, marginLeft: Spacing.xs }}>Back</ThemedText>
      </Pressable>
      
      <View style={styles.header}>
        <ThemedText type="h3" style={{ color: BrandColors.blue }}>
          🗑️ Did We Miss You?
        </ThemedText>
        <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.sm }}>
          Did we miss your yard waste, recycling, or garbage?
        </ThemedText>
      </View>

      <Pressable
        style={[styles.optionCard, { borderColor: missedType === "garbage" ? BrandColors.blue : theme.divider }]}
        onPress={() => handleMissedTypeSelect("garbage")}
      >
        <View style={[styles.optionIcon, { backgroundColor: "#455A64" }]}>
          <Feather name="trash-2" size={24} color="#FFFFFF" />
        </View>
        <ThemedText type="h4" style={{ color: theme.text }}>🗑️ Garbage</ThemedText>
      </Pressable>

      <Pressable
        style={[styles.optionCard, { borderColor: missedType === "recycling" ? BrandColors.blue : theme.divider }]}
        onPress={() => handleMissedTypeSelect("recycling")}
      >
        <View style={[styles.optionIcon, { backgroundColor: BrandColors.blue }]}>
          <Feather name="refresh-cw" size={24} color="#FFFFFF" />
        </View>
        <ThemedText type="h4" style={{ color: theme.text }}>♻️ Recycling</ThemedText>
      </Pressable>

      <Pressable
        style={[styles.optionCard, { borderColor: missedType === "yard-waste" ? BrandColors.green : theme.divider }]}
        onPress={() => handleMissedTypeSelect("yard-waste")}
      >
        <View style={[styles.optionIcon, { backgroundColor: BrandColors.green }]}>
          <Feather name="feather" size={24} color="#FFFFFF" />
        </View>
        <ThemedText type="h4" style={{ color: theme.text }}>🌿 Yard Waste</ThemedText>
      </Pressable>
    </Animated.View>
  );

  const renderAddressSelector = (title: string, onSubmit: () => void, color: string) => (
    <Animated.View entering={SlideInRight.duration(250)} exiting={SlideOutRight.duration(200)}>
      <Pressable style={styles.backButton} onPress={() => setStep("menu")}>
        <Feather name="arrow-left" size={20} color={color} />
        <ThemedText type="body" style={{ color: color, marginLeft: Spacing.xs }}>Back</ThemedText>
      </Pressable>
      
      <View style={styles.header}>
        <ThemedText type="h3" style={{ color: color }}>{title}</ThemedText>
        <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.sm }}>
          Select the service address
        </ThemedText>
      </View>

      <ThemedText type="small" style={[styles.label, { color: theme.text }]}>
        📍 Service Address
      </ThemedText>
      <Pressable
        style={[styles.dropdown, { borderColor: selectedAddress ? color : theme.divider, backgroundColor: theme.backgroundSecondary }]}
        onPress={() => setShowAddressDropdown(!showAddressDropdown)}
      >
        <ThemedText type="body" style={{ color: selectedAddress ? theme.text : theme.textSecondary, flex: 1 }}>
          {selectedAddress || "Select your address..."}
        </ThemedText>
        <Feather name={showAddressDropdown ? "chevron-up" : "chevron-down"} size={20} color={theme.textSecondary} />
      </Pressable>

      {showAddressDropdown && savedAddresses.length > 0 ? (
        <View style={[styles.dropdownList, { backgroundColor: theme.backgroundSecondary, borderColor: theme.divider }]}>
          {savedAddresses.map((addr) => (
            <Pressable
              key={addr.id}
              style={[styles.dropdownItem, { borderBottomColor: theme.divider }]}
              onPress={() => {
                const fullAddr = `${addr.street}${addr.aptSuite ? `, ${addr.aptSuite}` : ""}, ${addr.city}, GA ${addr.zipCode}`;
                setSelectedAddress(fullAddr);
                setShowAddressDropdown(false);
              }}
            >
              <Feather name="map-pin" size={16} color={color} />
              <ThemedText type="body" style={{ marginLeft: Spacing.sm, flex: 1, color: theme.text }}>
                {addr.street}{addr.aptSuite ? `, ${addr.aptSuite}` : ""}, {addr.city}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      ) : showAddressDropdown ? (
        <View style={[styles.noAddresses, { backgroundColor: theme.backgroundSecondary }]}>
          <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: "center" }}>
            No saved addresses. Add addresses in your Profile.
          </ThemedText>
        </View>
      ) : null}

      <Pressable
        style={[styles.submitButton, { opacity: selectedAddress ? 1 : 0.5 }]}
        onPress={onSubmit}
        disabled={!selectedAddress || isSubmitting}
      >
        <LinearGradient
          colors={FuturisticGradients.greenBlue as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.submitGradient}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Feather name="send" size={20} color="#FFFFFF" style={{ marginRight: Spacing.sm }} />
              <ThemedText type="h4" style={{ color: "#FFFFFF" }}>Submit Request</ThemedText>
            </>
          )}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );

  const renderMissedSuccess = () => (
    <Animated.View entering={FadeInDown.duration(300)} style={styles.successContainer}>
      <View style={[styles.successIcon, { backgroundColor: BrandColors.green + "20" }]}>
        <Feather name="check-circle" size={60} color={BrandColors.green} />
      </View>
      <ThemedText type="h3" style={{ color: BrandColors.green, textAlign: "center", marginTop: Spacing.lg }}>
        ✅ Request Received!
      </ThemedText>
      <View style={[styles.successMessage, { backgroundColor: BrandColors.blue + "15" }]}>
        <ThemedText type="body" style={{ color: theme.text, textAlign: "center", lineHeight: 24 }}>
          We've acknowledged you've been missed. You've been added to our miss collection list.
        </ThemedText>
        <ThemedText type="h4" style={{ color: BrandColors.blue, textAlign: "center", marginTop: Spacing.md }}>
          📅 Please allow 1-2 business days for your request to be serviced.
        </ThemedText>
      </View>
      <Pressable style={styles.doneButton} onPress={onClose}>
        <ThemedText type="h4" style={{ color: "#FFFFFF" }}>Done</ThemedText>
      </Pressable>
    </Animated.View>
  );

  const renderServiceDaySuccess = () => (
    <Animated.View entering={FadeInDown.duration(300)} style={styles.successContainer}>
      <View style={[styles.successIcon, { backgroundColor: BrandColors.green + "20" }]}>
        <Feather name="calendar" size={60} color={BrandColors.green} />
      </View>
      <ThemedText type="h3" style={{ color: BrandColors.green, textAlign: "center", marginTop: Spacing.lg }}>
        📅 Request Submitted!
      </ThemedText>
      <View style={[styles.successMessage, { backgroundColor: BrandColors.green + "15" }]}>
        <ThemedText type="body" style={{ color: theme.text, textAlign: "center", lineHeight: 24 }}>
          We've received your request for service day information.
        </ThemedText>
        <ThemedText type="h4" style={{ color: BrandColors.green, textAlign: "center", marginTop: Spacing.md }}>
          ⏰ Please allow up to 24 hours for us to respond to your request.
        </ThemedText>
      </View>
      <Pressable style={styles.doneButton} onPress={onClose}>
        <ThemedText type="h4" style={{ color: "#FFFFFF" }}>Done</ThemedText>
      </Pressable>
    </Animated.View>
  );

  const renderAccountNumberSuccess = () => (
    <Animated.View entering={FadeInDown.duration(300)} style={styles.successContainer}>
      <View style={[styles.successIcon, { backgroundColor: "#9C27B0" + "20" }]}>
        <Feather name="hash" size={60} color="#9C27B0" />
      </View>
      <ThemedText type="h3" style={{ color: "#9C27B0", textAlign: "center", marginTop: Spacing.lg }}>
        🔢 Request Submitted!
      </ThemedText>
      <View style={[styles.successMessage, { backgroundColor: "#9C27B0" + "15" }]}>
        <ThemedText type="body" style={{ color: theme.text, textAlign: "center", lineHeight: 24 }}>
          Your request for your account number has been received.
        </ThemedText>
        <ThemedText type="h4" style={{ color: "#9C27B0", textAlign: "center", marginTop: Spacing.md }}>
          ⏰ Please allow up to 24 hours for our team to respond to your request.
        </ThemedText>
      </View>
      <Pressable style={styles.doneButton} onPress={onClose}>
        <ThemedText type="h4" style={{ color: "#FFFFFF" }}>Done</ThemedText>
      </Pressable>
    </Animated.View>
  );

  const renderSupervisorCallback = () => (
    <Animated.View entering={SlideInRight.duration(250)} exiting={SlideOutRight.duration(200)}>
      <Pressable style={styles.backButton} onPress={() => setStep("menu")}>
        <Feather name="arrow-left" size={20} color="#FF5722" />
        <ThemedText type="body" style={{ color: "#FF5722", marginLeft: Spacing.xs }}>Back</ThemedText>
      </Pressable>
      
      <View style={styles.header}>
        <ThemedText type="h3" style={{ color: "#FF5722" }}>
          📞 Request Supervisor Call Back
        </ThemedText>
        <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.sm }}>
          A supervisor will contact you to address your concern
        </ThemedText>
      </View>

      <ThemedText type="small" style={[styles.label, { color: theme.text }]}>
        📝 Brief Description of the Problem *
      </ThemedText>
      <TextInput
        style={[styles.textArea, { backgroundColor: theme.backgroundSecondary, borderColor: theme.divider, color: theme.text }]}
        placeholder="Describe your issue or concern..."
        placeholderTextColor={theme.textSecondary}
        value={problemDescription}
        onChangeText={setProblemDescription}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />

      <ThemedText type="small" style={[styles.label, { color: theme.text, marginTop: Spacing.lg }]}>
        📱 Callback Phone Number *
      </ThemedText>
      <TextInput
        style={[styles.input, { backgroundColor: theme.backgroundSecondary, borderColor: theme.divider, color: theme.text }]}
        placeholder="(XXX) XXX-XXXX"
        placeholderTextColor={theme.textSecondary}
        value={callbackNumber}
        onChangeText={setCallbackNumber}
        keyboardType="phone-pad"
      />

      <Pressable
        style={[styles.submitButton, { opacity: problemDescription.trim() && callbackNumber.trim() ? 1 : 0.5 }]}
        onPress={submitSupervisorCallback}
        disabled={!problemDescription.trim() || !callbackNumber.trim() || isSubmitting}
      >
        <LinearGradient
          colors={["#FF5722", "#FF7043"] as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.submitGradient}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Feather name="phone" size={20} color="#FFFFFF" style={{ marginRight: Spacing.sm }} />
              <ThemedText type="h4" style={{ color: "#FFFFFF" }}>Request Callback</ThemedText>
            </>
          )}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );

  const renderSupervisorSuccess = () => (
    <Animated.View entering={FadeInDown.duration(300)} style={styles.successContainer}>
      <View style={[styles.successIcon, { backgroundColor: "#FF5722" + "20" }]}>
        <Feather name="phone-call" size={60} color="#FF5722" />
      </View>
      <ThemedText type="h3" style={{ color: "#FF5722", textAlign: "center", marginTop: Spacing.lg }}>
        📞 Callback Requested!
      </ThemedText>
      <View style={[styles.successMessage, { backgroundColor: "#FF5722" + "15" }]}>
        <ThemedText type="body" style={{ color: theme.text, textAlign: "center", lineHeight: 24 }}>
          Your request for a supervisor callback has been submitted.
        </ThemedText>
        <ThemedText type="h4" style={{ color: "#FF5722", textAlign: "center", marginTop: Spacing.md }}>
          📱 A supervisor will contact you at the number provided.
        </ThemedText>
      </View>
      <Pressable style={styles.doneButton} onPress={onClose}>
        <ThemedText type="h4" style={{ color: "#FFFFFF" }}>Done</ThemedText>
      </Pressable>
    </Animated.View>
  );

  const renderContent = () => {
    switch (step) {
      case "menu":
        return renderMenu();
      case "missed-type":
        return renderMissedType();
      case "missed-address":
        return renderAddressSelector("🗑️ Report Missed Collection", submitMissedRequest, BrandColors.blue);
      case "missed-success":
        return renderMissedSuccess();
      case "service-day":
        return renderAddressSelector("📅 Request Service Day", submitServiceDayRequest, BrandColors.green);
      case "service-day-success":
        return renderServiceDaySuccess();
      case "account-number":
        return renderAddressSelector("🔢 Request Account Number", submitAccountNumberRequest, "#9C27B0");
      case "account-number-success":
        return renderAccountNumberSuccess();
      case "supervisor-callback":
        return renderSupervisorCallback();
      case "supervisor-callback-success":
        return renderSupervisorSuccess();
      default:
        return renderMenu();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View
          entering={FadeIn.duration(200)}
          style={[
            styles.modalContainer,
            {
              backgroundColor: theme.backgroundSecondary,
              marginTop: insets.top + 60,
              marginBottom: insets.bottom + 20,
            },
          ]}
          onStartShouldSetResponder={() => true}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Feather name="x" size={24} color={theme.textSecondary} />
          </Pressable>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
            bounces={true}
            nestedScrollEnabled={true}
          >
            {renderContent()}
          </ScrollView>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    paddingHorizontal: Spacing.md,
  },
  modalContainer: {
    borderRadius: BorderRadius.xl,
    maxHeight: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  closeButton: {
    position: "absolute",
    top: Spacing.md,
    right: Spacing.md,
    zIndex: 10,
    padding: Spacing.xs,
  },
  scrollView: {
    maxHeight: "100%",
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  quickServiceItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    marginBottom: Spacing.md,
  },
  quickServiceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  quickServiceContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    marginBottom: Spacing.md,
  },
  optionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  label: {
    fontWeight: "600",
    marginBottom: Spacing.sm,
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  dropdownList: {
    marginTop: Spacing.xs,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    overflow: "hidden",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  noAddresses: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xs,
  },
  input: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    fontSize: 16,
  },
  textArea: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 120,
  },
  submitButton: {
    marginTop: Spacing.xl,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  submitGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
  },
  successContainer: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  successMessage: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.lg,
    marginHorizontal: Spacing.md,
  },
  doneButton: {
    backgroundColor: BrandColors.green,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl * 2,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.xl,
  },
});
