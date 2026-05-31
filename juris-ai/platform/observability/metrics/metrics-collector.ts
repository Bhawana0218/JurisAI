type MetricType = "counter" | "gauge" | "histogram";

type Metric = {
  name: string;
  type: MetricType;
  value: number;
  labels: Record<string, string>;
  timestamp: number;
};

class MetricsCollector {
  private metrics: Metric[] = [];
  private counters: Map<string, number> = new Map();
  private histograms: Map<string, number[]> = new Map();
  private flushInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    if (typeof setInterval !== "undefined") {
      this.flushInterval = setInterval(() => this.flush(), 10000);
    }
  }

  increment(name: string, labels?: Record<string, string>, value: number = 1): void {
    const key = this.labelKey(name, labels || {});
    this.counters.set(key, (this.counters.get(key) || 0) + value);
  }

  gauge(name: string, value: number, labels?: Record<string, string>): void {
    this.metrics.push({
      name,
      type: "gauge",
      value,
      labels: labels || {},
      timestamp: Date.now(),
    });
  }

  timing(name: string, durationMs: number, labels?: Record<string, string>): void {
    const key = this.labelKey(name, labels || {});
    const existing = this.histograms.get(key) || [];
    existing.push(durationMs);
    this.histograms.set(key, existing);
  }

  async time<T>(name: string, fn: () => Promise<T>, labels?: Record<string, string>): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      this.timing(name, performance.now() - start, labels);
      return result;
    } catch (error) {
      this.timing(name, performance.now() - start, { ...labels, error: "true" });
      throw error;
    }
  }

  private async flush(): Promise<void> {
    const batch: Metric[] = [...this.metrics];

    for (const [key, value] of this.counters) {
      const { name, labels } = this.parseLabelKey(key);
      batch.push({ name: `${name}_total`, type: "counter", value, labels, timestamp: Date.now() });
    }

    for (const [key, values] of this.histograms) {
      const { name, labels } = this.parseLabelKey(key);
      if (values.length > 0) {
        const sorted = [...values].sort((a, b) => a - b);
        batch.push({ name: `${name}_count`, type: "counter", value: values.length, labels, timestamp: Date.now() });
        batch.push({ name: `${name}_sum`, type: "counter", value: values.reduce((a, b) => a + b, 0), labels, timestamp: Date.now() });
        batch.push({ name: `${name}_avg`, type: "gauge", value: values.reduce((a, b) => a + b, 0) / values.length, labels, timestamp: Date.now() });
        batch.push({ name: `${name}_p50`, type: "gauge", value: sorted[Math.floor(sorted.length * 0.5)], labels, timestamp: Date.now() });
        batch.push({ name: `${name}_p95`, type: "gauge", value: sorted[Math.floor(sorted.length * 0.95)], labels, timestamp: Date.now() });
        batch.push({ name: `${name}_p99`, type: "gauge", value: sorted[Math.floor(sorted.length * 0.99)], labels, timestamp: Date.now() });
      }
    }

    this.metrics = [];
    this.counters.clear();
    this.histograms.clear();

    if (batch.length === 0) return;

    try {
      const endpoint = process.env.METRICS_ENDPOINT;
      if (endpoint) {
        await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ metrics: batch }),
        }).catch(() => {});
      }
    } catch {}
  }

  private labelKey(name: string, labels: Record<string, string>): string {
    const sorted = Object.entries(labels).sort(([a], [b]) => a.localeCompare(b));
    return `${name}{${sorted.map(([k, v]) => `${k}="${v}"`).join(",")}}`;
  }

  private parseLabelKey(key: string): { name: string; labels: Record<string, string> } {
    const match = key.match(/^(.+?)\{(.+)\}$/);
    if (!match) return { name: key, labels: {} };
    const labels: Record<string, string> = {};
    match[2].split(",").forEach((part) => {
      const [k, v] = part.split("=");
      labels[k] = v.replace(/"/g, "");
    });
    return { name: match[1], labels };
  }

  destroy(): void {
    if (this.flushInterval) clearInterval(this.flushInterval);
    this.flush();
  }
}

export const metrics = new MetricsCollector();
