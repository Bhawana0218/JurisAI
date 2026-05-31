// import { prisma, Prisma } from "@/lib/prisma";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { aiRuntime } from "../ai-runtime/ai-runtime";
import { eventBus } from "../event-bus/event-bus";
import { logger } from "../observability/logging/logger";

type Entity = {
  label: string;
  type: string;
  properties?: Record<string, unknown>;
};

type Relation = {
  fromLabel: string;
  toLabel: string;
  relationType: string;
  properties?: Record<string, unknown>;
};

type QueryResultNode = {
  id: string;
  label: string;
  type: string;
  entity_type: string;
  properties: unknown;
  distance: number;
};

class KnowledgeGraphEngine {
  async extractEntitiesAndRelations(
    text: string,
  ): Promise<{
    entities: Entity[];
    relations: Relation[];
  }> {
    const result = await generateText({
      model: openai("gpt-4.1-mini"),
      system: `
You are a legal knowledge graph extractor.

Extract legal entities and relationships from the text.

Return ONLY valid JSON:

{
  "entities": [
    {
      "label": "string",
      "type": "string",
      "properties": {}
    }
  ],
  "relations": [
    {
      "fromLabel": "string",
      "toLabel": "string",
      "relationType": "string",
      "properties": {}
    }
  ]
}
      `,
      messages: [
        {
          role: "user",
          content: text,
        },
      ],
      maxOutputTokens: 2000,
    });

    try {
      const parsed = JSON.parse(result.text);

      return {
        entities: parsed.entities ?? [],
        relations: parsed.relations ?? [],
      };
    } catch {
      logger.warn(
        "[KnowledgeGraph] Failed to parse extraction result",
        {
          text: result.text.slice(0, 200),
        },
      );

      return {
        entities: [],
        relations: [],
      };
    }
  }

  async buildFromText(
    text: string,
    sourceId?: string,
    legalKnowledgeId?: string,
  ): Promise<{
    nodesCreated: number;
    edgesCreated: number;
  }> {
    const { entities, relations } =
      await this.extractEntitiesAndRelations(text);

    let nodesCreated = 0;
    let edgesCreated = 0;

    for (const entity of entities) {
      const embedding = await aiRuntime.generateEmbedding(
        `${entity.label} ${JSON.stringify(entity.properties ?? {})}`,
      );

      const entityId = sourceId || entity.label;

      const existing =
        await prisma.knowledgeGraphNode.findFirst({
          where: {
            entityId,
            entityType: entity.type,
          },
        });

      if (!existing) {
        await prisma.knowledgeGraphNode.create({
          data: {
            label: entity.label,
            type: entity.type,
            entityType: entity.type,
            entityId,
            properties: (entity.properties ?? {}) as any,
            embedding: embedding as any,
          },
        });

        nodesCreated++;
      }
    }

    for (const relation of relations) {
      const fromNode =
        await prisma.knowledgeGraphNode.findFirst({
          where: {
            label: relation.fromLabel,
          },
        });

      const toNode =
        await prisma.knowledgeGraphNode.findFirst({
          where: {
            label: relation.toLabel,
          },
        });

      if (!fromNode || !toNode) {
        continue;
      }

      const existing =
        await prisma.knowledgeGraphEdge.findFirst({
          where: {
            fromNodeId: fromNode.id,
            toNodeId: toNode.id,
            relationType: relation.relationType,
          },
        });

      if (!existing) {
        await prisma.knowledgeGraphEdge.create({
          data: {
            fromNodeId: fromNode.id,
            toNodeId: toNode.id,
            relationType: relation.relationType,
            properties: (relation.properties ?? {}) as any,
            sourceId,
            fromKnowledgeId: legalKnowledgeId,
            toKnowledgeId: legalKnowledgeId,
          },
        });

        edgesCreated++;
      }
    }

    if (nodesCreated > 0 || edgesCreated > 0) {
      await eventBus.publish({
        type: "knowledge.sync.completed",
        source: "jurisai:knowledge-graph",
        data: {
          sourceId,
          nodesCreated,
          edgesCreated,
        },
        metadata: {
          version: 1,
        },
      });
    }

    return {
      nodesCreated,
      edgesCreated,
    };
  }

