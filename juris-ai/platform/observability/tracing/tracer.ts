type SpanStatus = "ok" | "error";

type Span = {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  name: string;
  service: string;
  status: SpanStatus;
  startTime: number;
  endTime?: number;
  durationMs?: number;
  attributes: Record<string, unknown>;
  events: Array<{ name: string; timestamp: number; attributes?: Record<string, unknown> }>;
};

class Tracer {
  private traceId: string;
  private spans: Span[] = [];
  private stack: string[] = [];
  private service: string;

  constructor(service: string = "jurisai") {
    this.traceId = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
    this.service = service;
  }

  startSpan(name: string, attributes?: Record<string, unknown>): string {
    const spanId = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
    const parentSpanId = this.stack[this.stack.length - 1];

    const span: Span = {
      traceId: this.traceId,
      spanId,
      parentSpanId,
      name,
      service: this.service,
      status: "ok",
      startTime: performance.now(),
      attributes: attributes || {},
      events: [],
    };

    this.spans.push(span);
    this.stack.push(spanId);
    return spanId;
  }

  endSpan(spanId?: string, error?: Error): void {
    const id = spanId || this.stack.pop();
    if (!id) return;

    const span = this.spans.find((s) => s.spanId === id);
    if (!span) return;

    span.endTime = performance.now();
    span.durationMs = span.endTime - span.startTime;

    if (error) {
      span.status = "error";
      span.attributes.error = error.message;
      span.attributes.stack = error.stack;
    }

    if (this.stack[this.stack.length - 1] === id) {
      this.stack.pop();
    }
  }

  addEvent(name: string, attributes?: Record<string, unknown>): void {
    const currentSpanId = this.stack[this.stack.length - 1];
    const span = this.spans.find((s) => s.spanId === currentSpanId);
    if (span) {
      span.events.push({ name, timestamp: performance.now(), attributes });
    }
  }

  setAttribute(key: string, value: unknown): void {
    const currentSpanId = this.stack[this.stack.length - 1];
    const span = this.spans.find((s) => s.spanId === currentSpanId);
    if (span) {
      span.attributes[key] = value;
    }
  }

  async trace<T>(name: string, fn: () => Promise<T>, attributes?: Record<string, unknown>): Promise<T> {
    const spanId = this.startSpan(name, attributes);
    try {
      const result = await fn();
      this.endSpan(spanId);
      return result;
    } catch (error) {
      this.endSpan(spanId, error as Error);
      throw error;
    }
  }

  getTrace(): { traceId: string; spans: Span[] } {
    return {
      traceId: this.traceId,
      spans: this.spans.map((s) => ({
        ...s,
        startTime: Math.round(s.startTime),
        endTime: s.endTime ? Math.round(s.endTime) : undefined,
        durationMs: s.durationMs != null ? Math.round(s.durationMs) : s.durationMs || (s.endTime ? Math.round(s.endTime - s.startTime) : Math.round(performance.now() - s.startTime)),
      })),
    };
  }

  async export(): Promise<void> {
    const trace = this.getTrace();
    try {
      const endpoint = process.env.TRACING_ENDPOINT;
      if (endpoint) {
        await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(trace),
        }).catch(() => {});
      }
    } catch {}
  }

  static create(service?: string): Tracer {
    return new Tracer(service);
  }
}

export { Tracer };
export type { Span };
