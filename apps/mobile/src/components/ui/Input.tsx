import { TextInput, type TextInputProps, StyleSheet } from "react-native";
import { colors, borderRadius, typography } from "@/src/theme";

interface InputProps extends TextInputProps {
  variant?: "default" | "chat";
}

export function Input({ variant = "default", style, ...props }: InputProps) {
  return (
    <TextInput
      placeholderTextColor={colors.textDim}
      style={[
        variant === "chat" ? chatStyle : defaultStyle,
        style,
      ]}
      {...props}
    />
  );
}

const defaultStyle = {
  backgroundColor: colors.muted,
  color: colors.foreground,
  borderRadius: borderRadius.md,
  borderWidth: 1,
  borderColor: colors.border,
  paddingHorizontal: 12,
  paddingVertical: 10,
  fontSize: 15,
  fontFamily: typography.fontFamily,
};

const chatStyle = {
  backgroundColor: colors.navy800,
  color: colors.foreground,
  borderRadius: borderRadius.xl,
  borderWidth: 1,
  borderColor: colors.border,
  paddingHorizontal: 16,
  paddingVertical: 12,
  fontSize: 15,
  fontFamily: typography.fontFamily,
  maxHeight: 120,
};
