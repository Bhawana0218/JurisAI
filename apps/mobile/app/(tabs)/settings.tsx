import { View, Text, ScrollView, TouchableOpacity, Switch } from "react-native";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ScreenWrapper } from "@/src/components/ui/ScreenWrapper";
import { Card } from "@/src/components/ui/Card";
import { Avatar } from "@/src/components/ui/Avatar";
import {
  Settings as SettingsIcon,
  Key,
  Webhook,
  Users,
  CreditCard,
  Globe,
  FileText,
  ChevronRight,
  Scale,
  Shield,
  HelpCircle,
} from "@/src/components/ui/Icons";
import * as LocalAuthentication from "expo-local-authentication";
import { colors, typography, spacing, borderRadius } from "@/src/theme";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

const SETTINGS_GROUPS = [
  {
    section: "Workspace",
    items: [
      { label: "Members", icon: Users, href: "/settings/members", color: colors.info },
      { label: "Billing", icon: CreditCard, href: "/settings/billing", color: colors.success },
    ],
  },
  {
    section: "Developer",
    items: [
      { label: "API Keys", icon: Key, href: "/settings/api-keys", color: colors.accent },
      { label: "Webhooks", icon: Webhook, href: "/settings/webhooks", color: colors.primary },
    ],
  },
  {
    section: "Security",
    items: [
      { label: "SSO", icon: Globe, href: "/settings/sso", color: colors.info },
      { label: "Audit Log", icon: FileText, href: "/settings/audit", color: colors.warning },
    ],
  },
  {
    section: "Support",
    items: [
      { label: "Help & Support", icon: HelpCircle, href: "", color: colors.mutedForeground },
    ],
  },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [biometric, setBiometric] = useState(false);

  async function enableBiometric(value: boolean) {
    if (value) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Enable biometric unlock for JurisAI",
      });
      if (!result.success) return;
    }
    setBiometric(value);
    try {
      await fetch(`${API_URL}/api/devices/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId: "mobile-local",
          platform: "IOS",
          biometricEnabled: value,
        }),
      });
    } catch {}
  }

  return (
    <ScreenWrapper scroll>
      {/* Header */}
      <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xl }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: spacing.xs }}>
          <View style={{
            width: 28, height: 28, borderRadius: 8,
            backgroundColor: "rgba(201, 168, 76, 0.15)",
            borderWidth: 1, borderColor: "rgba(201, 168, 76, 0.3)",
            alignItems: "center", justifyContent: "center",
          }}>
            <SettingsIcon width={16} height={16} color={colors.accent} />
          </View>
          <Text style={[{ color: colors.foreground, fontSize: 22, fontWeight: "700", letterSpacing: -0.3 }]}>
            Settings
          </Text>
        </View>
      </View>

      {/* Profile Card */}
      <View style={{ paddingHorizontal: spacing.xl, marginBottom: spacing.xl }}>
        <Card variant="muted">
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.lg }}>
            <Avatar name="User" size={48} />
            <View style={{ flex: 1 }}>
              <Text style={[{ color: colors.foreground, fontSize: 16, fontWeight: "600" }]}>User</Text>
              <Text style={[{ color: colors.mutedForeground, fontSize: 13 }]}>user@jurisai.app</Text>
            </View>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={[{ color: colors.primary, fontSize: 13, fontWeight: "500" }]}>Edit</Text>
            </TouchableOpacity>
          </View>
        </Card>
      </View>

      {/* Biometric */}
      <View style={{ paddingHorizontal: spacing.xl, marginBottom: spacing.xl }}>
        <Card variant="muted">
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View style={{ flex: 1 }}>
              <Text style={[{ color: colors.foreground, fontSize: 15, fontWeight: "500" }]}>Biometric Login</Text>
              <Text style={[{ color: colors.mutedForeground, fontSize: 12, marginTop: 2 }]}>
                Use Face ID or fingerprint to unlock
              </Text>
            </View>
            <Switch
              value={biometric}
              onValueChange={enableBiometric}
              trackColor={{ false: colors.navy700, true: colors.primary }}
              thumbColor={biometric ? colors.accent : colors.textDim}
            />
          </View>
        </Card>
      </View>

      {/* Settings Groups */}
      {SETTINGS_GROUPS.map((group) => (
        <View key={group.section} style={{ paddingHorizontal: spacing.xl, marginBottom: spacing.md }}>
          <Text style={[{ color: colors.mutedForeground, fontSize: 11, fontWeight: "600", letterSpacing: 1, marginBottom: spacing.sm, textTransform: "uppercase" }]}>
            {group.section}
          </Text>
          <Card variant="muted" style={{ padding: 0 }}>
            {group.items.map((item, index) => (
              <TouchableOpacity
                key={item.label}
                activeOpacity={0.7}
                onPress={() => {
                  if (item.href) router.push(item.href as any);
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: spacing.md,
                  padding: spacing.lg,
                  borderBottomWidth: index < group.items.length - 1 ? 1 : 0,
                  borderBottomColor: colors.border,
                }}
              >
                <View style={{
                  width: 36, height: 36, borderRadius: borderRadius.md,
                  backgroundColor: item.color + "20",
                  alignItems: "center", justifyContent: "center",
                }}>
                  <item.icon width={18} height={18} color={item.color} />
                </View>
                <Text style={[{ flex: 1, color: colors.foreground, fontSize: 15 }]}>
                  {item.label}
                </Text>
                <ChevronRight width={18} height={18} color={colors.textDim} />
              </TouchableOpacity>
            ))}
          </Card>
        </View>
      ))}

      {/* Version */}
      <View style={{ alignItems: "center", paddingVertical: spacing.xl }}>
        <Text style={[{ color: colors.textDim, fontSize: 12 }]}>JurisAI v1.0.0</Text>
        <Text style={[{ color: colors.textDim, fontSize: 11, marginTop: 2 }]}>
          AI-Powered Legal Intelligence
        </Text>
      </View>
    </ScreenWrapper>
  );
}
