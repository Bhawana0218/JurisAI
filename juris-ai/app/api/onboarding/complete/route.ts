import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { emailService } from "@/lib/email/email-service";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { workspaceName, role, interests } = body;

    const org = await prisma.organization.create({
      data: {
        name: workspaceName || `${session.user.name || "User"}'s Workspace`,
        slug: workspaceName?.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now().toString(36),
        settings: { role, interests } as any,
        members: {
          create: { userId: session.user.id, role: "OWNER" },
        },
      },
    });

    await prisma.user.update({
      where: { id: session.user.id },
      data: { activeOrganizationId: org.id, isVerified: true },
    });

    await prisma.subscription.create({
      data: {
        organizationId: org.id,
        plan: "FREE",
        status: "ACTIVE",
        monthlyTokenLimit: 10000,
        monthlyApiCallLimit: 100,
        monthlyAgentLimit: 20,
        features: ["basic-chat", "document-upload", "basic-agents"],
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    await emailService.send("welcome", session.user.email!, {
      name: session.user.name || "there",
      url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    });

    return NextResponse.json({ orgId: org.id, slug: org.slug });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
