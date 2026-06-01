import { View, Text, FlatList, TouchableOpacity, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { ScreenWrapper } from "@/src/components/ui/ScreenWrapper";
import { Card } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { Input } from "@/src/components/ui/Input";
import { Bot, Workflow, Network, Search, Star, Download, ChevronRight, Zap, Puzzle } from "@/src/components/ui/Icons";
import { colors, typography, spacing, borderRadius } from "@/src/theme";
import { trimAddress, formatDate, SCREEN_WIDTH } from "@/src/utils";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

const SECTIONS = [
  { key: "agents", label: "AI Agents", icon: Bot },
  { key: "workflows", label: "Workflows", icon: Workflow },
  { key: "knowledge", label: "Knowledge Graph", icon: Network },
  { key: "integrations", label: "Integrations", icon: Puzzle },
] as const;

type SectionKey = (typeof SECTIONS)[number]["key"];

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: agents, isLoading: agentsLoading, refetch: refetchAgents } = useQuery({
    queryKey: ["marketplace"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/v1/marketplace/agents`);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : data?.agents ?? data?.installations ?? [];
    },
  });

  const filtered = (agents ?? []).filter((item: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (item.name ?? item.title ?? "").toLowerCase().includes(q);
  });

  const renderAgentCard = ({ item }: { item: any }) => (
    <TouchableOpacity activeOpacity={0.7}>
      <Card variant="muted" style={{ marginBottom: spacing.md }}>
        <View style={{ flexDirection: "row", gap: spacing.md }}>
          <View style={{
            width: 44, height: 44, borderRadius: borderRadius.lg,
            backgroundColor: item.color ? item.color + "20" : colors.navy700,
            alignItems: "center", justifyContent: "center",
          }}>
            <Bot width={22} height={22} color={item.color ?? colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[{ color: colors.foreground, fontSize: 15, fontWeight: "600" }]} numberOfLines={1}>
              {item.name ?? item.title ?? "AI Agent"}
            </Text>
            <Text style={[{ color: colors.mutedForeground, fontSize: 13, marginTop: 2 }]} numberOfLines={2}>
              {item.shortDescription ?? item.description ?? "Intelligent legal AI agent"}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.sm }}>
              {item.category && <Badge label={item.category} variant="muted" size="sm" />}
              {item.rating && (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
                  <Star width={12} height={12} color={colors.accent} />
                  <Text style={[{ color: colors.accent, fontSize: 11 }]}>{item.rating}</Text>
                </View>
              )}
            </View>
          </View>
          <ChevronRight width={18} height={18} color={colors.textDim} style={{ alignSelf: "center" }} />
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.md }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: spacing.xs }}>
          <View style={{
            width: 28, height: 28, borderRadius: 8,
            backgroundColor: "rgba(201, 168, 76, 0.15)",
            borderWidth: 1, borderColor: "rgba(201, 168, 76, 0.3)",
            alignItems: "center", justifyContent: "center",
          }}>
            <Bot width={16} height={16} color={colors.accent} />
          </View>
          <Text style={[{ color: colors.foreground, fontSize: 22, fontWeight: "700", letterSpacing: -0.3 }]}>
            Explore
          </Text>
        </View>
        <Text style={[{ color: colors.mutedForeground, fontSize: 14 }]}>
          AI Agents, Workflows, and Tools
        </Text>
      </View>

      {/* Search */}
      <View style={{ paddingHorizontal: spacing.xl, marginBottom: spacing.lg }}>
        <Input
          placeholder="Search agents, workflows..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Section Quick Links */}
      <View style={{ paddingHorizontal: spacing.xl, marginBottom: spacing.xl }}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
          {SECTIONS.map((section) => (
            <TouchableOpacity
              key={section.key}
              activeOpacity={0.7}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: spacing.sm,
                backgroundColor: colors.navy800,
                borderRadius: borderRadius.full,
                paddingVertical: 8,
                paddingHorizontal: 14,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <section.icon width={16} height={16} color={colors.accent} />
              <Text style={[{ color: colors.foreground, fontSize: 13 }]}>{section.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Agents List */}
      <View style={{ paddingHorizontal: spacing.xl, marginBottom: spacing.md }}>
        <Text style={[{ color: colors.foreground, fontSize: 16, fontWeight: "600" }]}>
          Featured Agents
        </Text>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={{
          paddingHorizontal: spacing.xl,
          paddingBottom: insets.bottom + 120,
        }}
        renderItem={renderAgentCard}
        refreshControl={
          <RefreshControl refreshing={agentsLoading} onRefresh={refetchAgents} tintColor={colors.accent} />
        }
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingVertical: 40 }}>
            <Bot width={36} height={36} color={colors.textDim} />
            <Text style={[{ color: colors.mutedForeground, fontSize: 14, marginTop: spacing.md, textAlign: "center" }]}>
              {searchQuery ? "No agents found matching your search" : "No agents available yet"}
            </Text>
          </View>
        }
      />
    </ScreenWrapper>
  );
}
