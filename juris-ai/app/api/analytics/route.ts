import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { toErrorResponse } from "@/lib/errors/api-error";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return new Response("Unauthorized", { status: 401 });

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalChats,
      totalDocuments,
      totalCases,
      recentUsers,
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
      prisma.chat.groupBy({
        by: ["agentType"],
        _count: { id: true },
      }),
      prisma.aIUsageLog.aggregate({
        _sum: { totalTokens: true },
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
    ]);

    // Group daily chat messages by date using raw SQL to avoid
    // groupBy on a DateTime field (which groups by exact timestamp, not day).
    const dailyRaw = await prisma.$queryRaw<
      Array<{ date: string; count: bigint }>
    >`
      SELECT
        TO_CHAR("createdAt" AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS date,
        COUNT(id) AS count
      FROM "Message"
      WHERE "createdAt" >= ${thirtyDaysAgo}
        AND role = 'USER'
      GROUP BY date
      ORDER BY date ASC
    `;

    const dailyChats = dailyRaw.map((row) => ({
      date: row.date,
      count: Number(row.count),
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
    console.error("[Analytics API Error]", error);
    return toErrorResponse(error);
  }
}
