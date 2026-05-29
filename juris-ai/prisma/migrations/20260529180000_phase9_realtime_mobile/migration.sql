-- Phase 9: Real-time, mobile, productivity

CREATE EXTENSION IF NOT EXISTS vector;

DO $$ BEGIN CREATE TYPE "AgentType" AS ENUM ('GENERAL','CYBERCRIME','CONSUMER_RIGHTS','EMPLOYMENT_LAW','WOMEN_SAFETY','FIR_ASSISTANT','LEGAL_RESEARCH','DOCUMENT_REVIEW','COURT_PROCEDURE'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "DevicePlatform" AS ENUM ('WEB','IOS','ANDROID'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "PresenceStatus" AS ENUM ('ONLINE','AWAY','OFFLINE'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "TaskStatus" AS ENUM ('TODO','IN_PROGRESS','DONE','CANCELLED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "CaseStatus" AS ENUM ('OPEN','ACTIVE','CLOSED','ARCHIVED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "SyncEntityType" AS ENUM ('MESSAGE','CHAT','NOTE','TASK','CASE','CALENDAR_EVENT'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "SyncOperationType" AS ENUM ('CREATE','UPDATE','DELETE'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "UserDevice" (
    "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "deviceId" TEXT NOT NULL,
    "platform" "DevicePlatform" NOT NULL, "pushToken" TEXT, "appVersion" TEXT,
    "biometricEnabled" BOOLEAN NOT NULL DEFAULT false, "lastSyncAt" TIMESTAMP(3),
    CONSTRAINT "UserDevice_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "UserDevice_userId_deviceId_key" ON "UserDevice"("userId","deviceId");

CREATE TABLE IF NOT EXISTS "UserPresence" (
    "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "organizationId" TEXT,
    "status" "PresenceStatus" NOT NULL DEFAULT 'OFFLINE', "device" "DevicePlatform",
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserPresence_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "UserPresence_userId_organizationId_key" ON "UserPresence"("userId","organizationId");

CREATE TABLE IF NOT EXISTS "SyncOperation" (
    "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "clientId" TEXT NOT NULL,
    "entityType" "SyncEntityType" NOT NULL, "entityId" TEXT NOT NULL,
    "operation" "SyncOperationType" NOT NULL, "payload" JSONB NOT NULL,
    "synced" BOOLEAN NOT NULL DEFAULT false, "conflictResolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SyncOperation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "CollaborationRoom" (
    "id" TEXT NOT NULL, "name" TEXT NOT NULL, "chatId" TEXT, "organizationId" TEXT NOT NULL,
    "activeUsers" JSONB, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CollaborationRoom_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "CollaborationRoom_chatId_key" ON "CollaborationRoom"("chatId");

CREATE TABLE IF NOT EXISTS "LegalCase" (
    "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "organizationId" TEXT,
    "title" TEXT NOT NULL, "description" TEXT, "status" "CaseStatus" NOT NULL DEFAULT 'OPEN',
    "courtName" TEXT, "caseNumber" TEXT, "timeline" JSONB, "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LegalCase_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "LegalTask" (
    "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "caseId" TEXT,
    "title" TEXT NOT NULL, "description" TEXT, "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
    "dueAt" TIMESTAMP(3), "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LegalTask_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "AINote" (
    "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "title" TEXT NOT NULL,
    "content" TEXT NOT NULL, "summary" TEXT, "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AINote_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "CalendarEvent" (
    "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "title" TEXT NOT NULL,
    "description" TEXT, "startsAt" TIMESTAMP(3) NOT NULL, "endsAt" TIMESTAMP(3),
    "reminderAt" TIMESTAMP(3), "caseId" TEXT, "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CalendarEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "MeetingSummary" (
    "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "title" TEXT NOT NULL,
    "transcript" TEXT, "summary" TEXT NOT NULL, "actionItems" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MeetingSummary_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "EmailDraft" (
    "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL, "recipients" JSONB, "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EmailDraft_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "clientId" TEXT;
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "syncedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "activeOrganizationId" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "preferredLanguage" TEXT NOT NULL DEFAULT 'en';
