import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function getSupabaseRealtime(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  if (!client) {
    client = createClient(url, key, {
      realtime: { params: { eventsPerSecond: 20 } },
    });
  }
  return client;
}

export async function broadcastToChannel(
  channelName: string,
  event: string,
  payload: Record<string, unknown>
): Promise<void> {
  const supabase = getSupabaseRealtime();
  if (!supabase) return;

  const channel = supabase.channel(channelName);
  await channel.subscribe();
  await channel.send({
    type: "broadcast",
    event,
    payload,
  });
  await supabase.removeChannel(channel);
}
