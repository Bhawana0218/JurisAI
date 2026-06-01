import { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Card } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Webhook, Plus, Play, Pause, Trash2 } from "@/src/components/ui/Icons";
import { colors, borderRadius, spacing } from "@/src/theme";
import { formatDate } from "@/src/utils";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

interface WebhookEntry {
  id: string;
  url: string;
  events: string[];
  isActive: boolean;
}

export default function WebhooksScreen() {
  const insets = useSafeAreaInsets();
  const [webhooks, setWebhooks] = useState<WebhookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newUrl, setNewUrl] = useState("");

  const loadWebhooks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/webhooks`);
      const data = await res.json();
      setWebhooks(Array.isArray(data) ? data : []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { loadWebhooks(); }, [loadWebhooks]);

  const createWebhook = async () => {
    if (!newUrl.trim()) return;
    try {
      await fetch(`${API_URL}/api/v1/webhooks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: newUrl, events: ["AGENT_COMPLETED"] }),
      });
      setNewUrl("");
      setShowCreate(false);
      await loadWebhooks();
    } catch {}
  };

  const toggleWebhook = async (id: string, current: boolean) => {
    try {
      await fetch(`${API_URL}/api/v1/webhooks`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !current }),
      });
      await loadWebhooks();
    } catch {}
  };

  const deleteWebhook = async (id: string) => {
    try {
      await fetch(`${API_URL}/api/v1/webhooks/${id}`, { method: "DELETE" });
      await loadWebhooks();
    } catch {}
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={webhooks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: spacing.xl,
          paddingBottom: insets.bottom + 100,
        }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadWebhooks} tintColor={colors.accent} />}
        ListHeaderComponent={
          <View style={{ marginBottom: spacing.xl }}>
            <Text style={[{ color: colors.mutedForeground, fontSize: 13, marginBottom: spacing.lg }]}>
              Webhooks deliver real-time events to your endpoints.
            </Text>
            {showCreate ? (
              <Card variant="muted" style={{ marginBottom: spacing.lg }}>
                <Text style={[{ color: colors.foreground, fontSize: 15, fontWeight: "600", marginBottom: spacing.md }]}>
                  New Webhook
                </Text>
                <Input
                  placeholder="https://..."
                  value={newUrl}
                  onChangeText={setNewUrl}
                  style={{ marginBottom: spacing.md }}
                />
                <View style={{ flexDirection: "row", gap: spacing.sm }}>
                  <Button variant="primary" size="sm" onPress={createWebhook}>Create</Button>
                  <Button variant="ghost" size="sm" onPress={() => setShowCreate(false)}>Cancel</Button>
                </View>
              </Card>
            ) : (
              <Button variant="primary" size="md" onPress={() => setShowCreate(true)}>
                <Plus width={16} height={16} color={colors.primaryForeground} /> Add Webhook
              </Button>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <Card variant="muted" style={{ marginBottom: spacing.md }}>
            <View style={{ flexDirection: "row", gap: spacing.md }}>
              <View style={{
                width: 40, height: 40, borderRadius: borderRadius.lg,
                backgroundColor: colors.navy700,
                alignItems: "center", justifyContent: "center",
              }}>
                <Webhook width={20} height={20} color={item.isActive ? colors.success : colors.textDim} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[{ color: colors.foreground, fontSize: 14, fontWeight: "500" }]} numberOfLines={1}>
                  {item.url}
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
                  {item.events.map((evt) => (
                    <Badge key={evt} label={evt} variant="muted" size="sm" />
                  ))}
                </View>
                <Badge
                  label={item.isActive ? "Active" : "Paused"}
                  variant={item.isActive ? "success" : "warning"}
                  size="sm"
                  style={{ marginTop: 4 }}
                />
              </View>
              <View style={{ gap: spacing.sm }}>
                <TouchableOpacity onPress={() => toggleWebhook(item.id, item.isActive)} activeOpacity={0.7}>
                  {item.isActive ? (
                    <Pause width={18} height={18} color={colors.warning} />
                  ) : (
                    <Play width={18} height={18} color={colors.success} />
                  )}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteWebhook(item.id)} activeOpacity={0.7}>
                  <Trash2 width={18} height={18} color={colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={{ alignItems: "center", paddingVertical: 40 }}>
              <Webhook width={36} height={36} color={colors.textDim} />
              <Text style={[{ color: colors.mutedForeground, fontSize: 14, marginTop: spacing.md }]}>No webhooks configured</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}
