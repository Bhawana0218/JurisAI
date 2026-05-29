/**
 * Standalone WebSocket server for production real-time (Railway/Fly/ECS).
 * Run: npx tsx server/realtime/ws-server.ts
 */
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";

const PORT = Number(process.env.WS_PORT ?? 3001);
const channels = new Map<string, Set<WebSocket>>();

const httpServer = createServer();
const wss = new WebSocketServer({ server: httpServer });

wss.on("connection", (ws, req) => {
  const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);
  const channel = url.searchParams.get("channel") ?? "default";

  if (!channels.has(channel)) channels.set(channel, new Set());
  channels.get(channel)!.add(ws);

  ws.on("message", (raw: any) => {
    const text = raw.toString();
    let parsed: { type?: string };
    try {
      parsed = JSON.parse(text);
    } catch {
      return;
    }

    const peers = channels.get(channel);
    if (!peers) return;

    for (const peer of peers) {
      if (peer !== ws && peer.readyState === WebSocket.OPEN) {
        peer.send(text);
      }
    }
  });

  ws.on("close", () => {
    channels.get(channel)?.delete(ws);
  });

  ws.send(JSON.stringify({ type: "connected", channel, timestamp: new Date().toISOString() }));
});

httpServer.listen(PORT, () => {
  console.log(`JurisAI WebSocket server on :${PORT}`);
});
