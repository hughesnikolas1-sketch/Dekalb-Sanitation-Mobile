import { Platform } from "react-native";

// Futuristic 4D Theme - Bright, Inviting Neon Colors
const neonCyan = "#00E5FF";
const neonCyanDark = "#00B8D4";
const neonMagenta = "#E040FB";
const neonMagentaDark = "#AA00FF";
const neonGreen = "#00E676";
const neonGreenDark = "#00C853";
const neonBlue = "#2979FF";
const neonBlueDark = "#2962FF";
const neonOrange = "#FF9100";
const neonYellow = "#FFEA00";
const electricPurple = "#7C4DFF";
const glowWhite = "#F0F4FF";

// Service category colors - bright and inviting
const residentialBlue = "#00B0FF";
const residentialBlueDark = "#0091EA";
const commercialGreen = "#00E676";
const commercialGreenDark = "#00C853";

// Semantic colors for waste types
export const WasteColors = {
  trash: "#78909C",
  recycling: neonBlue,
  yardWaste: neonGreen,
  alert: "#FF5252",
  warning: neonOrange,
};

// Brand colors for easy access - Futuristic palette
export const BrandColors = {
  blue: residentialBlue,
  blueDark: residentialBlueDark,
  blueLight: neonCyan,
  green: commercialGreen,
  greenDark: commercialGreenDark,
  greenLight: "#69F0AE",
  residential: residentialBlue,
  commercial: commercialGreen,
  accent: neonMagenta,
  glow: neonCyan,
};

// Green and Blue gradient presets - main theme colors
export const FuturisticGradients: Record<string, string[]> = {
  primary: ["#1565C0", "#1976D2", "#42A5F5"],
  secondary: ["#2E7D32", "#43A047", "#66BB6A"],
  residential: ["#1565C0", "#1976D2", "#42A5F5"],
  commercial: ["#2E7D32", "#43A047", "#66BB6A"],
  hero: ["#1565C0", "#2E7D32", "#43A047"],
  card: ["#0D47A1", "#1565C0", "#1976D2"],
  greenBlue: ["#2E7D32", "#00897B", "#1565C0"],
  ocean: ["#0277BD", "#00ACC1", "#26A69A"],
  nature: ["#2E7D32", "#388E3C", "#4CAF50"],
  celebration: ["#00E5FF", "#E040FB", "#7C4DFF"],
  sunset: ["#FF6B6B", "#FF8E53", "#FFEA00"],
  aurora: ["#00E676", "#00B8D4", "#7C4DFF"],
};

export const Colors = {
  light: {
    text: "#1A1A2E",
    textSecondary: "#4A4A6A",
    buttonText: "#FFFFFF",
    tabIconDefault: "#7986CB",
    tabIconSelected: neonBlue,
    link: neonBlue,
    primary: residentialBlue,
    primaryDark: residentialBlueDark,
    secondary: commercialGreen,
    secondaryDark: commercialGreenDark,
    accent: neonMagenta,
    backgroundRoot: "#FAFBFF",
    backgroundDefault: "#F0F4FF",
    backgroundSecondary: "#E8EEFF",
    backgroundTertiary: "#D4DDFF",
    divider: "#C5CAE9",
    cardBorder: "#B3C0FF",
    success: neonGreen,
    error: "#FF5252",
    glow: neonCyan,
    neonCyan: neonCyan,
    neonMagenta: neonMagenta,
    neonGreen: neonGreen,
    neonBlue: neonBlue,
  },
  dark: {
    text: "#FFFFFF",
    textSecondary: "#B0BEC5",
    buttonText: "#FFFFFF",
    tabIconDefault: "#7986CB",
    tabIconSelected: neonCyan,
    link: neonCyan,
    primary: neonCyan,
    primaryDark: neonCyanDark,
    secondary: neonGreen,
    secondaryDark: neonGreenDark,
    accent: neonMagenta,
    backgroundRoot: "#0A0A1A",
    backgroundDefault: "#12122A",
    backgroundSecondary: "#1A1A3A",
    backgroundTertiary: "#252550",
    divider: "#2A2A5A",
    cardBorder: "#3D3D7A",
    success: neonGreen,
    error: "#FF5252",
    glow: neonCyan,
    neonCyan: neonCyan,
    neonMagenta: neonMagenta,
    neonGreen: neonGreen,
    neonBlue: neonBlue,
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

// Futuristic glow/shadow effects
export const GlowEffects = {
  small: {
    shadowColor: neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  medium: {
    shadowColor: neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
  },
  large: {
    shadowColor: neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 25,
    elevation: 12,
  },
  neonBlue: {
    shadowColor: neonBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
  },
  neonGreen: {
    shadowColor: neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
  },
  neonMagenta: {
    shadowColor: neonMagenta,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
  },
};

// Friendly service reminder messages
export const ServiceReminders = [
  "We're here to help keep DeKalb beautiful!",
  "Your satisfaction is our priority!",
  "Questions? We're just a call away!",
  "Together, we make DeKalb shine!",
  "Thank you for keeping DeKalb green!",
  "We appreciate you choosing DeKalb Sanitation!",
  "Happy to serve our community!",
  "Making waste management easy for you!",
  "Your neighbors trust us, and so can you!",
  "Cleaner streets, happier community!",
];

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
