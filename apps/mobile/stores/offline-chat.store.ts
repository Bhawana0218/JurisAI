import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { OfflineChatMessage } from "@jurisai/shared";

interface OfflineChatState {
  messages: OfflineChatMessage[];
  pendingOps: { clientId: string; payload: unknown }[];
  addMessage: (msg: OfflineChatMessage) => void;
  setMessages: (msgs: OfflineChatMessage[]) => void;
  queueOp: (op: { clientId: string; payload: unknown }) => void;
  clearPending: () => void;
}

export const useOfflineChatStore = create<OfflineChatState>()(
  persist(
    (set) => ({
      messages: [],
      pendingOps: [],
      addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
      setMessages: (messages) => set({ messages }),
      queueOp: (op) => set((s) => ({ pendingOps: [...s.pendingOps, op] })),
      clearPending: () => set({ pendingOps: [] }),
    }),
    { name: "juris-offline-chat", storage: createJSONStorage(() => AsyncStorage) }
  )
);
