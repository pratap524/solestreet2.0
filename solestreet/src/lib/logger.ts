type LogLevel = "info" | "warn" | "error" | "debug";

interface LogPayload {
  message: string;
  context?: string;
  metadata?: Record<string, unknown>;
  error?: Error | unknown;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV !== "production";

  private formatMessage(level: LogLevel, payload: LogPayload) {
    const timestamp = new Date().toISOString();
    return {
      timestamp,
      level,
      context: payload.context || "App",
      message: payload.message,
      metadata: payload.metadata || {},
      errorName: payload.error instanceof Error ? payload.error.name : undefined,
      errorMessage: payload.error instanceof Error ? payload.error.message : payload.error ? String(payload.error) : undefined,
    };
  }

  info(message: string, context?: string, metadata?: Record<string, unknown>) {
    const formatted = this.formatMessage("info", { message, context, metadata });
    if (this.isDevelopment) {
      console.log(`ℹ️ [INFO] ${formatted.context}: ${formatted.message}`, metadata || "");
    } else {
      console.log(JSON.stringify(formatted));
    }
  }

  warn(message: string, context?: string, metadata?: Record<string, unknown>) {
    const formatted = this.formatMessage("warn", { message, context, metadata });
    if (this.isDevelopment) {
      console.warn(`⚠️ [WARN] ${formatted.context}: ${formatted.message}`, metadata || "");
    } else {
      console.warn(JSON.stringify(formatted));
    }
  }

  error(message: string, error?: unknown, context?: string, metadata?: Record<string, unknown>) {
    const formatted = this.formatMessage("error", { message, error, context, metadata });
    if (this.isDevelopment) {
      console.error(`❌ [ERROR] ${formatted.context}: ${formatted.message}`, error || "", metadata || "");
    } else {
      console.error(JSON.stringify(formatted));
    }
  }
}

export const logger = new Logger();
