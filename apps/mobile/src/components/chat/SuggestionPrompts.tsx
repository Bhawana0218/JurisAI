import { View, Text, TouchableOpacity } from "react-native";
import { Scale, Shield, BookOpen, FileText } from "@/src/components/ui/Icons";
import { colors, borderRadius, spacing, typography } from "@/src/theme";

const SUGGESTIONS = [
  { icon: Shield, text: "How do I file an FIR for cybercrime?" },
  { icon: Scale, text: "What are my consumer rights for a defective product?" },
  { icon: BookOpen, text: "Steps to file a domestic violence complaint" },
  { icon: FileText, text: "Explain the court procedure for a civil case" },
];

interface SuggestionPromptsProps {
  onSelect: (text: string) => void;
}

export function SuggestionPrompts({ onSelect }: SuggestionPromptsProps) {
  return (
    <View style={{ gap: spacing.sm, paddingHorizontal: spacing.lg }}>
      <Text
        style={{
          color: colors.mutedForeground,
          fontSize: 13,
          fontWeight: "500",
          textAlign: "center",
          marginBottom: spacing.sm,
        }}
      >
        Try asking about
      </Text>
      {SUGGESTIONS.map((item, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => onSelect(item.text)}
          activeOpacity={0.7}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,
            backgroundColor: colors.navy800,
            borderRadius: borderRadius.xl,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: spacing.lg,
            paddingVertical: 14,
          }}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: borderRadius.lg,
              backgroundColor: "rgba(42, 79, 150, 0.2)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <item.icon width={18} height={18} color={colors.primary} />
          </View>
          <Text
            style={{
              flex: 1,
              color: colors.foreground,
              fontSize: 14,
              lineHeight: 20,
            }}
          >
            {item.text}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
