import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { useCallback, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Link } from "expo-router";
import { ScreenWrapper } from "@/src/components/ui/ScreenWrapper";
import { Card } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  Briefcase,
  Bot,
  Workflow,
  Network,
  ArrowRight,
  Scale,
} from "@/src/components/ui/Icons";
import { colors, typography, spacing, borderRadius } from "@/src/theme";
import { formatDate, truncate, SCREEN_WIDTH } from "@/src/utils";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

const QUICK_ACTIONS = [
  { label: "New Chat", icon: MessageSquare, href: "/chat", color: colors.primary },
  { label: "Documents", icon: FileText, href: "/documents", color: colors.accent },
  { label: "Cases", icon: Briefcase, href: "/documents", color: colors.success },
  { label: "Agents", icon: Bot, href: "/explore", color: colors.info },
];

const statCards = [
  { label: "Active Chats", key: "activeChats", icon: MessageSquare, color: colors.primary },
  { label: "Documents", key: "documents", icon: FileText, color: colors.accent },
  { label: "Open Cases", key: "openCases", icon: Briefcase, color: colors.success },
  { label: "AI Agents", key: "agents", icon: Bot, color: colors.info },
];

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  const { data: analytics, isLoading, refetch } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/analytics`);
      if (!res.ok) return null;
      return res.json();
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  return (
    <ScreenWrapper scroll scrollProps={{
      refreshControl: <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />,
      contentContainerStyle: { paddingBottom: insets.bottom + 100 },
    }}>
      {/* Header */}
      <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xl }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: spacing.xs }}>
          <View style={{
            width: 32, height: 32, borderRadius: 8,
            backgroundColor: "rgba(201, 168, 76, 0.15)",
            borderWidth: 1, borderColor: "rgba(201, 168, 76, 0.3)",
            alignItems: "center", justifyContent: "center",
          }}>
            <Scale width={18} height={18} color={colors.accent} />
          </View>
          <Text style={[{ color: colors.foreground, fontSize: 24, fontWeight: "700", letterSpacing: -0.5 }]}>
            Dashboard
          </Text>
        </View>
        <Text style={[{ color: colors.mutedForeground, fontSize: 14 }]}>
          Welcome back to JurisAI
        </Text>
      </View>

      {/* Quick Actions */}
      <View style={{ paddingHorizontal: spacing.xl, marginBottom: spacing.xl }}>
        <View style={{ flexDirection: "row", gap: spacing.md }}>
          {QUICK_ACTIONS.slice(0, 2).map((action, i) => (
            <Link key={i} href={action.href as any} asChild>
              <TouchableOpacity
                activeOpacity={0.7}
                style={{
                  flex: 1,
                  backgroundColor: colors.navy800,
                  borderRadius: borderRadius.xl,
                  borderWidth: 1,
                  borderColor: colors.border,
                  padding: spacing.lg,
                  alignItems: "center",
                  gap: spacing.sm,
                }}
              >
                <View style={{
                  width: 40, height: 40, borderRadius: borderRadius.lg,
                  backgroundColor: action.color + "20",
                  alignItems: "center", justifyContent: "center",
                }}>
                  <action.icon width={20} height={20} color={action.color} />
                </View>
                <Text style={[{ color: colors.foreground, fontSize: 13, fontWeight: "600" }]}>
                  {action.label}
                </Text>
              </TouchableOpacity>
            </Link>
          ))}
        </View>
        <View style={{ flexDirection: "row", gap: spacing.md, marginTop: spacing.md }}>
          {QUICK_ACTIONS.slice(2, 4).map((action, i) => (
            <Link key={i} href={action.href as any} asChild>
              <TouchableOpacity
                activeOpacity={0.7}
                style={{
                  flex: 1,
                  backgroundColor: colors.navy800,
                  borderRadius: borderRadius.xl,
                  borderWidth: 1,
                  borderColor: colors.border,
                  padding: spacing.lg,
                  alignItems: "center",
                  gap: spacing.sm,
                }}
              >
                <View style={{
                  width: 40, height: 40, borderRadius: borderRadius.lg,
                  backgroundColor: action.color + "20",
                  alignItems: "center", justifyContent: "center",
                }}>
                  <action.icon width={20} height={20} color={action.color} />
                </View>
                <Text style={[{ color: colors.foreground, fontSize: 13, fontWeight: "600" }]}>
                  {action.label}
                </Text>
              </TouchableOpacity>
            </Link>
          ))}
        </View>
      </View>

      {/* Stats Grid */}
      <View style={{ paddingHorizontal: spacing.xl, marginBottom: spacing.xl }}>
        <Text style={[{ color: colors.foreground, fontSize: 16, fontWeight: "600", marginBottom: spacing.md }]}>
          Overview
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.md }}>
          {statCards.map((stat, i) => {
            const value = analytics?.[stat.key] ?? (isLoading ? "..." : "0");
            return (
              <Card key={i} variant="muted" style={{ width: (SCREEN_WIDTH - spacing.xl * 2 - spacing.md) / 2 - 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.sm }}>
                  <View style={{
                    width: 32, height: 32, borderRadius: borderRadius.md,
                    backgroundColor: stat.color + "20",
                    alignItems: "center", justifyContent: "center",
                  }}>
                    <stat.icon width={16} height={16} color={stat.color} />
                  </View>
                  <Text style={[{ color: colors.mutedForeground, fontSize: 12 }]}>
                    {stat.label}
                  </Text>
                </View>
                <Text style={[{ color: colors.foreground, fontSize: 28, fontWeight: "700" }]}>
                  {typeof value === "number" ? value : value}
                </Text>
              </Card>
            );
          })}
        </View>
      </View>

      {/* Recent Chats */}
      <View style={{ paddingHorizontal: spacing.xl, marginBottom: spacing.xl }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md }}>
          <Text style={[{ color: colors.foreground, fontSize: 16, fontWeight: "600" }]}>
            Recent Activity
          </Text>
          <Link href="/chat" asChild>
            <TouchableOpacity activeOpacity={0.7} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Text style={[{ color: colors.primary, fontSize: 13, fontWeight: "500" }]}>View all</Text>
              <ArrowRight width={14} height={14} color={colors.primary} />
            </TouchableOpacity>
          </Link>
        </View>
        <Card variant="muted">
          <View style={{ alignItems: "center", paddingVertical: spacing.xl }}>
            <MessageSquare width={32} height={32} color={colors.textDim} />
            <Text style={[{ color: colors.mutedForeground, fontSize: 14, marginTop: spacing.sm, textAlign: "center" }]}>
              Start a conversation to see recent activity
            </Text>
          </View>
        </Card>
      </View>
    </ScreenWrapper>
  );
}
