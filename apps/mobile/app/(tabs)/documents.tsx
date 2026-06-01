import { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { ScreenWrapper } from "@/src/components/ui/ScreenWrapper";
import { Card } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { Input } from "@/src/components/ui/Input";
import { Button } from "@/src/components/ui/Button";
import { FileText, Briefcase, Search, Plus, ChevronRight, FileText as FileIcon } from "@/src/components/ui/Icons";
import { colors, typography, spacing, borderRadius } from "@/src/theme";
import { formatDate, SCREEN_WIDTH } from "@/src/utils";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

const TABS = [
  { key: "documents", label: "Documents" },
  { key: "cases", label: "Cases" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const statusColors: Record<string, "warning" | "success" | "error" | "muted"> = {
  draft: "warning",
  pending: "warning",
  active: "success",
  open: "success",
  closed: "muted",
  archived: "muted",
  resolved: "success",
};

export default function DocumentsScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabKey>("documents");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: documents, isLoading: docsLoading, refetch: refetchDocs } = useQuery({
    queryKey: ["documents"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/documents`);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : data?.documents ?? [];
    },
    enabled: activeTab === "documents",
  });

  const { data: cases, isLoading: casesLoading, refetch: refetchCases } = useQuery({
    queryKey: ["cases"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/cases`);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : data?.cases ?? [];
    },
    enabled: activeTab === "cases",
  });

  const isLoading = activeTab === "documents" ? docsLoading : casesLoading;
  const data = activeTab === "documents" ? documents : cases;

  const filtered = (data ?? []).filter((item: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (item.title ?? item.name ?? "").toLowerCase().includes(q);
  });

  const renderEmpty = () => (
    <View style={{ alignItems: "center", paddingVertical: 60, paddingHorizontal: spacing.xl }}>
      <View style={{
        width: 48, height: 48, borderRadius: borderRadius.lg,
        backgroundColor: colors.navy800,
        alignItems: "center", justifyContent: "center",
        marginBottom: spacing.md,
      }}>
        {activeTab === "documents" ? <FileText width={24} height={24} color={colors.textDim} /> : <Briefcase width={24} height={24} color={colors.textDim} />}
      </View>
      <Text style={[{ color: colors.mutedForeground, fontSize: 15, textAlign: "center" }]}>
        No {activeTab === "documents" ? "documents" : "cases"} yet
      </Text>
      <Button variant="primary" size="sm" style={{ marginTop: spacing.lg }}>
        <Plus width={16} height={16} color={colors.primaryForeground} />
        {" "}Create {activeTab === "documents" ? "Document" : "Case"}
      </Button>
    </View>
  );

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.md }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: spacing.sm }}>
          <View style={{
            width: 28, height: 28, borderRadius: 8,
            backgroundColor: "rgba(201, 168, 76, 0.15)",
            borderWidth: 1, borderColor: "rgba(201, 168, 76, 0.3)",
            alignItems: "center", justifyContent: "center",
          }}>
            <FileText width={16} height={16} color={colors.accent} />
          </View>
          <Text style={[{ color: colors.foreground, fontSize: 22, fontWeight: "700", letterSpacing: -0.3 }]}>
            {activeTab === "documents" ? "Documents" : "Cases"}
          </Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={{ flexDirection: "row", paddingHorizontal: spacing.xl, marginBottom: spacing.lg }}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => { setActiveTab(tab.key); setSearchQuery(""); }}
            activeOpacity={0.7}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: borderRadius.full,
              backgroundColor: activeTab === tab.key ? colors.primary : colors.navy800,
              marginRight: spacing.sm,
            }}
          >
            <Text style={[{
              color: activeTab === tab.key ? colors.primaryForeground : colors.foreground,
              fontSize: 13,
              fontWeight: "600",
            }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search */}
      <View style={{ paddingHorizontal: spacing.xl, marginBottom: spacing.lg }}>
        <Input
          placeholder={`Search ${activeTab}...`}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={{
          paddingHorizontal: spacing.xl,
          paddingBottom: insets.bottom + 100,
        }}
        ListEmptyComponent={!isLoading ? renderEmpty : null}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={activeTab === "documents" ? refetchDocs : refetchCases}
            tintColor={colors.accent}
          />
        }
        renderItem={({ item }: any) => (
          <TouchableOpacity activeOpacity={0.7}>
            <Card variant="muted" style={{ marginBottom: spacing.md }}>
              <View style={{ flexDirection: "row", gap: spacing.md }}>
                <View style={{
                  width: 40, height: 40, borderRadius: borderRadius.lg,
                  backgroundColor: colors.navy700,
                  alignItems: "center", justifyContent: "center",
                }}>
                  {activeTab === "documents" ? (
                    <FileIcon width={20} height={20} color={colors.primary} />
                  ) : (
                    <Briefcase width={20} height={20} color={colors.accent} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[{ color: colors.foreground, fontSize: 15, fontWeight: "600" }]} numberOfLines={1}>
                    {item.title ?? item.name ?? "Untitled"}
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: 4 }}>
                    <Badge
                      label={item.status ?? item.stage ?? "draft"}
                      variant={statusColors[item.status ?? "draft"] ?? "muted"}
                      size="sm"
                    />
                    <Text style={[{ color: colors.textDim, fontSize: 11 }]}>
                      {formatDate(item.updatedAt ?? item.createdAt ?? item.filedAt)}
                    </Text>
                  </View>
                </View>
                <ChevronRight width={18} height={18} color={colors.textDim} style={{ alignSelf: "center" }} />
              </View>
            </Card>
          </TouchableOpacity>
        )}
      />
    </ScreenWrapper>
  );
}
