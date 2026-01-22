import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
  Platform,
  Linking,
  KeyboardAvoidingView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeInUp, ZoomIn } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { FloatingParticles } from "@/components/FloatingParticles";
import { LiveChatButton } from "@/components/LiveChatButton";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, getApiUrl } from "@/lib/query-client";
import {
  Spacing,
  BorderRadius,
  BrandColors,
  FuturisticGradients,
} from "@/constants/theme";

const showAlert = (title: string, message: string, buttons?: any[]) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message, buttons);
  }
};

type Step = "info" | "applicant" | "verification" | "physician" | "confirm";

export default function DisabledServiceScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation();

  const [currentStep, setCurrentStep] = useState<Step>("info");
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "",
    telephone: user?.phone || "",
    residentialAddress: user?.serviceAddress || "",
    residenceType: "" as "rent" | "own" | "",
    cartLocation: "" as "garage" | "side" | "other" | "",
    cartLocationOther: "",
    applicantSignature: "",
    applicantDate: new Date().toLocaleDateString(),
    notarySignature: "",
    notaryDate: "",
    patientName: "",
    functionalLimitations: "",
    disabilityType: "" as "temporary" | "permanent" | "",
    tempDisabilityFrom: "",
    tempDisabilityTo: "",
    physicianName: "",
    physicianTelephone: "",
    physicianLicense: "",
    physicianAddress: "",
    physicianCityStateZip: "",
    physicianSignature: "",
    physicianDate: "",
  });

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCall = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Linking.openURL("tel:4042942900");
  };

  const handleEmail = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Linking.openURL("mailto:CBanks@dekalbcountyga.gov");
  };

  const handleStartApplication = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCurrentStep("applicant");
  };

  const handleNextStep = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentStep === "applicant") {
      if (!formData.name || !formData.telephone || !formData.residentialAddress || !formData.residenceType || !formData.cartLocation) {
        showAlert("Missing Information", "Please fill in all required fields before continuing.");
        return;
      }
      setCurrentStep("verification");
    } else if (currentStep === "verification") {
      if (!formData.applicantSignature) {
        showAlert("Signature Required", "Please type your full name as your electronic signature.");
        return;
      }
      setCurrentStep("physician");
    } else if (currentStep === "physician") {
      if (!formData.physicianName || !formData.physicianTelephone || !formData.physicianLicense || !formData.disabilityType) {
        showAlert("Missing Information", "Please complete all physician information.");
        return;
      }
      setCurrentStep("confirm");
    }
  };

  const handlePreviousStep = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentStep === "applicant") setCurrentStep("info");
    else if (currentStep === "verification") setCurrentStep("applicant");
    else if (currentStep === "physician") setCurrentStep("verification");
    else if (currentStep === "confirm") setCurrentStep("physician");
  };

  const handleSubmit = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setSubmitting(true);

    try {
      const response = await apiRequest("POST", "/api/disabled-service-applications", {
        ...formData,
        userId: user?.id,
        submittedAt: new Date().toISOString(),
      });

      if (response.ok) {
        setCurrentStep("info");
        showAlert(
          "✅ Application Submitted",
          "Your application for Sanitation Service for Disabled Residents has been submitted successfully.\n\nOnce a final determination is made, you will be contacted via phone or email.\n\nThank you for your submission!",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      } else {
        throw new Error("Submission failed");
      }
    } catch (error) {
      showAlert("Submission Error", "There was a problem submitting your application. Please try again or contact Customer Care at 404.294.2900.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStepIndicator = () => {
    const steps = ["Info", "Applicant", "Verification", "Physician", "Review"];
    const currentIndex = ["info", "applicant", "verification", "physician", "confirm"].indexOf(currentStep);

    return (
      <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.stepIndicator}>
        {steps.map((step, index) => (
          <View key={step} style={styles.stepItem}>
            <View
              style={[
                styles.stepCircle,
                {
                  backgroundColor: index <= currentIndex ? BrandColors.blue : theme.backgroundSecondary,
                  borderColor: index <= currentIndex ? BrandColors.blue : theme.border,
                },
              ]}
            >
              {index < currentIndex ? (
                <Feather name="check" size={14} color="#FFFFFF" />
              ) : (
                <ThemedText style={{ color: index <= currentIndex ? "#FFFFFF" : theme.textSecondary, fontSize: 12, fontWeight: "700" }}>
                  {index + 1}
                </ThemedText>
              )}
            </View>
            <ThemedText style={[styles.stepLabel, { color: index <= currentIndex ? theme.text : theme.textSecondary }]}>
              {step}
            </ThemedText>
          </View>
        ))}
      </Animated.View>
    );
  };

  const renderInfoStep = () => (
    <Animated.View entering={FadeInDown.delay(200).duration(500)}>
      <LinearGradient
        colors={["#1565C0", "#0D47A1"] as [string, string]}
        style={styles.infoCard}
      >
        <View style={styles.infoHeader}>
          <View style={styles.iconCircle}>
            <Feather name="heart" size={32} color="#FFFFFF" />
          </View>
          <ThemedText style={styles.infoTitle}>
            ♿ Service for Disabled Residents
          </ThemedText>
        </View>

        <ThemedText style={styles.infoText}>
          Physical limitations/disabilities can affect residents' ability to place their garbage and recycling roll carts curbside for servicing.
        </ThemedText>

        <ThemedText style={styles.infoText}>
          🌟 Special collection service is available for residents with these circumstances.
        </ThemedText>

        <ThemedText style={styles.infoText}>
          📋 Residents seeking assistance should complete an application and provide the specific documentation and endorsements required for the review and processing of this application.
        </ThemedText>

        <ThemedText style={styles.infoText}>
          ✅ Once a final determination is made, the applicant will be contacted.
        </ThemedText>
      </LinearGradient>

      <View style={[styles.contactCard, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
        <ThemedText type="h4" style={styles.contactTitle}>📞 Contact Customer Care</ThemedText>
        
        <Pressable onPress={handleCall} style={[styles.contactButton, { backgroundColor: BrandColors.blue }]}>
          <Feather name="phone" size={20} color="#FFFFFF" />
          <ThemedText style={styles.contactButtonText}>Call 404.294.2900</ThemedText>
        </Pressable>

        <Pressable onPress={handleEmail} style={[styles.contactButton, { backgroundColor: BrandColors.green }]}>
          <Feather name="mail" size={20} color="#FFFFFF" />
          <ThemedText style={styles.contactButtonText}>Email CBanks@dekalbcountyga.gov</ThemedText>
        </Pressable>
      </View>

      <Pressable onPress={handleStartApplication} style={styles.startButton}>
        <LinearGradient
          colors={FuturisticGradients.commercial as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.startButtonGradient}
        >
          <Feather name="file-text" size={24} color="#FFFFFF" />
          <ThemedText style={styles.startButtonText}>📝 Start Application</ThemedText>
          <Feather name="arrow-right" size={24} color="#FFFFFF" />
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );

  const renderApplicantStep = () => (
    <Animated.View entering={FadeInDown.delay(200).duration(500)}>
      <View style={[styles.formCard, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
        <View style={styles.formHeader}>
          <LinearGradient colors={["#1565C0", "#0D47A1"] as [string, string]} style={styles.formHeaderGradient}>
            <ThemedText style={styles.formHeaderText}>👤 Applicant Information</ThemedText>
          </LinearGradient>
        </View>

        <View style={styles.formContent}>
          <View style={styles.inputGroup}>
            <ThemedText style={[styles.label, { color: theme.text }]}>Full Name *</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
              value={formData.name}
              onChangeText={(v) => updateField("name", v)}
              placeholder="Enter your full name"
              placeholderTextColor={theme.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={[styles.label, { color: theme.text }]}>Telephone # *</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
              value={formData.telephone}
              onChangeText={(v) => updateField("telephone", v)}
              placeholder="(xxx) xxx-xxxx"
              placeholderTextColor={theme.textSecondary}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={[styles.label, { color: theme.text }]}>Residential Address *</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
              value={formData.residentialAddress}
              onChangeText={(v) => updateField("residentialAddress", v)}
              placeholder="Enter your residential address"
              placeholderTextColor={theme.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={[styles.label, { color: theme.text }]}>Residence Type *</ThemedText>
            <View style={styles.radioRow}>
              <Pressable
                onPress={() => updateField("residenceType", "rent")}
                style={[styles.radioButton, formData.residenceType === "rent" && { borderColor: BrandColors.blue, backgroundColor: BrandColors.blue + "20" }]}
              >
                <View style={[styles.radioCircle, formData.residenceType === "rent" && { backgroundColor: BrandColors.blue }]} />
                <ThemedText style={{ color: theme.text }}>Rent</ThemedText>
              </Pressable>
              <Pressable
                onPress={() => updateField("residenceType", "own")}
                style={[styles.radioButton, formData.residenceType === "own" && { borderColor: BrandColors.blue, backgroundColor: BrandColors.blue + "20" }]}
              >
                <View style={[styles.radioCircle, formData.residenceType === "own" && { backgroundColor: BrandColors.blue }]} />
                <ThemedText style={{ color: theme.text }}>Own</ThemedText>
              </Pressable>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={[styles.label, { color: theme.text }]}>Garbage Roll Cart Location *</ThemedText>
            <View style={styles.radioColumn}>
              <Pressable
                onPress={() => updateField("cartLocation", "garage")}
                style={[styles.radioButton, formData.cartLocation === "garage" && { borderColor: BrandColors.green, backgroundColor: BrandColors.green + "20" }]}
              >
                <View style={[styles.radioCircle, formData.cartLocation === "garage" && { backgroundColor: BrandColors.green }]} />
                <ThemedText style={{ color: theme.text }}>🏠 Next to garage/carport</ThemedText>
              </Pressable>
              <Pressable
                onPress={() => updateField("cartLocation", "side")}
                style={[styles.radioButton, formData.cartLocation === "side" && { borderColor: BrandColors.green, backgroundColor: BrandColors.green + "20" }]}
              >
                <View style={[styles.radioCircle, formData.cartLocation === "side" && { backgroundColor: BrandColors.green }]} />
                <ThemedText style={{ color: theme.text }}>🏡 Side of house</ThemedText>
              </Pressable>
              <Pressable
                onPress={() => updateField("cartLocation", "other")}
                style={[styles.radioButton, formData.cartLocation === "other" && { borderColor: BrandColors.green, backgroundColor: BrandColors.green + "20" }]}
              >
                <View style={[styles.radioCircle, formData.cartLocation === "other" && { backgroundColor: BrandColors.green }]} />
                <ThemedText style={{ color: theme.text }}>📍 Other</ThemedText>
              </Pressable>
            </View>
            {formData.cartLocation === "other" && (
              <TextInput
                style={[styles.input, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text, marginTop: Spacing.sm }]}
                value={formData.cartLocationOther}
                onChangeText={(v) => updateField("cartLocationOther", v)}
                placeholder="Please specify location"
                placeholderTextColor={theme.textSecondary}
              />
            )}
          </View>
        </View>
      </View>
    </Animated.View>
  );

  const renderVerificationStep = () => (
    <Animated.View entering={FadeInDown.delay(200).duration(500)}>
      <View style={[styles.formCard, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
        <View style={styles.formHeader}>
          <LinearGradient colors={["#FF9800", "#F57C00"] as [string, string]} style={styles.formHeaderGradient}>
            <ThemedText style={styles.formHeaderText}>✍️ Verification of Special Need</ThemedText>
          </LinearGradient>
        </View>

        <View style={styles.formContent}>
          <View style={[styles.affidavitBox, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
            <ThemedText style={[styles.affidavitTitle, { color: theme.text }]}>
              📜 Applicant Affidavit
            </ThemedText>
            <ThemedText style={[styles.affidavitText, { color: theme.textSecondary }]}>
              I hereby apply for exemption from the part of DeKalb County Sanitation Ordinance requiring garbage and recycling receptacles are placed at the curb for collection; and in support of this application, I submit the following affidavit:
            </ThemedText>
            <ThemedText style={[styles.affidavitText, { color: theme.text, marginTop: Spacing.md }]}>
              I, the undersigned claimant, do solemnly swear that I am a full-time resident at the above address; am disabled to the extent that I am incapable of moving my garbage or recycling container to the curb; and no able-bodied individual resides at the address above.
            </ThemedText>
            <ThemedText style={[styles.affidavitText, { color: theme.text, marginTop: Spacing.md, fontWeight: "600" }]}>
              ⚠️ I understand that the application for this service must be submitted on an annual basis, or my participation in the program will be discontinued.
            </ThemedText>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={[styles.label, { color: theme.text }]}>Electronic Signature (Type Full Name) *</ThemedText>
            <TextInput
              style={[styles.input, styles.signatureInput, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
              value={formData.applicantSignature}
              onChangeText={(v) => updateField("applicantSignature", v)}
              placeholder="Type your full legal name"
              placeholderTextColor={theme.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={[styles.label, { color: theme.text }]}>Date</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
              value={formData.applicantDate}
              editable={false}
            />
          </View>

          <View style={[styles.notaryBox, { backgroundColor: "#FFF3E0", borderColor: "#FFB74D" }]}>
            <ThemedText style={[styles.notaryTitle, { color: "#E65100" }]}>
              📋 Notary Section (Optional)
            </ThemedText>
            <ThemedText style={[styles.notaryText, { color: "#795548" }]}>
              If you have a notarized copy, you can enter the notary information here. Otherwise, you may submit without notarization and provide documentation later.
            </ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: "#FFFFFF", borderColor: "#FFB74D", color: "#5D4037", marginTop: Spacing.md }]}
              value={formData.notarySignature}
              onChangeText={(v) => updateField("notarySignature", v)}
              placeholder="Notary signature (optional)"
              placeholderTextColor="#A1887F"
            />
          </View>
        </View>
      </View>
    </Animated.View>
  );

  const renderPhysicianStep = () => (
    <Animated.View entering={FadeInDown.delay(200).duration(500)}>
      <View style={[styles.formCard, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
        <View style={styles.formHeader}>
          <LinearGradient colors={["#4CAF50", "#388E3C"] as [string, string]} style={styles.formHeaderGradient}>
            <ThemedText style={styles.formHeaderText}>🩺 Disability Statement by Physician</ThemedText>
          </LinearGradient>
        </View>

        <View style={styles.formContent}>
          <View style={[styles.noteBox, { backgroundColor: "#E8F5E9", borderColor: "#81C784" }]}>
            <ThemedText style={[styles.noteText, { color: "#2E7D32" }]}>
              ℹ️ Waived for residents with proof of permanent disability; annual self-certification form required.
            </ThemedText>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={[styles.label, { color: theme.text }]}>Patient Name *</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
              value={formData.patientName || formData.name}
              onChangeText={(v) => updateField("patientName", v)}
              placeholder="Name of disabled resident"
              placeholderTextColor={theme.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={[styles.label, { color: theme.text }]}>Functional Limitations</ThemedText>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
              value={formData.functionalLimitations}
              onChangeText={(v) => updateField("functionalLimitations", v)}
              placeholder="Describe the functional limitation(s) that preclude placement of container(s) at the curb"
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={[styles.label, { color: theme.text }]}>Disability Type *</ThemedText>
            <View style={styles.radioColumn}>
              <Pressable
                onPress={() => updateField("disabilityType", "temporary")}
                style={[styles.radioButton, formData.disabilityType === "temporary" && { borderColor: BrandColors.blue, backgroundColor: BrandColors.blue + "20" }]}
              >
                <View style={[styles.radioCircle, formData.disabilityType === "temporary" && { backgroundColor: BrandColors.blue }]} />
                <ThemedText style={{ color: theme.text }}>⏱️ Temporary Nature</ThemedText>
              </Pressable>
              {formData.disabilityType === "temporary" && (
                <View style={styles.dateRow}>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={[styles.smallLabel, { color: theme.textSecondary }]}>From:</ThemedText>
                    <TextInput
                      style={[styles.input, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
                      value={formData.tempDisabilityFrom}
                      onChangeText={(v) => updateField("tempDisabilityFrom", v)}
                      placeholder="MM/DD/YYYY"
                      placeholderTextColor={theme.textSecondary}
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: Spacing.md }}>
                    <ThemedText style={[styles.smallLabel, { color: theme.textSecondary }]}>To:</ThemedText>
                    <TextInput
                      style={[styles.input, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
                      value={formData.tempDisabilityTo}
                      onChangeText={(v) => updateField("tempDisabilityTo", v)}
                      placeholder="MM/DD/YYYY"
                      placeholderTextColor={theme.textSecondary}
                    />
                  </View>
                </View>
              )}
              <Pressable
                onPress={() => updateField("disabilityType", "permanent")}
                style={[styles.radioButton, formData.disabilityType === "permanent" && { borderColor: BrandColors.green, backgroundColor: BrandColors.green + "20" }]}
              >
                <View style={[styles.radioCircle, formData.disabilityType === "permanent" && { backgroundColor: BrandColors.green }]} />
                <ThemedText style={{ color: theme.text }}>♾️ Permanent Nature</ThemedText>
              </Pressable>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <ThemedText type="h4" style={[styles.sectionSubtitle, { color: theme.text }]}>
            👨‍⚕️ Physician Information
          </ThemedText>

          <View style={styles.inputGroup}>
            <ThemedText style={[styles.label, { color: theme.text }]}>Physician Name *</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
              value={formData.physicianName}
              onChangeText={(v) => updateField("physicianName", v)}
              placeholder="Dr. Full Name"
              placeholderTextColor={theme.textSecondary}
            />
          </View>

          <View style={styles.rowInputs}>
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.label, { color: theme.text }]}>Telephone # *</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
                value={formData.physicianTelephone}
                onChangeText={(v) => updateField("physicianTelephone", v)}
                placeholder="(xxx) xxx-xxxx"
                placeholderTextColor={theme.textSecondary}
                keyboardType="phone-pad"
              />
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <ThemedText style={[styles.label, { color: theme.text }]}>License # *</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
                value={formData.physicianLicense}
                onChangeText={(v) => updateField("physicianLicense", v)}
                placeholder="License number"
                placeholderTextColor={theme.textSecondary}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={[styles.label, { color: theme.text }]}>Address</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
              value={formData.physicianAddress}
              onChangeText={(v) => updateField("physicianAddress", v)}
              placeholder="Physician's address"
              placeholderTextColor={theme.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={[styles.label, { color: theme.text }]}>City/State/Zip</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
              value={formData.physicianCityStateZip}
              onChangeText={(v) => updateField("physicianCityStateZip", v)}
              placeholder="City, State ZIP"
              placeholderTextColor={theme.textSecondary}
            />
          </View>
        </View>
      </View>
    </Animated.View>
  );

  const renderConfirmStep = () => (
    <Animated.View entering={FadeInDown.delay(200).duration(500)}>
      <View style={[styles.formCard, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
        <View style={styles.formHeader}>
          <LinearGradient colors={["#9C27B0", "#7B1FA2"] as [string, string]} style={styles.formHeaderGradient}>
            <ThemedText style={styles.formHeaderText}>📋 Review Your Application</ThemedText>
          </LinearGradient>
        </View>

        <View style={styles.formContent}>
          <View style={[styles.reviewSection, { borderColor: theme.border }]}>
            <ThemedText style={[styles.reviewTitle, { color: BrandColors.blue }]}>👤 Applicant</ThemedText>
            <ThemedText style={{ color: theme.text }}>{formData.name}</ThemedText>
            <ThemedText style={{ color: theme.textSecondary }}>{formData.telephone}</ThemedText>
            <ThemedText style={{ color: theme.textSecondary }}>{formData.residentialAddress}</ThemedText>
            <ThemedText style={{ color: theme.textSecondary }}>
              {formData.residenceType === "rent" ? "Renting" : "Owner"} | Cart: {formData.cartLocation === "garage" ? "Garage/Carport" : formData.cartLocation === "side" ? "Side of House" : formData.cartLocationOther}
            </ThemedText>
          </View>

          <View style={[styles.reviewSection, { borderColor: theme.border }]}>
            <ThemedText style={[styles.reviewTitle, { color: "#FF9800" }]}>✍️ Verification</ThemedText>
            <ThemedText style={{ color: theme.text }}>Signed by: {formData.applicantSignature}</ThemedText>
            <ThemedText style={{ color: theme.textSecondary }}>Date: {formData.applicantDate}</ThemedText>
          </View>

          <View style={[styles.reviewSection, { borderColor: theme.border }]}>
            <ThemedText style={[styles.reviewTitle, { color: BrandColors.green }]}>🩺 Disability Info</ThemedText>
            <ThemedText style={{ color: theme.text }}>Patient: {formData.patientName || formData.name}</ThemedText>
            <ThemedText style={{ color: theme.textSecondary }}>
              Type: {formData.disabilityType === "permanent" ? "♾️ Permanent" : `⏱️ Temporary (${formData.tempDisabilityFrom} - ${formData.tempDisabilityTo})`}
            </ThemedText>
            {formData.functionalLimitations ? (
              <ThemedText style={{ color: theme.textSecondary }}>Limitations: {formData.functionalLimitations}</ThemedText>
            ) : null}
          </View>

          <View style={[styles.reviewSection, { borderColor: theme.border }]}>
            <ThemedText style={[styles.reviewTitle, { color: "#9C27B0" }]}>👨‍⚕️ Physician</ThemedText>
            <ThemedText style={{ color: theme.text }}>{formData.physicianName}</ThemedText>
            <ThemedText style={{ color: theme.textSecondary }}>Tel: {formData.physicianTelephone}</ThemedText>
            <ThemedText style={{ color: theme.textSecondary }}>License: {formData.physicianLicense}</ThemedText>
            {formData.physicianAddress ? (
              <ThemedText style={{ color: theme.textSecondary }}>{formData.physicianAddress}, {formData.physicianCityStateZip}</ThemedText>
            ) : null}
          </View>

          <View style={[styles.submitNotice, { backgroundColor: "#E3F2FD", borderColor: BrandColors.blue }]}>
            <Feather name="info" size={20} color={BrandColors.blue} />
            <ThemedText style={{ color: BrandColors.blue, flex: 1, marginLeft: Spacing.sm }}>
              By submitting this application, you certify that all information provided is accurate and complete.
            </ThemedText>
          </View>
        </View>
      </View>
    </Animated.View>
  );

  const renderNavigationButtons = () => (
    <View style={styles.navButtons}>
      {currentStep !== "info" && (
        <Pressable onPress={handlePreviousStep} style={[styles.navButton, styles.backButton, { borderColor: theme.border }]}>
          <Feather name="arrow-left" size={20} color={theme.text} />
          <ThemedText style={{ color: theme.text, marginLeft: Spacing.xs }}>Back</ThemedText>
        </Pressable>
      )}
      
      {currentStep === "confirm" ? (
        <Pressable onPress={handleSubmit} disabled={submitting} style={[styles.navButton, styles.submitButton, submitting && { opacity: 0.6 }]}>
          <LinearGradient
            colors={["#4CAF50", "#388E3C"] as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitGradient}
          >
            <Feather name="send" size={20} color="#FFFFFF" />
            <ThemedText style={styles.submitText}>{submitting ? "Submitting..." : "✅ Submit Application"}</ThemedText>
          </LinearGradient>
        </Pressable>
      ) : currentStep !== "info" ? (
        <Pressable onPress={handleNextStep} style={[styles.navButton, styles.nextButton]}>
          <LinearGradient
            colors={[BrandColors.blue, "#0D47A1"] as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.nextGradient}
          >
            <ThemedText style={styles.nextText}>Next</ThemedText>
            <Feather name="arrow-right" size={20} color="#FFFFFF" />
          </LinearGradient>
        </Pressable>
      ) : null}
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <FloatingParticles count={8} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={headerHeight}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingTop: headerHeight + Spacing.md,
            paddingBottom: insets.bottom + Spacing.xl + 80,
            paddingHorizontal: Spacing.lg,
          }}
          showsVerticalScrollIndicator={false}
        >
          {currentStep !== "info" && renderStepIndicator()}

          {currentStep === "info" && renderInfoStep()}
          {currentStep === "applicant" && renderApplicantStep()}
          {currentStep === "verification" && renderVerificationStep()}
          {currentStep === "physician" && renderPhysicianStep()}
          {currentStep === "confirm" && renderConfirmStep()}

          {renderNavigationButtons()}
        </ScrollView>
      </KeyboardAvoidingView>
      <LiveChatButton />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stepIndicator: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.xs,
  },
  stepItem: {
    alignItems: "center",
    flex: 1,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  stepLabel: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: "500",
  },
  infoCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  infoTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    flex: 1,
  },
  infoText: {
    fontSize: 16,
    color: "#FFFFFF",
    lineHeight: 24,
    marginBottom: Spacing.md,
  },
  contactCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  contactTitle: {
    marginBottom: Spacing.md,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  contactButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: Spacing.sm,
  },
  startButton: {
    marginTop: Spacing.md,
  },
  startButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginHorizontal: Spacing.md,
  },
  formCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: Spacing.lg,
  },
  formHeader: {
    overflow: "hidden",
  },
  formHeaderGradient: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  formHeaderText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },
  formContent: {
    padding: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  smallLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 16,
    minHeight: 48,
  },
  signatureInput: {
    fontStyle: "italic",
    fontWeight: "500",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  radioRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  radioColumn: {
    gap: Spacing.sm,
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: "transparent",
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#9E9E9E",
    marginRight: Spacing.sm,
  },
  dateRow: {
    flexDirection: "row",
    paddingLeft: Spacing.xl,
    marginTop: Spacing.sm,
  },
  rowInputs: {
    flexDirection: "row",
    marginBottom: Spacing.md,
  },
  affidavitBox: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  affidavitTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: Spacing.sm,
  },
  affidavitText: {
    fontSize: 14,
    lineHeight: 22,
  },
  notaryBox: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginTop: Spacing.lg,
  },
  notaryTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: Spacing.xs,
  },
  notaryText: {
    fontSize: 13,
    lineHeight: 20,
  },
  noteBox: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  noteText: {
    fontSize: 14,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.lg,
  },
  sectionSubtitle: {
    marginBottom: Spacing.md,
  },
  reviewSection: {
    borderBottomWidth: 1,
    paddingBottom: Spacing.md,
    marginBottom: Spacing.md,
  },
  reviewTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: Spacing.xs,
  },
  submitNotice: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  navButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Spacing.md,
  },
  navButton: {
    flex: 1,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginRight: Spacing.md,
  },
  nextButton: {
    overflow: "hidden",
    borderRadius: BorderRadius.md,
  },
  nextGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
  },
  nextText: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginRight: Spacing.xs,
  },
  submitButton: {
    overflow: "hidden",
    borderRadius: BorderRadius.md,
  },
  submitGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
  },
  submitText: {
    color: "#FFFFFF",
    fontWeight: "700",
    marginLeft: Spacing.sm,
    fontSize: 16,
  },
});
