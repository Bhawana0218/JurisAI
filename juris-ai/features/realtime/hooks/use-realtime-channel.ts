"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export function useRealtimeChannel(channel: string | null) {
  const [events, setEvents] = useState<unknown[]>([]);
  const [connected, setConnected] = useState(false);
  const sinceRef = useRef<string | undefined>();

  const connect = useCallback(() => {
    if (!channel) return;

    const url = `/api/realtime/stream?channel=${encodeURIComponent(channel)}${sinceRef.current ? `&since=${sinceRef.current}` : ""}`;
    const es = new EventSource(url);

    es.onopen = () => setConnected(true);
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        setEvents((prev) => [...prev.slice(-49), data]);
        if (data.timestamp) sinceRef.current = data.timestamp;
      } catch {
        /* ignore */
      }
    };
    es.onerror = () => {
      setConnected(false);
      es.close();
    };

    return () => {
      es.close();
      setConnected(false);
    };
  }, [channel]);

  useEffect(() => {
    const cleanup = connect();
    return cleanup;
  }, [connect]);

  return { events, connected };
}
