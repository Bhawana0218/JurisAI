import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { ApiKeyScope } from "@prisma/client";

export type VerifiedKeyData = {
  keyId: string;
  userId?: string;
  organizationId?: string;
  scopes: ApiKeyScope[];
};

const verificationCache = new Map<string, { data: VerifiedKeyData; expiresAt: number }>();

export async function verifyApiKey(apiKey: string): Promise<VerifiedKeyData | null> {
  const parts = apiKey.split(".");
  if (parts.length !== 2) return null;
  const [prefix] = parts;

  const cached = verificationCache.get(apiKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const record = await prisma.apiKey.findFirst({
    where: { keyPrefix: prefix, isRevoked: false },
  });

  if (!record) return null;

  if (record.expiresAt && record.expiresAt < new Date()) {
    return null;
  }

  const key = apiKey.slice(prefix.length + 1);
  const isValid = await verifyKeyHash(key, record.keyHash);
  if (!isValid) return null;

  const data: VerifiedKeyData = {
    keyId: record.id,
    userId: record.userId || undefined,
    organizationId: record.organizationId || undefined,
    scopes: record.scopes,
  };

  verificationCache.set(apiKey, { data, expiresAt: Date.now() + 300000 });

  prisma.apiKey
    .update({ where: { id: record.id }, data: { lastUsedAt: new Date() } })
    .catch(() => {});

  return data;
}

async function verifyKeyHash(key: string, keyHash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(key, keyHash);
  } catch {
    return false;
  }
}
