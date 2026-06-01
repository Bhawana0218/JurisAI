import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  type TouchableOpacityProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { colors, borderRadius, typography, spacing } from "@/src/theme";

interface ButtonProps extends TouchableOpacityProps {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "gold";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const sizeMap = {
  sm: { py: 8, px: 12, text: typography.buttonSmall },
  md: { py: 12, px: 20, text: typography.button },
  lg: { py: 16, px: 24, text: typography.button },
};

export function Button({
  variant = "primary",
  size = "md",
  loading,
  disabled,
  style,
  children,
  ...props
}: ButtonProps) {
  const s = sizeMap[size];

  const bg: Record<string, string> = {
    primary: colors.primary,
    secondary: colors.secondary,
    ghost: "transparent",
    outline: "transparent",
    gold: colors.accent,
  };

  const txtColor: Record<string, string> = {
    primary: colors.primaryForeground,
    secondary: colors.secondaryForeground,
    ghost: colors.primary,
    outline: colors.primary,
    gold: colors.accentForeground,
  };

  const border: Record<string, string | undefined> = {
    primary: undefined,
    secondary: undefined,
    ghost: undefined,
    outline: colors.border,
    gold: undefined,
  };

  return (
    <TouchableOpacity
      disabled={disabled || loading}
      style={
        {
          backgroundColor: bg[variant],
          borderRadius: borderRadius.lg,
          paddingVertical: s.py,
          paddingHorizontal: s.px,
          borderWidth: border[variant] ? 1 : 0,
          borderColor: border[variant],
          opacity: disabled ? 0.5 : 1,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: spacing.sm,
        } as StyleProp<ViewStyle>
      }
      {...props}
    >
      {loading && <ActivityIndicator size="small" color={txtColor[variant]} />}
      <Text style={[s.text, { color: txtColor[variant] }]}>{children}</Text>
    </TouchableOpacity>
  );
}
