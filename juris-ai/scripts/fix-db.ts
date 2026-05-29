import { prisma } from "../lib/prisma";

async function main() {
  console.log("Checking and fixing database schema...");

  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "activeOrganizationId" TEXT;`);
    console.log("✓ Added activeOrganizationId column to User table");
  } catch (e) {
    console.log("→ activeOrganizationId column already exists or error:", e);
  }

  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "preferredLanguage" TEXT NOT NULL DEFAULT 'en';`);
    console.log("✓ Added preferredLanguage column to User table");
  } catch (e) {
    console.log("→ preferredLanguage column already exists or error:", e);
  }

  try {
    await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS vector;`);
    console.log("✓ pgvector extension enabled");
  } catch (e) {
    console.log("→ pgvector extension error:", e);
  }

  console.log("Schema fix complete.");
  await prisma.$disconnect();
}

main();
