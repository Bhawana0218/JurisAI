import { Platform } from "react-native";

const fontFamily = Platform.select({
  ios: "System",
  android: "Roboto",
  default: "System",
});

const monoFamily = Platform.select({
  ios: "Menlo",
  android: "monospace",
  default: "monospace",
});

export const typography = {
  fontFamily,
  monoFamily,

  h1: { fontSize: 28, fontWeight: "700" as const, letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: "700" as const, letterSpacing: -0.3 },
  h3: { fontSize: 18, fontWeight: "600" as const, letterSpacing: -0.2 },
  h4: { fontSize: 16, fontWeight: "600" as const },
  body: { fontSize: 15, fontWeight: "400" as const },
  bodySmall: { fontSize: 13, fontWeight: "400" as const },
  caption: { fontSize: 12, fontWeight: "400" as const },
  captionBold: { fontSize: 12, fontWeight: "600" as const },
  overline: { fontSize: 10, fontWeight: "600" as const, letterSpacing: 1 },
  mono: { fontFamily: monoFamily, fontSize: 13 },
  button: { fontSize: 15, fontWeight: "600" as const },
  buttonSmall: { fontSize: 13, fontWeight: "600" as const },
  tabLabel: { fontSize: 10, fontWeight: "500" as const },
} as const;
