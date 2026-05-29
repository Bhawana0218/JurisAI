import { auth } from "@/auth";
import { getChannelEvents } from "@/lib/realtime/publisher";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * SSE stream for real-time events (works on Vercel; use WS server for dedicated deploy).
 * GET /api/realtime/stream?channel=chat:xxx&since=ISO
 */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const channel = searchParams.get("channel");
  if (!channel) {
    return new Response("channel required", { status: 400 });
  }

  const since = searchParams.get("since") ?? undefined;
  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: unknown) => {
        if (closed) return;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      send({ type: "connected", channel });

      const poll = async () => {
        while (!closed) {
          const events = await getChannelEvents(channel, since);
          for (const event of events) {
            send(event);
          }
          await new Promise((r) => setTimeout(r, 1500));
        }
      };

      void poll();
    },
    cancel() {
      closed = true;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
