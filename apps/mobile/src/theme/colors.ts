export const colors = {
  background: "#050d1a",
  foreground: "#e5e7eb",

  card: "#0a1628",
  cardForeground: "#e5e7eb",
  cardElevated: "#0f2040",

  popover: "#0a1628",
  popoverForeground: "#e5e7eb",

  primary: "#2a4f96",
  primaryForeground: "#ffffff",
  primaryLight: "#4a72c4",

  secondary: "#162d58",
  secondaryForeground: "#e5e7eb",

  muted: "#0f2040",
  mutedForeground: "#7aa0d8",

  accent: "#c9a84c",
  accentForeground: "#050d1a",

  destructive: "#ef4444",
  destructiveForeground: "#ffffff",

  border: "#162d58",
  input: "#162d58",
  ring: "#2a4f96",

  gold: "#c9a84c",
  goldLight: "#d4b85a",
  navy900: "#0a1628",
  navy800: "#0f2040",
  navy700: "#162d58",

  textWhite: "#ffffff",
  textLight: "#d4e4f7",
  textMuted: "#7aa0d8",
  textDim: "#4a72c4",

  success: "#22c55e",
  warning: "#fbbf24",
  error: "#ef4444",
  info: "#3b82f6",
} as const;

export type ColorKey = keyof typeof colors;
