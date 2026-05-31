import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { ApiKeyScope } from "@prisma/client";
import { eventBus } from "../../event-bus/event-bus";

type CreateApiKeyInput = {
  name: string;
  userId?: string;
  organizationId?: string;
  scopes: ApiKeyScope[];
  rateLimit?: number;
  allowedIpPatterns?: string[];
  expiresAt?: Date;
};

type ApiKeyResponse = {
  id: string;
  name: string;
  keyPrefix: string;
  fullKey: string;
  scopes: ApiKeyScope[];
  createdAt: Date;
};

class ApiKeyManager {
  private readonly KEY_PREFIX = "jsk";
  private readonly KEY_LENGTH = 48;

  async create(input: CreateApiKeyInput): Promise<ApiKeyResponse> {
    const { key, prefix, hash: keyHash } = await this.generateKey();

    const apiKey = await prisma.apiKey.create({
      data: {
        name: input.name,
        keyPrefix: prefix,
        keyHash,
        scopes: input.scopes,
        userId: input.userId,
        organizationId: input.organizationId,
        rateLimit: input.rateLimit || 60,
        allowedIpPatterns: input.allowedIpPatterns || [],
        expiresAt: input.expiresAt,
      },
    });

    await eventBus.publish({
      type: "apikey.created",
      source: "jurisai:api-key-manager",
      data: { keyId: apiKey.id, name: apiKey.name, scopes: apiKey.scopes },
      metadata: { userId: input.userId, organizationId: input.organizationId, version: 1 },
    });

    return {
      id: apiKey.id,
      name: apiKey.name,
      keyPrefix: prefix,
      fullKey: `${prefix}.${key}`,
      scopes: apiKey.scopes,
      createdAt: apiKey.createdAt,
    };
  }

  async revoke(keyId: string): Promise<void> {
    await prisma.apiKey.update({
      where: { id: keyId },
      data: { isRevoked: true, revokedAt: new Date() },
    });
  }

  async list(organizationId: string): Promise<Array<{ id: string; name: string; keyPrefix: string; scopes: ApiKeyScope[]; createdAt: Date; lastUsedAt: Date | null; isRevoked: boolean }>> {
    return prisma.apiKey.findMany({
      where: { organizationId, isRevoked: false },
      select: { id: true, name: true, keyPrefix: true, scopes: true, createdAt: true, lastUsedAt: true, isRevoked: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateLastUsed(keyId: string): Promise<void> {
    await prisma.apiKey.update({
      where: { id: keyId },
      data: { lastUsedAt: new Date() },
    }).catch(() => {});
  }

  async verify(apiKey: string): Promise<{ valid: boolean; keyId?: string; userId?: string; organizationId?: string; scopes?: ApiKeyScope[] }> {
    const parts = apiKey.split(".");
    if (parts.length !== 2) return { valid: false };
    const [prefix, key] = parts;

    const record = await prisma.apiKey.findFirst({
      where: { keyPrefix: prefix, isRevoked: false },
    });

    if (!record) return { valid: false };

    if (record.expiresAt && record.expiresAt < new Date()) {
      return { valid: false };
    }

    const isValid = await this.verifyKey(key, record.keyHash);
    if (!isValid) return { valid: false };

    await this.updateLastUsed(record.id);

    return {
      valid: true,
      keyId: record.id,
      userId: record.userId || undefined,
      organizationId: record.organizationId || undefined,
      scopes: record.scopes,
    };
  }

  private async generateKey(): Promise<{ key: string; prefix: string; hash: string }> {
    const raw = crypto.getRandomValues(new Uint8Array(32));
    const key = Array.from(raw)
      .map((b) => b.toString(36).padStart(2, "0"))
      .join("")
      .slice(0, this.KEY_LENGTH);
    const prefix = `${this.KEY_PREFIX}_${key.slice(0, 8)}`;
    const fullKey = `${key.slice(8)}`;

    const salt = await bcrypt.genSalt(10);
    const keyHash = await bcrypt.hash(fullKey, salt);

    return { key: fullKey, prefix, hash: keyHash };
  }

  private async verifyKey(key: string, keyHash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(key, keyHash);
    } catch {
      return false;
    }
  }
}

export const apiKeyManager = new ApiKeyManager();
