import { View, type ViewProps, type StyleProp, type ViewStyle } from "react-native";
import { colors, borderRadius } from "@/src/theme";

interface CardProps extends ViewProps {
  variant?: "default" | "elevated" | "muted";
}

export function Card({ variant = "default", style, children, ...props }: CardProps) {
  const bg: Record<string, string> = {
    default: colors.card,
    elevated: colors.cardElevated,
    muted: colors.muted,
  };

  return (
    <View
      style={[
        {
          backgroundColor: bg[variant],
          borderRadius: borderRadius.xl,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 16,
        },
        style as StyleProp<ViewStyle>,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
