import { useState, useRef } from "react";
import { View, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { Send } from "@/src/components/ui/Icons";
import { colors, borderRadius, spacing } from "@/src/theme";

interface ChatInputProps {
  onSend: (text: string) => void;
  loading?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, loading, placeholder = "Ask a legal question..." }: ChatInputProps) {
  const [text, setText] = useState("");
  const inputRef = useRef<TextInput>(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    onSend(trimmed);
    setText("");
    inputRef.current?.focus();
  };

  return (
    <View
      style={{
        flexDirection: "row",
        gap: spacing.sm,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.background,
      }}
    >
      <TextInput
        ref={inputRef}
        value={text}
        onChangeText={setText}
        placeholder={placeholder}
        placeholderTextColor={colors.textDim}
        multiline
        style={{
          flex: 1,
          backgroundColor: colors.navy800,
          color: colors.foreground,
          borderRadius: borderRadius.xl,
          borderWidth: 1,
          borderColor: colors.border,
          paddingHorizontal: 16,
          paddingVertical: 12,
          fontSize: 15,
          lineHeight: 20,
          maxHeight: 120,
        }}
      />
      <TouchableOpacity
        onPress={handleSend}
        disabled={!text.trim() || loading}
        activeOpacity={0.7}
        style={{
          width: 48,
          height: 48,
          borderRadius: borderRadius.lg,
          backgroundColor: text.trim() && !loading ? colors.primary : colors.navy700,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {loading ? (
          <ActivityIndicator size="small" color={colors.primaryForeground} />
        ) : (
          <Send width={20} height={20} color={text.trim() ? colors.primaryForeground : colors.textDim} />
        )}
      </TouchableOpacity>
    </View>
  );
}
