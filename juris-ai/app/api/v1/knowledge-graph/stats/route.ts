import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({}, { status: 401 });

    const [totalNodes, totalEdges, nodeTypeAgg] = await Promise.all([
      prisma.knowledgeGraphNode.count().catch(() => 0),
      prisma.knowledgeGraphEdge.count().catch(() => 0),
      prisma.knowledgeGraphNode
        .groupBy({ by: ["type"], _count: true })
        .catch(() => []),
    ]);

    return NextResponse.json({
      totalNodes,
      totalEdges,
      nodeTypes: nodeTypeAgg.length,
      nodeTypeBreakdown: Object.fromEntries(
        nodeTypeAgg.map((n) => [n.type, n._count])
      ),
    });
  } catch {
    return NextResponse.json({
      totalNodes: 0,
      totalEdges: 0,
      nodeTypes: 0,
      nodeTypeBreakdown: {},
    });
  }
}
