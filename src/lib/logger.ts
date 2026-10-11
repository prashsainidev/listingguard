// logger.ts — Structured application and AI-workflow logs
// Interview answer: "We log every AI request and response so we can debug issues,
// track what prompts were used, and audit decisions. This is required by Aggroso."

export type LogLevel = "info" | "warn" | "error" | "ai";

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  event: string;
  data?: Record<string, unknown>;
}

// In-memory log store (in production this would go to a logging service)
const logs: LogEntry[] = [];

function createEntry(
  level: LogLevel,
  event: string,
  data?: Record<string, unknown>
): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    event,
    data,
  };
}

export const logger = {
  info(event: string, data?: Record<string, unknown>) {
    const entry = createEntry("info", event, data);
    logs.push(entry);
    console.log(`[INFO] ${entry.timestamp} — ${event}`, data ?? "");
  },

  warn(event: string, data?: Record<string, unknown>) {
    const entry = createEntry("warn", event, data);
    logs.push(entry);
    console.warn(`[WARN] ${entry.timestamp} — ${event}`, data ?? "");
  },

  error(event: string, data?: Record<string, unknown>) {
    const entry = createEntry("error", event, data);
    logs.push(entry);
    console.error(`[ERROR] ${entry.timestamp} — ${event}`, data ?? "");
  },

  // Special log for AI workflow events
  ai(event: string, data?: Record<string, unknown>) {
    const entry = createEntry("ai", event, data);
    logs.push(entry);
    console.log(`[AI] ${entry.timestamp} — ${event}`, data ?? "");
  },

  getLogs(): LogEntry[] {
    return [...logs];
  },

  getAILogs(): LogEntry[] {
    return logs.filter((l) => l.level === "ai");
  },
};
