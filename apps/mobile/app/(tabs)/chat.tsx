import { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useOfflineChatStore } from "../../stores/offline-chat.store";
import { useSyncOnReconnect } from "../../hooks/use-sync-on-reconnect";
import { ChatMessage } from "@/src/components/chat/ChatMessage";
import { ChatInput } from "@/src/components/chat/ChatInput";
import { SuggestionPrompts } from "@/src/components/chat/SuggestionPrompts";
import { TypingIndicator } from "@/src/components/chat/TypingIndicator";
import { Card } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { Menu, X, Plus, MessageSquare, Scale } from "@/src/components/ui/Icons";
import { colors, typography, spacing, borderRadius } from "@/src/theme";
import { formatDate, truncate, SCREEN_WIDTH } from "@/src/utils";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";
const SIDEBAR_WIDTH = Math.min(SCREEN_WIDTH * 0.78, 320);

interface ChatSummary {
  id: string;
  title: string;
  lastMessageAt: string;
  createdAt: string;
  agentType?: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  agentType?: string;
  pendingSync?: boolean;
}

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [agentType, setAgentType] = useState<string | null>(null);
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const flatListRef = useRef<FlatList>(null);

  useSyncOnReconnect(API_URL);

  const send = useCallback(async (text: string) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setError(null);
    setLoading(true);
    setAgentType(null);

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: currentChatId ?? "mobile-new",
          messages: [{ role: "user", parts: [{ type: "text", text }] }],
        }),
      });

      if (!res.ok) throw new Error("Chat request failed");

      const agentHeader = res.headers.get("X-Agent-Id");
      if (agentHeader) setAgentType(agentHeader);

      const reader = res.body?.getReader();
      let assistantText = "";

      if (reader) {
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          assistantText += decoder.decode(value, { stream: true });
        }
      }

      const assistantMsg: ChatMessage = {
        id: `${Date.now()}-a`,
        role: "assistant",
        content: assistantText || "I've processed your request. How can I help further?",
        agentType: agentHeader || undefined,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection error");
    } finally {
      setLoading(false);
    }
  }, [currentChatId]);

  const loadChats = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/chats`);
      if (res.ok) {
        const data = await res.json();
        setChats(Array.isArray(data) ? data : data?.chats ?? []);
      }
    } catch {}
  }, []);

  const handleSelectSuggestion = useCallback((text: string) => {
    send(text);
  }, [send]);

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setCurrentChatId(null);
    setAgentType(null);
    setError(null);
    setSidebarOpen(false);
  }, []);

  const renderHeader = () => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.background,
      }}
    >
      <TouchableOpacity
        onPress={() => { setSidebarOpen(true); loadChats(); }}
        activeOpacity={0.7}
        style={{
          width: 40,
          height: 40,
          borderRadius: borderRadius.lg,
          backgroundColor: colors.navy800,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Menu width={20} height={20} color={colors.foreground} />
      </TouchableOpacity>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <Scale width={16} height={16} color={colors.accent} />
        <Text style={[{ color: colors.foreground, fontSize: 16, fontWeight: "600" }]}>
          AI Chat
        </Text>
      </View>

      <TouchableOpacity
        onPress={handleNewChat}
        activeOpacity={0.7}
        style={{
          width: 40,
          height: 40,
          borderRadius: borderRadius.lg,
          backgroundColor: colors.navy800,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Plus width={20} height={20} color={colors.accent} />
      </TouchableOpacity>
    </View>
  );

  const renderSidebar = () => (
    <Modal
      visible={sidebarOpen}
      animationType="fade"
      transparent
      onRequestClose={() => setSidebarOpen(false)}
    >
      <View style={{ flex: 1, flexDirection: "row" }}>
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}
          activeOpacity={1}
          onPress={() => setSidebarOpen(false)}
        />
        <View
          style={{
            width: SIDEBAR_WIDTH,
            backgroundColor: colors.navy900,
            paddingTop: insets.top,
            borderLeftWidth: 1,
            borderLeftColor: colors.border,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View style={{
                width: 28, height: 28, borderRadius: 8,
                backgroundColor: "rgba(201, 168, 76, 0.15)",
                borderWidth: 1, borderColor: "rgba(201, 168, 76, 0.3)",
                alignItems: "center", justifyContent: "center",
              }}>
                <Scale width={16} height={16} color={colors.accent} />
              </View>
              <Text style={[{ color: colors.foreground, fontSize: 16, fontWeight: "600" }]}>
                Chats
              </Text>
            </View>
            <TouchableOpacity onPress={() => setSidebarOpen(false)}>
              <X width={20} height={20} color={colors.textDim} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleNewChat}
            activeOpacity={0.7}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.md,
              margin: spacing.lg,
              padding: spacing.md,
              backgroundColor: colors.primary,
              borderRadius: borderRadius.lg,
            }}
          >
            <Plus width={18} height={18} color={colors.primaryForeground} />
            <Text style={[{ color: colors.primaryForeground, fontSize: 14, fontWeight: "600" }]}>
              New Chat
            </Text>
          </TouchableOpacity>

          <FlatList
            data={chats}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: spacing.md }}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.7}
                style={{
                  flexDirection: "row",
                  gap: spacing.md,
                  padding: spacing.md,
                  borderRadius: borderRadius.md,
                  backgroundColor: item.id === currentChatId ? colors.navy800 : "transparent",
                  marginBottom: 4,
                }}
                onPress={() => {
                  setCurrentChatId(item.id);
                  setSidebarOpen(false);
                }}
              >
                <MessageSquare width={16} height={16} color={colors.textDim} style={{ marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text
                    style={[{ color: colors.foreground, fontSize: 14, fontWeight: "500" }]}
                    numberOfLines={1}
                  >
                    {item.title || "Untitled Chat"}
                  </Text>
                  <Text style={[{ color: colors.textDim, fontSize: 11, marginTop: 2 }]}>
                    {formatDate(item.lastMessageAt || item.createdAt)}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={{ alignItems: "center", paddingVertical: spacing.xl }}>
                <MessageSquare width={28} height={28} color={colors.textDim} />
                <Text style={[{ color: colors.mutedForeground, fontSize: 13, marginTop: spacing.sm, textAlign: "center" }]}>
                  No chats yet
                </Text>
              </View>
            }
          />
        </View>
      </View>
    </Modal>
  );

  const renderEmpty = () => (
    <View style={{ flex: 1, justifyContent: "center", paddingBottom: 60 }}>
      <View style={{ alignItems: "center", marginBottom: spacing.xl }}>
        <View style={{
          width: 56, height: 56, borderRadius: 16,
          backgroundColor: "rgba(201, 168, 76, 0.1)",
          borderWidth: 1, borderColor: "rgba(201, 168, 76, 0.3)",
          alignItems: "center", justifyContent: "center",
          marginBottom: spacing.md,
        }}>
          <Scale width={28} height={28} color={colors.accent} />
        </View>
        <Text style={[{ color: colors.foreground, fontSize: 20, fontWeight: "700", textAlign: "center" }]}>
          Legal Clarity,{'\n'}Powered by AI
        </Text>
        <Text style={[{ color: colors.mutedForeground, fontSize: 14, textAlign: "center", marginTop: spacing.sm, paddingHorizontal: spacing.xl }]}>
          Ask any legal question and get AI-powered answers with Indian law references.
        </Text>
      </View>

      <SuggestionPrompts onSelect={handleSelectSuggestion} />
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      {renderHeader()}
      {renderSidebar()}

      {messages.length === 0 ? (
        renderEmpty()
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.lg,
            paddingBottom: spacing.md,
          }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => (
            <ChatMessage
              role={item.role}
              content={item.content}
              agentType={item.agentType}
            />
          )}
        />
      )}

      {loading && messages.length > 0 && <View style={{ paddingHorizontal: spacing.lg }}><TypingIndicator /></View>}

      {error && (
        <View
          style={{
            marginHorizontal: spacing.lg,
            marginBottom: spacing.sm,
            padding: spacing.md,
            backgroundColor: "#450a0a",
            borderRadius: borderRadius.md,
            borderWidth: 1,
            borderColor: "rgba(239, 68, 68, 0.3)",
          }}
        >
          <Text style={[{ color: colors.error, fontSize: 13 }]}>{error}</Text>
        </View>
      )}

      <ChatInput onSend={send} loading={loading} />

      {agentType && (
        <View style={{ position: "absolute", top: 100, right: spacing.lg }}>
          <Badge label={agentType} variant="primary" size="sm" />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
