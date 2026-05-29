"use client";

import { use } from "react";
import { ChatView } from "@/components/ui/chat/ChatView";

export default function ChatByIdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ChatView chatId={id} />;
}
