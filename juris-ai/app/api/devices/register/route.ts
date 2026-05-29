import { auth } from "@/auth";
import type { DevicePlatform } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { toErrorResponse } from "@/lib/errors/api-error";
import { ApiError } from "@/lib/errors/api-error";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

    const { deviceId, platform, pushToken, appVersion, biometricEnabled } =
      await req.json();

    if (!deviceId || !platform) {
      throw new ApiError("deviceId and platform required", 400);
    }

    const device = await prisma.userDevice.upsert({
      where: {
        userId_deviceId: {
          userId: session.user.id,
          deviceId,
        },
      },
      create: {
        userId: session.user.id,
        deviceId,
        platform: platform as DevicePlatform,
        pushToken,
        appVersion,
        biometricEnabled: biometricEnabled ?? false,
        lastSyncAt: new Date(),
      },
      update: {
        pushToken,
        appVersion,
        biometricEnabled,
        lastSyncAt: new Date(),
      },
    });

    return Response.json({ device: { id: device.id, platform: device.platform } });
  } catch (error) {
    return toErrorResponse(error);
  }
}
