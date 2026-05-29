import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { toErrorResponse } from "@/lib/errors/api-error";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalChats,
      totalDocuments,
      totalCases,
      recentUsers,
      chatCountByDay,
      agentUsage,
      tokensUsed,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.chat.count(),
      prisma.document.count(),
      prisma.legalCase.count(),
      prisma.user.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.message.groupBy({
        by: ["createdAt"],
        _count: { id: true },
        where: {
          createdAt: { gte: thirtyDaysAgo },
          role: "USER",
        },
      }),
      prisma.chat.groupBy({
        by: ["agentType"],
        _count: { id: true },
      }),
      prisma.aIUsageLog.aggregate({
        _sum: { totalTokens: true },
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
    ]);

    const dailyChats = chatCountByDay.map((c) => ({
      date: c.createdAt.toISOString().split("T")[0],
      count: c._count.id,
    }));

    const agentDistribution = agentUsage.map((a) => ({
      agent: a.agentType,
      count: a._count.id,
    }));

    return Response.json({
      totalUsers,
      totalChats,
      totalDocuments,
      totalCases,
      recentUsers,
      dailyChats,
      agentDistribution,
      tokensUsedLast30Days: tokensUsed._sum.totalTokens ?? 0,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
