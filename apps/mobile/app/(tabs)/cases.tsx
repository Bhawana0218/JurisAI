import { useQuery } from "@tanstack/react-query";
import { View, Text, FlatList, StyleSheet } from "react-native";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export default function CasesScreen() {
  const { data, isLoading } = useQuery({
    queryKey: ["cases"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/cases`);
      return res.json();
    },
  });

  if (isLoading) return <Text style={styles.loading}>Loading cases…</Text>;

  return (
    <View style={styles.container}>
      <FlatList
        data={data?.cases ?? []}
        keyExtractor={(item: { id: string }) => item.id}
        renderItem={({ item }: { item: { title: string; status: string } }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.status}>{item.status}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No cases yet</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a", padding: 16 },
  loading: { color: "#94a3b8", padding: 24 },
  card: { backgroundColor: "#1e293b", padding: 16, borderRadius: 12, marginBottom: 12 },
  title: { color: "#fff", fontSize: 16, fontWeight: "600" },
  status: { color: "#94a3b8", marginTop: 4 },
  empty: { color: "#64748b", textAlign: "center", marginTop: 40 },
});
