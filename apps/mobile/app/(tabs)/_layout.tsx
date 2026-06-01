import { Tabs } from "expo-router";
import { View, Text, Platform } from "react-native";
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  Bot,
  Settings,
} from "@/src/components/ui/Icons";
import { colors, typography, spacing } from "@/src/theme";

const TABS = [
  { name: "index", label: "Dashboard", icon: LayoutDashboard },
  { name: "chat", label: "Chat", icon: MessageSquare },
  { name: "documents", label: "Documents", icon: FileText },
  { name: "explore", label: "Explore", icon: Bot },
  { name: "settings", label: "Settings", icon: Settings },
] as const;

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.foreground,
        headerTitleStyle: {
          fontWeight: "600",
          fontSize: 17,
        },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: colors.navy900,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: Platform.OS === "ios" ? 85 : 65,
          paddingBottom: Platform.OS === "ios" ? 24 : 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textDim,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "500",
        },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.label,
            tabBarLabel: tab.label,
            tabBarIcon: ({ focused, color }) => (
              <tab.icon
                width={22}
                height={22}
                color={color}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
