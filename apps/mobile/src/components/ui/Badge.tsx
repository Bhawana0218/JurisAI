import { View, Text } from "react-native";
import { colors, borderRadius, typography, spacing } from "@/src/theme";

interface BadgeProps {
  label: string;
  variant?: "default" | "primary" | "gold" | "success" | "warning" | "error" | "muted";
  size?: "sm" | "md";
}

const variantMap = {
  default: { bg: colors.muted, text: colors.foreground },
  primary: { bg: colors.primary, text: colors.primaryForeground },
  gold: { bg: colors.accent, text: colors.accentForeground },
  success: { bg: "#052e16", text: colors.success },
  warning: { bg: "#451a03", text: colors.warning },
  error: { bg: "#450a0a", text: colors.error },
  muted: { bg: colors.muted, text: colors.mutedForeground },
};

export function Badge({ label, variant = "default", size = "sm" }: BadgeProps) {
  const v = variantMap[variant];
  const isSm = size === "sm";

  return (
    <View
      style={{
        backgroundColor: v.bg,
        borderRadius: borderRadius.full,
        paddingHorizontal: isSm ? 8 : 12,
        paddingVertical: isSm ? 2 : 4,
        alignSelf: "flex-start",
      }}
    >
      <Text
        style={{
          color: v.text,
          fontSize: isSm ? 10 : 12,
          fontWeight: "600",
          letterSpacing: 0.5,
          textTransform: "uppercase",
        }}
      >
        {label}
      </Text>
    </View>
  );
}
