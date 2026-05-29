import { useEffect } from "react";
import { useOfflineChatStore } from "../stores/offline-chat.store";

export function useSyncOnReconnect(apiUrl: string) {
  const { pendingOps, clearPending } = useOfflineChatStore();

  useEffect(() => {
    if (pendingOps.length === 0) return;

    const sync = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ operations: pendingOps }),
        });
        if (res.ok) clearPending();
      } catch {
        /* retry later */
      }
    };

    void sync();
  }, [pendingOps.length, apiUrl, clearPending]);
}
