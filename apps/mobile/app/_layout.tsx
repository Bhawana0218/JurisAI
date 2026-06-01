import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { View, Text } from "react-native";
import { colors, typography } from "@/src/theme";
import { Scale } from "@/src/components/ui/Icons";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 2,
    },
  },
});

function JurisAIBrandHeader() {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
      }}
    >
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          backgroundColor: "rgba(201, 168, 76, 0.15)",
          borderWidth: 1,
          borderColor: "rgba(201, 168, 76, 0.3)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Scale width={16} height={16} color={colors.accent} />
      </View>
      <Text
        style={{
          color: colors.foreground,
          fontSize: 17,
          fontWeight: "700",
          letterSpacing: -0.3,
        }}
      >
        JurisAI
      </Text>
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.foreground,
            headerTitleStyle: { fontWeight: "600", fontSize: 17 },
            headerShadowVisible: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen
            name="(tabs)"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="settings/api-keys"
            options={{
              title: "API Keys",
              headerBackTitle: "Settings",
            }}
          />
          <Stack.Screen
            name="settings/webhooks"
            options={{
              title: "Webhooks",
              headerBackTitle: "Settings",
            }}
          />
          <Stack.Screen
            name="settings/members"
            options={{
              title: "Members",
              headerBackTitle: "Settings",
            }}
          />
          <Stack.Screen
            name="settings/billing"
            options={{
              title: "Billing",
              headerBackTitle: "Settings",
            }}
          />
          <Stack.Screen
            name="settings/sso"
            options={{
              title: "SSO",
              headerBackTitle: "Settings",
            }}
          />
          <Stack.Screen
            name="settings/audit"
            options={{
              title: "Audit Log",
              headerBackTitle: "Settings",
            }}
          />
        </Stack>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
