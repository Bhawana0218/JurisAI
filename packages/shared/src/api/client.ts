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
  if (!config.baseUrl) throw new Error("baseUrl is required");
  if (!config.apiKey) throw new Error("apiKey is required");

  this.config = {
    baseUrl: config.baseUrl.replace(/\/$/, ""),
    apiKey: config.apiKey,
    organizationId: config.organizationId ?? "", // safe fallback
    timeout: config.timeout ?? 30000,
    retries: config.retries ?? 3,
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

  // Original API methods
  getChats() { return this.request<Array<{ id: string; title: string }>>("GET", "/chats"); }
  getMessages(chatId: string) { return this.request("GET", `/chats/${chatId}/messages`); }
  sync(operations: any[]) { return this.request("POST", "/sync", { operations }); }
  registerDevice(body: any) { return this.request("POST", "/devices/register", body); }
  updatePresence(body: any) { return this.request("POST", "/presence", body); }
  getCases() { return this.request("GET", "/cases"); }
  getTasks() { return this.request("GET", "/tasks"); }
  getNotes() { return this.request("GET", "/notes"); }

  // --- Phase 10: Platform API Methods ---

  // Chat
  createChat(params: { title: string; agentType?: string; language?: string }) {
    return this.request<{ id: string; title: string }>("POST", "/chats", params);
  }
  sendMessage(chatId: string, content: string) {
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
  analyzeDocument(documentId: string) {
    return this.request<{ id: string; summary: string; keyFindings: any }>("POST", `/documents/${documentId}/analyze`);
  }

  // AI Agents
  executeAgent(params: { agentType: string; query: string; documentIds?: string[] }) {
    return this.request<{ result: string; citations: any[]; executionId: string }>("POST", "/agents/execute", params);
  }
  listAgents() {
    return this.request<Array<{ id: string; name: string; category: string; price: number }>>("GET", "/agents");
  }
  getAgentDetails(agentId: string) {
    return this.request("GET", `/agents/${agentId}`);
  }

  // Workflows
  createWorkflow(params: { name: string; steps: any[]; description?: string }) {
    return this.request<{ id: string; name: string }>("POST", "/workflows", params);
  }
  executeWorkflow(workflowId: string, input?: Record<string, unknown>) {
    return this.request<{ executionId: string; status: string }>("POST", `/workflows/${workflowId}/execute`, { input });
  }
  getWorkflowStatus(executionId: string) {
    return this.request<{ status: string; currentStep: number; totalSteps: number }>("GET", `/executions/${executionId}`);
  }
  cancelWorkflow(executionId: string) {
    return this.request("POST", `/executions/${executionId}/cancel`);
  }
  listWorkflows() {
    return this.request("GET", "/workflows");
  }

  // API Keys
  createApiKey(params: { name: string; scopes: string[] }) {
    return this.request<{ id: string; name: string; fullKey: string }>("POST", "/api-keys", params);
  }
  listApiKeys() {
    return this.request("GET", "/api-keys");
  }
  revokeApiKey(id: string) {
    return this.request("POST", `/api-keys/${id}/revoke`);
  }

  // Webhooks
  createWebhook(params: { name: string; url: string; events: string[] }) {
    return this.request<{ id: string; name: string; status: string }>("POST", "/webhooks", params);
  }
  listWebhooks() {
    return this.request("GET", "/webhooks");
  }
  deleteWebhook(id: string) {
    return this.request("DELETE", `/webhooks/${id}`);
  }
  getWebhookStats() {
    return this.request<{ total: number; successful: number; failed: number }>("GET", "/webhooks/stats");
  }

  // Marketplace
  searchMarketplace(params?: { query?: string; category?: string; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.query) query.set("q", params.query);
    if (params?.category) query.set("category", params.category);
    if (params?.limit) query.set("limit", String(params.limit));
    return this.request("GET", `/marketplace/agents?${query}`);
  }
  submitAgent(params: { name: string; description: string; category: string; pricingModel: string }) {
    return this.request("POST", "/marketplace/agents", params);
  }
  installAgent(agentId: string, config?: Record<string, unknown>) {
    return this.request("POST", `/marketplace/agents/${agentId}/install`, { config });
  }
  reviewAgent(agentId: string, rating: number, comment?: string) {
    return this.request("POST", `/marketplace/agents/${agentId}/review`, { rating, comment });
  }
  getInstalledAgents() {
    return this.request("GET", "/marketplace/installed");
  }

  // Legal Research
  legalResearch(query: string, jurisdiction?: string) {
    return this.request<{ research: string; sources: any[]; citations: any[] }>("POST", "/legal/research", { query, jurisdiction });
  }

  // Knowledge Graph
  queryKnowledgeGraph(params: { query: string; types?: string[]; maxResults?: number }) {
    return this.request("POST", "/knowledge-graph/query", params);
  }
  getKnowledgeNode(nodeId: string) {
    return this.request("GET", `/knowledge-graph/nodes/${nodeId}`);
  }
  getKnowledgeGraphStats() {
    return this.request("GET", "/knowledge-graph/stats");
  }
  extractKnowledgeFromText(text: string, sourceId?: string) {
    return this.request("POST", "/knowledge-graph/extract", { text, sourceId });
  }
  federatedSearch(params: { query: string; sources?: string[] }) {
    return this.request("POST", "/knowledge-graph/federated-search", params);
  }

  // Governance
  checkContent(content: string) {
    return this.request<{ allowed: boolean; action: string }>("POST", "/governance/check", { content });
  }
  createGovernanceRule(params: { name: string; ruleType: string; action: string; pattern?: string }) {
    return this.request("POST", "/governance/rules", params);
  }
  listGovernanceRules() {
    return this.request("GET", "/governance/rules");
  }
  getGovernanceStats() {
    return this.request("GET", "/governance/stats");
  }

  // Audit
  getAuditLogs(params?: { limit?: number; offset?: number; eventType?: string }) {
    const query = new URLSearchParams();
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.offset) query.set("offset", String(params.offset));
    if (params?.eventType) query.set("eventType", params.eventType);
    return this.request("GET", `/audit/logs?${query}`);
  }

  // Analytics
  getUsage(params?: { startDate?: string; endDate?: string; granularity?: string }) {
    const query = new URLSearchParams();
    if (params?.startDate) query.set("startDate", params.startDate);
    if (params?.endDate) query.set("endDate", params.endDate);
    if (params?.granularity) query.set("granularity", params.granularity);
    return this.request("GET", `/analytics/usage?${query}`);
  }
  getCurrentPeriodUsage() {
    return this.request("GET", "/analytics/current-period");
  }
  getAnalyticsOverview() {
    return this.request("GET", "/analytics/overview");
  }

  // Health
  healthCheck() {
    return this.request<{ status: string; checks: any }>("GET", "/health");
  }
}

export function createClient(config: SdkConfig): JurisAiClient {
  return new JurisAiClient(config);
}
