import type { Prisma, SyncEntityType, SyncOperationType } from "@prisma/client";

import { publishEvent, RealtimeEvents } from "@/lib/realtime/publisher";
import { channelForUser } from "@/lib/realtime/channels";
import { prisma } from "@/lib/prisma";

export interface ClientSyncOp {
  clientId: string;
  entityType: SyncEntityType;
  entityId: string;
  operation: SyncOperationType;
  payload: Record<string, unknown>;
}

export async function pushSyncOperations(
  userId: string,
  operations: ClientSyncOp[]
): Promise<{ synced: string[]; conflicts: string[] }> {
  const synced: string[] = [];
  const conflicts: string[] = [];

  for (const op of operations) {
    const existing = await prisma.syncOperation.findFirst({
      where: { userId, clientId: op.clientId },
    });

    if (existing?.synced) {
      synced.push(op.clientId);
      continue;
    }

    if (existing) {
      await prisma.syncOperation.update({
        where: { id: existing.id },
        data: { payload: op.payload as Prisma.InputJsonValue },
      });
    } else {
      await prisma.syncOperation.create({
        data: {
          userId,
          clientId: op.clientId,
          entityType: op.entityType,
          entityId: op.entityId,
          operation: op.operation,
          payload: op.payload as Prisma.InputJsonValue,
        },
      });
    }

    try {
      await applySyncOperation(userId, op);
      await prisma.syncOperation.updateMany({
        where: { userId, clientId: op.clientId },
        data: { synced: true },
      });
      synced.push(op.clientId);
    } catch {
      conflicts.push(op.clientId);
    }
  }

  await publishEvent(channelForUser(userId), {
    type: RealtimeEvents.syncPush,
    payload: { synced, conflicts },
    userId,
  });

  return { synced, conflicts };
}

async function applySyncOperation(userId: string, op: ClientSyncOp): Promise<void> {
  if (op.entityType === "MESSAGE" && op.operation === "CREATE") {
    const { chatId, content, role } = op.payload as {
      chatId: string;
      content: string;
      role: string;
    };
    const chat = await prisma.chat.findFirst({ where: { id: chatId, userId } });
    if (!chat) throw new Error("Chat not found");

    await prisma.message.create({
      data: {
        chatId,
        content,
        role: role.toUpperCase() === "ASSISTANT" ? "ASSISTANT" : "USER",
        clientId: op.clientId,
        syncedAt: new Date(),
      },
    });
  }
}

export async function getSyncCursor(userId: string): Promise<string> {
  const last = await prisma.syncOperation.findFirst({
    where: { userId, synced: true },
    orderBy: { createdAt: "desc" },
  });
  return last?.createdAt.toISOString() ?? new Date(0).toISOString();
}
