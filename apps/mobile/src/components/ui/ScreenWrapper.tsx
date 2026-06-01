import { View, ScrollView, type ViewProps, type ScrollViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/src/theme";

interface ScreenWrapperProps extends ViewProps {
  scroll?: boolean;
  scrollProps?: ScrollViewProps;
}

export function ScreenWrapper({
  scroll,
  scrollProps,
  style,
  children,
  ...props
}: ScreenWrapperProps) {
  const insets = useSafeAreaInsets();

  const wrapperStyle = {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: insets.top,
  };

  if (scroll) {
    return (
      <View style={[wrapperStyle, style]} {...props}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          {...scrollProps}
        >
          {children}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[wrapperStyle, style]} {...props}>
      {children}
    </View>
  );
}
