type LogLevel = "debug" | "info" | "warn" | "error";

type LogEntry = {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: Error | string;
  requestId?: string;
  service?: string;
};

class Logger {
  private service: string;
  private logQueue: LogEntry[] = [];
  private readonly flushInterval = 5000;

  constructor(service: string = "jurisai") {
    this.service = service;
    if (typeof setInterval !== "undefined") {
      setInterval(() => this.flush(), this.flushInterval);
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.emit("debug", message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.emit("info", message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.emit("warn", message, context);
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.emit("error", message, context, context?.error as Error);
  }

  private emit(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error: error?.message || error?.toString(),
      requestId: context?.requestId as string,
      service: this.service,
    };

    if (process.env.NODE_ENV === "production") {
      this.logQueue.push(entry);
      if (typeof process !== "undefined" && process.stdout) {
        process.stdout.write(JSON.stringify(entry) + "\n");
      }
    } else {
      const prefix = `[${entry.timestamp}] [${level.toUpperCase()}] [${this.service}]`;
      const colored = level === "error" ? "\x1b[31m" : level === "warn" ? "\x1b[33m" : level === "debug" ? "\x1b[36m" : "\x1b[32m";
      const reset = "\x1b[0m";
      console.log(`${colored}${prefix}${reset} ${message}`, context ? JSON.stringify(context, null, 2) : "");
      if (error) console.error(error);
    }
  }

  private async flush(): Promise<void> {
    if (this.logQueue.length === 0) return;
    const batch = [...this.logQueue];
    this.logQueue = [];

    try {
      const endpoint = process.env.LOGGING_ENDPOINT;
      if (endpoint) {
        await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ logs: batch }),
        }).catch(() => {});
      }
    } catch {
      // silently fail
    }
  }

  child(service: string): Logger {
    return new Logger(service);
  }
}

export const logger = new Logger();
