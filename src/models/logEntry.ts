import { LogLevel } from "./logLevel";

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: number;
  stack?: string;
}
