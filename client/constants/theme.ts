import { Platform } from "react-native";

// Dekalb County Sanitation brand colors - Blue and Green
const primaryBlue = "#1565C0";
const primaryBlueDark = "#0D47A1";
const primaryGreen = "#2E7D32";
const primaryGreenDark = "#1B5E20";
const accentBlue = "#42A5F5";
const accentGreen = "#66BB6A";

// Semantic colors for waste types
export const WasteColors = {
  trash: "#424242",
  recycling: primaryBlue,
  yardWaste: primaryGreen,
  alert: "#D32F2F",
  warning: "#F57C00",
};

// Brand colors for easy access
export const BrandColors = {
  blue: primaryBlue,
  blueDark: primaryBlueDark,
  blueLight: accentBlue,
  green: primaryGreen,
  greenDark: primaryGreenDark,
  greenLight: accentGreen,
};

export const Colors = {
  light: {
    text: "#212121",
    textSecondary: "#616161",
    buttonText: "#FFFFFF",
    tabIconDefault: "#687076",
    tabIconSelected: primaryBlue,
    link: primaryBlue,
    primary: primaryBlue,
    primaryDark: primaryBlueDark,
    secondary: primaryGreen,
    secondaryDark: primaryGreenDark,
    backgroundRoot: "#FFFFFF",
    backgroundDefault: "#F8F9FA",
    backgroundSecondary: "#ECEFF1",
    backgroundTertiary: "#E0E0E0",
    divider: "#E0E0E0",
    cardBorder: "#E0E0E0",
    success: primaryGreen,
    error: "#D32F2F",
  },
  dark: {
    text: "#FFFFFF",
    textSecondary: "#B3B3B3",
    buttonText: "#FFFFFF",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: accentBlue,
    link: accentBlue,
    primary: accentBlue,
    primaryDark: primaryBlue,
    secondary: accentGreen,
    secondaryDark: primaryGreen,
    backgroundRoot: "#121212",
    backgroundDefault: "#1E1E1E",
    backgroundSecondary: "#252525",
    backgroundTertiary: "#2C2C2C",
    divider: "#2C2C2C",
    cardBorder: "#333333",
    success: accentGreen,
    error: "#EF5350",
  },
};

// Senior-friendly spacing - larger tap targets
export const Spacing = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  "2xl": 32,
  "3xl": 40,
  "4xl": 48,
  "5xl": 56,
  inputHeight: 56,
  buttonHeight: 60,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  "2xl": 32,
  "3xl": 40,
  full: 9999,
};

// Senior-friendly typography - larger, more readable fonts
export const Typography = {
  h1: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 26,
    lineHeight: 34,
    fontWeight: "600" as const,
  },
  h3: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "400" as const,
  },
  link: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "500" as const,
  },
  button: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "600" as const,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
