import { publishEvent, RealtimeEvents } from "@/lib/realtime/publisher";
import { channelForChat } from "@/lib/realtime/channels";
import { cacheSet, cacheKey } from "@/lib/cache/redis";

const TYPING_TTL = 5;

export async function setTyping(
  chatId: string,
  userId: string,
  isTyping: boolean
): Promise<void> {
  const channel = channelForChat(chatId);

  if (isTyping) {
    await cacheSet(cacheKey("typing", chatId, userId), true, TYPING_TTL);
    await publishEvent(channel, {
      type: RealtimeEvents.typingStart,
      payload: { userId },
      userId,
    });
  } else {
    await publishEvent(channel, {
      type: RealtimeEvents.typingStop,
      payload: { userId },
      userId,
    });
  }
}
