export interface ApiClientConfig {
  baseUrl: string;
  getToken: () => Promise<string | null>;
}

export class JurisApiClient {
  constructor(private config: ApiClientConfig) {}

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const token = await this.config.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(init?.headers as Record<string, string>),
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${this.config.baseUrl}${path}`, { ...init, headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { error?: string }).error ?? `HTTP ${res.status}`);
    }
    return res.json() as Promise<T>;
  }

  getChats() {
    return this.request<{ chats: unknown[] }>("/api/chats");
  }

  getMessages(chatId: string) {
    return this.request<{ messages: unknown[] }>(`/api/chats/${chatId}/messages`);
  }

  sync(operations: unknown[]) {
    return this.request<{ synced: string[] }>("/api/sync", {
      method: "POST",
      body: JSON.stringify({ operations }),
    });
  }

  registerDevice(body: unknown) {
    return this.request("/api/devices/register", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  updatePresence(body: { status: string; organizationId?: string }) {
    return this.request("/api/presence", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  getCases() {
    return this.request<{ cases: unknown[] }>("/api/cases");
  }

  getTasks() {
    return this.request<{ tasks: unknown[] }>("/api/tasks");
  }

  getNotes() {
    return this.request<{ notes: unknown[] }>("/api/notes");
  }
}
