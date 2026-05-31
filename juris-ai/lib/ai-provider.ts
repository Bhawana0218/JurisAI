import { createOpenAI } from "@ai-sdk/openai";

// ── Chat provider (OpenRouter) ────────────────────────────────────────────────
// OpenRouter proxies many models but requires the full provider-prefixed model
// ID (e.g. "openai/gpt-4.1-mini") and does NOT support the embeddings endpoint.
const openRouterApiKey =
  process.env.OPENROUTER_API_KEY ?? process.env.OPENAI_API_KEY ?? "";

export const aiProvider = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: openRouterApiKey,
  headers: {
    // Required by OpenRouter to identify the calling app.
    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    "X-Title": "JurisAI",
  },
});

export function getChatModel(model: string) {
  return aiProvider(model);
}

// ── Embedding provider (OpenAI directly) ─────────────────────────────────────
// OpenRouter does not support embeddings. We use the real OpenAI API for this.
// If OPENAI_DIRECT_API_KEY is not set we fall back gracefully (embeddings will
// be skipped and keyword-only search will be used instead).
const openAiDirectKey = process.env.OPENAI_DIRECT_API_KEY ?? "";

const embeddingProvider = openAiDirectKey
  ? createOpenAI({
      baseURL: "https://api.openai.com/v1",
      apiKey: openAiDirectKey,
    })
  : null;

export function getEmbeddingModel(model: string) {
  if (!embeddingProvider) {
    throw new Error(
      "OPENAI_DIRECT_API_KEY is not set. Embeddings are unavailable. " +
        "Set this env var to enable semantic search, or queries will use keyword search only."
    );
  }
  return embeddingProvider.embedding(model);
}
