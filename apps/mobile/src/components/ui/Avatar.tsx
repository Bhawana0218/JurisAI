import { View, Text } from "react-native";
import { colors, borderRadius, typography } from "@/src/theme";

interface AvatarProps {
  name?: string;
  size?: number;
}

export function Avatar({ name, size = 32 }: AvatarProps) {
  const initial = name?.charAt(0)?.toUpperCase() ?? "J";
  const fontSz = size * 0.4;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: borderRadius.lg,
        backgroundColor: colors.primary,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: colors.primaryForeground, fontSize: fontSz, fontWeight: "600" }}>
        {initial}
      </Text>
    </View>
  );
}
