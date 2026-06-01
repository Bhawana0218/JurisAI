import { useEffect, useRef } from "react";
import { View, Animated } from "react-native";
import { Scale } from "@/src/components/ui/Icons";
import { colors, borderRadius, spacing } from "@/src/theme";

function Dot({ delay }: { delay: number }) {
  const anim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 400,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0.3,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anim, delay]);

  return (
    <Animated.View
      style={{
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.accent,
        opacity: anim,
      }}
    />
  );
}

export function TypingIndicator() {
  return (
    <View style={{ flexDirection: "row", gap: spacing.md, marginBottom: spacing.lg }}>
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
        }}
      >
        <Scale width={16} height={16} color={colors.accent} />
      </View>
      <View
        style={{
          backgroundColor: colors.navy900,
          borderRadius: borderRadius.xl,
          borderBottomLeftRadius: borderRadius.sm,
          paddingHorizontal: 16,
          paddingVertical: 14,
          flexDirection: "row",
          gap: 5,
          alignItems: "center",
        }}
      >
        <Dot delay={0} />
        <Dot delay={200} />
        <Dot delay={400} />
      </View>
    </View>
  );
}
