import { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useOfflineChatStore } from "../../stores/offline-chat.store";
import { useSyncOnReconnect } from "../../hooks/use-sync-on-reconnect";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export default function ChatScreen() {
  const { messages, addMessage, pendingOps, setMessages } = useOfflineChatStore();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatId = "mobile-default";

  useSyncOnReconnect(API_URL);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    addMessage({ id: Date.now().toString(), chatId, role: "user", content: text, pendingSync: true });

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId,
          messages: [{ role: "user", parts: [{ type: "text", text }] }],
        }),
      });

      if (!res.ok) throw new Error("Chat failed");

      const reader = res.body?.getReader();
      let assistantText = "";
      if (reader) {
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          assistantText += decoder.decode(value);
        }
      }

      addMessage({
        id: `${Date.now()}-a`,
        chatId,
        role: "assistant",
        content: assistantText || "Response received.",
        pendingSync: false,
      });
    } catch {
      addMessage({
        id: `${Date.now()}-err`,
        chatId,
        role: "assistant",
        content: "Offline — message queued for sync.",
        pendingSync: true,
      });
    } finally {
      setLoading(false);
    }
  }, [input, loading, chatId, addMessage]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {pendingOps.length > 0 && (
        <Text style={styles.banner}>{pendingOps.length} pending sync</Text>
      )}
      <FlatList
        data={messages.filter((m) => m.chatId === chatId)}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.role === "user" ? styles.userBubble : styles.aiBubble]}>
            <Text style={styles.bubbleText}>{item.content}</Text>
          </View>
        )}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask a legal question…"
          placeholderTextColor="#64748b"
          multiline
        />
        <TouchableOpacity style={styles.sendBtn} onPress={send} disabled={loading}>
          <Text style={styles.sendText}>{loading ? "…" : "Send"}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  banner: { color: "#fbbf24", textAlign: "center", padding: 8, fontSize: 12 },
  list: { padding: 16, gap: 8 },
  bubble: { maxWidth: "85%", padding: 12, borderRadius: 16, marginBottom: 8 },
  userBubble: { alignSelf: "flex-end", backgroundColor: "#2563eb" },
  aiBubble: { alignSelf: "flex-start", backgroundColor: "#1e293b" },
  bubbleText: { color: "#f8fafc", fontSize: 15 },
  inputRow: { flexDirection: "row", padding: 12, gap: 8, borderTopWidth: 1, borderTopColor: "#1e293b" },
  input: { flex: 1, backgroundColor: "#1e293b", color: "#fff", borderRadius: 12, padding: 12, maxHeight: 100 },
  sendBtn: { backgroundColor: "#2563eb", borderRadius: 12, paddingHorizontal: 16, justifyContent: "center" },
  sendText: { color: "#fff", fontWeight: "600" },
});
