import { View, Text } from "react-native";
import { Scale } from "@/src/components/ui/Icons";
import { colors, borderRadius, typography, spacing } from "@/src/theme";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  agentType?: string;
}

export function ChatMessage({ role, content, agentType }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <View
      style={{
        flexDirection: "row",
        gap: spacing.md,
        marginBottom: spacing.lg,
        justifyContent: isUser ? "flex-end" : "flex-start",
      }}
    >
      {!isUser && (
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: borderRadius.lg,
            backgroundColor: "rgba(201, 168, 76, 0.1)",
            borderWidth: 1,
            borderColor: "rgba(201, 168, 76, 0.3)",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 4,
          }}
        >
          <Scale width={16} height={16} color={colors.accent} />
        </View>
      )}

      <View style={{ maxWidth: "82%", gap: 4 }}>
        {!isUser && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 }}>
            <Text
              style={{
                fontSize: 10,
                fontWeight: "700",
                color: colors.accent,
                letterSpacing: 0.5,
                textTransform: "uppercase",
              }}
            >
              JurisAI
            </Text>
            {agentType && (
              <View
                style={{
                  backgroundColor: colors.muted,
                  borderRadius: borderRadius.full,
                  paddingHorizontal: 6,
                  paddingVertical: 1,
                }}
              >
                <Text style={{ fontSize: 9, color: colors.mutedForeground, fontWeight: "500" }}>
                  {agentType}
                </Text>
              </View>
            )}
          </View>
        )}

        <View
          style={{
            borderRadius: borderRadius.xl,
            borderBottomLeftRadius: isUser ? borderRadius.xl : borderRadius.sm,
            borderBottomRightRadius: isUser ? borderRadius.sm : borderRadius.xl,
            backgroundColor: isUser ? colors.primary : colors.navy900,
            paddingHorizontal: 14,
            paddingVertical: 10,
          }}
        >
          <Text
            style={{
              color: colors.foreground,
              fontSize: 15,
              lineHeight: 22,
            }}
          >
            {content}
          </Text>
        </View>
      </View>
    </View>
  );
}
