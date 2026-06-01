import { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack, router } from "expo-router";
import { Card } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Key, Plus, Copy, Trash2, Check } from "@/src/components/ui/Icons";
import { colors, borderRadius, spacing } from "@/src/theme";
import { formatDate } from "@/src/utils";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: string;
  scopes: string[];
  isRevoked: boolean;
}

export default function ApiKeysScreen() {
  const insets = useSafeAreaInsets();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newKeyResult, setNewKeyResult] = useState<string | null>(null);

  const loadKeys = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/api-keys`);
      const data = await res.json();
      setKeys(Array.isArray(data) ? data : []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { loadKeys(); }, [loadKeys]);

  const createKey = async () => {
    if (!newName.trim()) return;
    try {
      const res = await fetch(`${API_URL}/api/v1/api-keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, scopes: ["READ"] }),
      });
      const data = await res.json();
      setNewKeyResult(data.key ?? data.id ?? "Created");
      setNewName("");
      await loadKeys();
    } catch {}
  };

  const copyToClipboard = (text: string) => {
    // In a real app, use expo-clipboard
    alert("Copied: " + text);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={keys}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: spacing.xl,
          paddingBottom: insets.bottom + 100,
        }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadKeys} tintColor={colors.accent} />}
        ListHeaderComponent={
          <View style={{ marginBottom: spacing.xl }}>
            <Text style={[{ color: colors.mutedForeground, fontSize: 13, marginBottom: spacing.lg }]}>
              API keys allow external services to authenticate with the JurisAI platform.
            </Text>

            {showCreate ? (
              <Card variant="muted" style={{ marginBottom: spacing.lg }}>
                <Text style={[{ color: colors.foreground, fontSize: 15, fontWeight: "600", marginBottom: spacing.md }]}>
                  Create API Key
                </Text>
                <Input
                  placeholder="Key name"
                  value={newName}
                  onChangeText={setNewName}
                  style={{ marginBottom: spacing.md }}
                />
                <View style={{ flexDirection: "row", gap: spacing.sm }}>
                  <Button variant="primary" size="sm" onPress={createKey} disabled={!newName.trim()}>
                    Create
                  </Button>
                  <Button variant="ghost" size="sm" onPress={() => { setShowCreate(false); setNewKeyResult(null); }}>
                    Cancel
                  </Button>
                </View>
                {newKeyResult && (
                  <View style={{ marginTop: spacing.md, padding: spacing.md, backgroundColor: "#052e16", borderRadius: borderRadius.md }}>
                    <Text style={[{ color: colors.success, fontSize: 12, marginBottom: 4 }]}>Key created:</Text>
                    <TouchableOpacity onPress={() => copyToClipboard(newKeyResult)}>
                      <Text style={[{ color: colors.foreground, fontSize: 13, fontFamily: "monospace" }]}>{newKeyResult}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </Card>
            ) : (
              <Button variant="primary" size="md" onPress={() => setShowCreate(true)}>
                <Plus width={16} height={16} color={colors.primaryForeground} /> Create API Key
              </Button>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <Card variant="muted" style={{ marginBottom: spacing.md }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                  <Key width={16} height={16} color={colors.accent} />
                  <Text style={[{ color: colors.foreground, fontSize: 15, fontWeight: "600" }]}>{item.name}</Text>
                </View>
                <Text style={[{ color: colors.textDim, fontSize: 13, fontFamily: "monospace", marginTop: 4 }]}>
                  {item.keyPrefix}...
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.sm }}>
                  {item.scopes.map((scope) => (
                    <Badge key={scope} label={scope} variant="muted" size="sm" />
                  ))}
                  {item.isRevoked && <Badge label="Revoked" variant="error" size="sm" />}
                </View>
                <Text style={[{ color: colors.textDim, fontSize: 11, marginTop: spacing.sm }]}>
                  Created {formatDate(item.createdAt)}
                </Text>
              </View>
              <TouchableOpacity onPress={() => copyToClipboard(item.keyPrefix)} activeOpacity={0.7} style={{ padding: 4 }}>
                <Copy width={16} height={16} color={colors.textDim} />
              </TouchableOpacity>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={{ alignItems: "center", paddingVertical: 40 }}>
              <Key width={36} height={36} color={colors.textDim} />
              <Text style={[{ color: colors.mutedForeground, fontSize: 14, marginTop: spacing.md }]}>
                No API keys yet
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}
