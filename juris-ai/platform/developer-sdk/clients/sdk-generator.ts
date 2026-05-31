export interface SdkConfig {
  baseUrl: string;
  apiKey: string;
  organizationId?: string;
  timeout?: number;
  retries?: number;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
  requestId: string;
}

export class JurisAiClient {
  private config: Required<SdkConfig>;

  constructor(config: SdkConfig) {
    this.config = {
      baseUrl: config.baseUrl.replace(/\/$/, ""),
      apiKey: config.apiKey,
      organizationId: config.organizationId!,
      timeout: config.timeout || 30000,
      retries: config.retries || 3,
    };
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    options?: { timeout?: number },
  ): Promise<ApiResponse<T>> {
    const url = `${this.config.baseUrl}/api/v1${path}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.config.apiKey}`,
      "X-SDK-Version": "jurisai-sdk-ts-1.0.0",
    };

    if (this.config.organizationId) {
      headers["X-Organization-Id"] = this.config.organizationId;
    }

    let lastError: Error | null = null;
    const maxRetries = options?.timeout ? 1 : this.config.retries;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), options?.timeout || this.config.timeout);

        const response = await fetch(url, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeout);
        const requestId = response.headers.get("x-request-id") || crypto.randomUUID();

        if (!response.ok) {
          const errorBody = await response.text().catch(() => "Unknown error");
          return {
            data: null,
            error: errorBody,
            status: response.status,
            requestId,
          };
        }

        const data = await response.json();
        return { data: data as T, error: null, status: response.status, requestId };
      } catch (error: any) {
        lastError = error;
        if (error.name === "AbortError") break;
        if (attempt < maxRetries - 1) {
          await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 200));
        }
      }
    }

    return {
      data: null,
      error: lastError?.message || "Request failed",
      status: 0,
      requestId: crypto.randomUUID(),
    };
  }

  // Chat
  async createChat(params: { title: string; agentType?: string; language?: string }) {
    return this.request<{ id: string; title: string }>("POST", "/chats", params);
  }
  async sendMessage(chatId: string, content: string) {
    return this.request<{ id: string; role: string; content: string }>("POST", `/chats/${chatId}/messages`, { content });
  }

  // Documents
  async uploadDocument(file: File, metadata?: Record<string, unknown>) {
    const formData = new FormData();
    formData.append("file", file);
    if (metadata) formData.append("metadata", JSON.stringify(metadata));

    const response = await fetch(`${this.config.baseUrl}/api/v1/documents`, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.config.apiKey}` },
      body: formData,
    });

    return response.json();
  }
  async analyzeDocument(documentId: string) {
    return this.request<{ id: string; summary: string; keyFindings: any }>("POST", `/documents/${documentId}/analyze`);
  }

  // Agents
  async executeAgent(params: { agentType: string; query: string; documentIds?: string[] }) {
    return this.request<{ result: string; citations: any[]; executionId: string }>("POST", "/agents/execute", params);
  }
  async listAgents() {
    return this.request<Array<{ id: string; name: string; category: string; price: number }>>("GET", "/agents");
  }

  // Workflows
  async createWorkflow(params: { name: string; steps: any[] }) {
    return this.request<{ id: string; name: string }>("POST", "/workflows", params);
  }
  async executeWorkflow(workflowId: string, input?: Record<string, unknown>) {
    return this.request<{ executionId: string; status: string }>("POST", `/workflows/${workflowId}/execute`, input);
  }
  async getWorkflowStatus(executionId: string) {
    return this.request<{ status: string; currentStep: number; totalSteps: number }>("GET", `/workflows/executions/${executionId}`);
  }

  // Legal Research
  async legalResearch(query: string, jurisdiction?: string) {
    return this.request<{ results: Array<{ title: string; content: string; citations: string[] }> }>(
      "POST",
      "/legal/research",
      { query, jurisdiction },
    );
  }

  // Webhooks
  async createWebhook(params: { name: string; url: string; events: string[] }) {
    return this.request<{ id: string; name: string; status: string }>("POST", "/webhooks", params);
  }

  // Analytics
  async getUsage(params?: { startDate?: string; endDate?: string }) {
    return this.request<{ totalTokens: number; totalCalls: number; costs: number }>("GET", "/analytics/usage", params);
  }
}

export function createClient(config: SdkConfig): JurisAiClient {
  return new JurisAiClient(config);
}
