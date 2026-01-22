import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BrandColors, Spacing, BorderRadius, FuturisticGradients } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";

const PRORATED_FEES = [
  { month: "January", oneRecycling: "315.00", twoRecycling: "340.00" },
  { month: "February", oneRecycling: "288.75", twoRecycling: "311.67" },
  { month: "March", oneRecycling: "262.50", twoRecycling: "283.33" },
  { month: "April", oneRecycling: "236.25", twoRecycling: "255.00" },
  { month: "May", oneRecycling: "210.00", twoRecycling: "226.67" },
  { month: "June", oneRecycling: "183.75", twoRecycling: "198.33" },
  { month: "July", oneRecycling: "157.50", twoRecycling: "170.00" },
  { month: "August", oneRecycling: "131.25", twoRecycling: "141.67" },
  { month: "September", oneRecycling: "105.00", twoRecycling: "113.33" },
  { month: "October", oneRecycling: "78.75", twoRecycling: "85.00" },
  { month: "November", oneRecycling: "52.50", twoRecycling: "56.67" },
  { month: "December 1-10", oneRecycling: "26.25", twoRecycling: "28.34" },
  { month: "December 11-31", oneRecycling: "315.00", twoRecycling: "340.00" },
];

export default function ProratedFeesScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundDefault }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingTop: headerHeight + Spacing.md, paddingBottom: insets.bottom + Spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={FuturisticGradients.blueGreen as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerCard}
        >
          <Feather name="dollar-sign" size={40} color="#FFF" style={{ marginBottom: Spacing.sm }} />
          <ThemedText type="h2" style={styles.headerTitle}>
            RESIDENTIAL SANITATION ASSESSMENT FEES
          </ThemedText>
          <ThemedText type="body" style={styles.headerSubtitle}>
            New Customers – Prorated Fees
          </ThemedText>
        </LinearGradient>

        <View style={[styles.noticeCard, { backgroundColor: BrandColors.green + "15", borderColor: BrandColors.green }]}>
          <Feather name="info" size={20} color={BrandColors.green} />
          <ThemedText type="body" style={{ color: BrandColors.green, marginLeft: Spacing.sm, flex: 1 }}>
            The full $315 annual assessment fee applies after December 10
          </ThemedText>
        </View>

        <View style={[styles.tableContainer, { backgroundColor: theme.backgroundSecondary, borderColor: theme.divider }]}>
          <View style={[styles.tableHeader, { backgroundColor: BrandColors.green }]}>
            <View style={styles.monthColumn}>
              <ThemedText type="h4" style={styles.tableHeaderText}>
                Month Requested
              </ThemedText>
            </View>
            <View style={styles.feeColumn}>
              <ThemedText type="small" style={styles.tableHeaderText}>
                One 95-Gallon Garbage Cart
              </ThemedText>
              <ThemedText type="small" style={styles.tableHeaderTextBold}>
                One Recycling Cart
              </ThemedText>
            </View>
            <View style={styles.feeColumn}>
              <ThemedText type="small" style={styles.tableHeaderText}>
                One 95-Gallon Garbage Cart
              </ThemedText>
              <ThemedText type="small" style={styles.tableHeaderTextBold}>
                Two Recycling Carts
              </ThemedText>
              <ThemedText type="caption" style={styles.tableHeaderCaption}>
                ($25 cart fee additional)
              </ThemedText>
            </View>
          </View>

          {PRORATED_FEES.map((row, index) => (
            <View
              key={row.month}
              style={[
                styles.tableRow,
                { 
                  backgroundColor: index % 2 === 0 ? theme.backgroundDefault : theme.backgroundSecondary,
                  borderBottomColor: theme.divider,
                }
              ]}
            >
              <View style={styles.monthColumn}>
                <ThemedText 
                  type="body" 
                  style={{ 
                    color: row.month.includes("December") ? BrandColors.green : theme.text,
                    fontWeight: row.month.includes("December") ? "700" : "600",
                  }}
                >
                  {row.month}
                </ThemedText>
              </View>
              <View style={styles.feeColumn}>
                <ThemedText type="body" style={{ color: theme.text, textAlign: "center" }}>
                  ${row.oneRecycling}
                </ThemedText>
              </View>
              <View style={styles.feeColumn}>
                <ThemedText type="body" style={{ color: theme.text, textAlign: "center" }}>
                  ${row.twoRecycling}
                </ThemedText>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.footerCard, { backgroundColor: BrandColors.blue + "10", borderColor: BrandColors.blue }]}>
          <Feather name="phone" size={18} color={BrandColors.blue} />
          <View style={{ marginLeft: Spacing.sm, flex: 1 }}>
            <ThemedText type="body" style={{ color: BrandColors.blue, fontWeight: "600" }}>
              Questions about fees?
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
              Contact DeKalb County Sanitation at (404) 294-2900
            </ThemedText>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  headerCard: {
    marginHorizontal: Spacing.md,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  headerTitle: {
    color: "#FFF",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "800",
  },
  headerSubtitle: {
    color: "#FFF",
    textAlign: "center",
    marginTop: Spacing.sm,
    opacity: 0.9,
  },
  noticeCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  tableContainer: {
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: Spacing.lg,
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  tableHeaderText: {
    color: "#FFF",
    textAlign: "center",
    fontSize: 11,
  },
  tableHeaderTextBold: {
    color: "#FFF",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 11,
    marginTop: 2,
  },
  tableHeaderCaption: {
    color: "#FFF",
    textAlign: "center",
    opacity: 0.8,
    marginTop: 2,
    fontSize: 10,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 1,
  },
  monthColumn: {
    flex: 1.2,
    justifyContent: "center",
    paddingLeft: Spacing.sm,
  },
  feeColumn: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  footerCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
});
