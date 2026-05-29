export const APP_NAME = "JurisAI";
export const APP_DESCRIPTION = "AI-powered legal intelligence platform for citizens, law firms, and enterprises";
export const APP_TAGLINE = "Legal intelligence, simplified";

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

export const RATE_LIMITS = {
  CHAT_REQUESTS_PER_MINUTE: 30,
  API_REQUESTS_PER_MINUTE: 60,
  DOCUMENT_UPLOADS_PER_HOUR: 10,
} as const;

export const FILE_UPLOAD = {
  MAX_FILE_SIZE_MB: 25,
  ALLOWED_MIME_TYPES: [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "text/markdown",
    "application/json",
  ] as const,
} as const;

export const CACHE_TTL = {
  SHORT: 60,
  MEDIUM: 300,
  LONG: 3600,
  DAY: 86400,
} as const;

export const AI_CONFIG = {
  DEFAULT_TEMPERATURE: 0.7,
  MAX_TOKENS: 4096,
  MEMORY_SUMMARY_LENGTH: 400,
} as const;
