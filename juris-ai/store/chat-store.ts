"use client";

import { create } from "zustand";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt?: string;
}

export interface ChatSummary {
  id: string;
  title: string;
  agentType: string;
  lastMessageAt: string | null;
  createdAt: string;
}

interface ChatState {
  chats: ChatSummary[];
  currentChatId: string | null;
  messages: ChatMessage[];
  isStreaming: boolean;
  error: string | null;
  isLoadingChats: boolean;

  setChats: (chats: ChatSummary[]) => void;
  setCurrentChat: (chatId: string | null) => void;
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  updateLastMessage: (content: string) => void;
  setIsStreaming: (isStreaming: boolean) => void;
  setError: (error: string | null) => void;
  setIsLoadingChats: (loading: boolean) => void;
  appendToLastMessage: (chunk: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  chats: [],
  currentChatId: null,
  messages: [],
  isStreaming: false,
  error: null,
  isLoadingChats: false,

  setChats: (chats) => set({ chats }),
  setCurrentChat: (chatId) => set({ currentChatId: chatId }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  updateLastMessage: (content) =>
    set((state) => {
      const msgs = [...state.messages];
      if (msgs.length > 0) {
        msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], content };
      }
      return { messages: msgs };
    }),
  setIsStreaming: (isStreaming) => set({ isStreaming }),
  setError: (error) => set({ error }),
  setIsLoadingChats: (isLoadingChats) => set({ isLoadingChats }),
  appendToLastMessage: (chunk) =>
    set((state) => {
      const msgs = [...state.messages];
      if (msgs.length > 0) {
        const last = msgs[msgs.length - 1];
        msgs[msgs.length - 1] = { ...last, content: last.content + chunk };
      }
      return { messages: msgs };
    }),
}));
