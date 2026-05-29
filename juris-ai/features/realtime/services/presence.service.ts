import type { DevicePlatform, PresenceStatus } from "@prisma/client";

import { publishEvent, RealtimeEvents } from "@/lib/realtime/publisher";
import { channelForOrg, channelForUser } from "@/lib/realtime/channels";
import { prisma } from "@/lib/prisma";

export async function updatePresence(params: {
  userId: string;
  status: PresenceStatus;
  organizationId?: string;
  device?: DevicePlatform;
}) {
  const existing = await prisma.userPresence.findFirst({
    where: {
      userId: params.userId,
      organizationId: params.organizationId ?? null,
    },
  });

  const presence = existing
    ? await prisma.userPresence.update({
        where: { id: existing.id },
        data: {
          status: params.status,
          device: params.device,
          lastSeenAt: new Date(),
        },
      })
    : await prisma.userPresence.create({
        data: {
          userId: params.userId,
          organizationId: params.organizationId,
          status: params.status,
          device: params.device,
        },
      });

  const channel = params.organizationId
    ? channelForOrg(params.organizationId)
    : channelForUser(params.userId);

  await publishEvent(channel, {
    type: RealtimeEvents.presenceUpdate,
    payload: {
      userId: params.userId,
      status: params.status,
      device: params.device,
    },
    userId: params.userId,
  });

  return presence;
}

export async function getOrgPresence(organizationId: string) {
  return prisma.userPresence.findMany({
    where: { organizationId },
    include: { user: { select: { id: true, name: true, image: true } } },
  });
}
