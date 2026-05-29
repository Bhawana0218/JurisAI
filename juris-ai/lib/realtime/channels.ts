export function channelForChat(chatId: string): string {
  return `chat:${chatId}`;
}

export function channelForOrg(orgId: string): string {
  return `org:${orgId}`;
}

export function channelForUser(userId: string): string {
  return `user:${userId}`;
}