  async query(params: {
    query: string;
    types?: string[];
    maxResults?: number;
    maxDepth?: number;
  }): Promise<{
    nodes: unknown[];
    edges: unknown[];
  }> {
    const embedding =
      await aiRuntime.generateEmbedding(params.query);

    const maxResults = params.maxResults ?? 20;

    const nodes =
      await prisma.$queryRaw<QueryResultNode[]>`
        SELECT
          id,
          label,
          type,
          entity_type,
          properties,
          1 - (embedding <=> ${embedding}::vector) AS distance
        FROM "KnowledgeGraphNode"
        ${
          params.types?.length
            ? Prisma.sql`
              WHERE type = ANY(${params.types}::text[])
            `
            : Prisma.sql``
        }
        ORDER BY distance DESC
        LIMIT ${maxResults}
      `;

    const filteredNodes = nodes.filter(
      (node) => node.distance > 0.6,
    );

    const nodeIds = filteredNodes.map(
      (node) => node.id,
    );

    if (nodeIds.length === 0) {
      return {
        nodes: [],
        edges: [],
      };
    }

    const edges =
      await prisma.knowledgeGraphEdge.findMany({
        where: {
          OR: [
            {
              fromNodeId: {
                in: nodeIds,
              },
            },
            {
              toNodeId: {
                in: nodeIds,
              },
            },
          ],
        },
        include: {
          fromNode: {
            select: {
              id: true,
              label: true,
              type: true,
            },
          },
          toNode: {
            select: {
              id: true,
              label: true,
              type: true,
            },
          },
        },
        take: maxResults * 2,
      });

    return {
      nodes: filteredNodes.map((node) => ({
        id: node.id,
        label: node.label,
        type: node.type,
        entityType: node.entity_type,
        properties: node.properties,
        score: node.distance,
      })),
      edges: edges.map((edge) => ({
        id: edge.id,
        source: edge.fromNodeId,
        target: edge.toNodeId,
        relation: edge.relationType,
        sourceLabel: edge.fromNode.label,
        targetLabel: edge.toNode.label,
      })),
    };
  }

  async getNodeWithNeighbors(
    nodeId: string,
  ) {
    const node =
      await prisma.knowledgeGraphNode.findUnique({
        where: {
          id: nodeId,
        },
      });

    if (!node) {
      throw new Error("Node not found");
    }

    const edges =
      await prisma.knowledgeGraphEdge.findMany({
        where: {
          OR: [
            { fromNodeId: nodeId },
            { toNodeId: nodeId },
          ],
        },
        include: {
          fromNode: true,
          toNode: true,
        },
      });

    const neighborIds = new Set<string>();

    for (const edge of edges) {
      if (edge.fromNodeId !== nodeId) {
        neighborIds.add(edge.fromNodeId);
      }

      if (edge.toNodeId !== nodeId) {
        neighborIds.add(edge.toNodeId);
      }
    }

    const neighbors =
      await prisma.knowledgeGraphNode.findMany({
        where: {
          id: {
            in: [...neighborIds],
          },
        },
      });

    return {
      node,
      neighbors,
      edges,
    };
  }

  async stats() {
    const [
      totalNodes,
      totalEdges,
      nodeTypeAgg,
      edgeTypeAgg,
    ] = await Promise.all([
      prisma.knowledgeGraphNode.count(),
      prisma.knowledgeGraphEdge.count(),
      prisma.knowledgeGraphNode.groupBy({
        by: ["type"],
        _count: true,
      }),
      prisma.knowledgeGraphEdge.groupBy({
        by: ["relationType"],
        _count: true,
      }),
    ]);

    return {
      totalNodes,
      totalEdges,
      nodeTypes: Object.fromEntries(
        nodeTypeAgg.map((item) => [
          item.type,
          item._count,
        ]),
      ),
      edgeTypes: Object.fromEntries(
        edgeTypeAgg.map((item) => [
          item.relationType,
          item._count,
        ]),
      ),
    };
  }
}

export const knowledgeGraph =
  new KnowledgeGraphEngine();