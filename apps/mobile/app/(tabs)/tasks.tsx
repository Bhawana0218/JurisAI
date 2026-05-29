import { useQuery } from "@tanstack/react-query";
import { View, Text, FlatList, StyleSheet } from "react-native";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export default function TasksScreen() {
  const { data } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/tasks`);
      return res.json();
    },
  });

  return (
    <View style={styles.container}>
      <FlatList
        data={data?.tasks ?? []}
        keyExtractor={(item: { id: string }) => item.id}
        renderItem={({ item }: { item: { title: string; status: string } }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.status}>{item.status}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a", padding: 16 },
  card: { backgroundColor: "#1e293b", padding: 14, borderRadius: 10, marginBottom: 10 },
  title: { color: "#fff" },
  status: { color: "#94a3b8", fontSize: 12, marginTop: 4 },
});
