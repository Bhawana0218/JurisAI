import { z } from "zod";

export const emailSchema = z.string().email("Invalid email address");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password must be at most 100 characters");

export const uuidSchema = z.string().cuid("Invalid ID format");

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const chatMessageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty").max(50000),
  chatId: z.string().cuid().optional(),
  documentIds: z.array(z.string().cuid()).optional(),
  agentId: z.string().optional(),
  useRag: z.boolean().optional().default(true),
  language: z.string().optional().default("en"),
  organizationId: z.string().cuid().optional(),
});

export const documentUploadSchema = z.object({
  title: z.string().min(1).max(500),
  fileUrl: z.string().url(),
  mimeType: z.string().optional(),
  fileSize: z.number().int().positive().optional(),
  organizationId: z.string().cuid().optional(),
});
