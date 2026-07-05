import { type InitOptions } from "./models/initOptions";
import { type LogEntry } from "./models/logEntry";
/**
 * Sends a log entry to the backend.
 * @param logEntry The log entry to send.
 */
export declare function sendLog(logEntry: LogEntry): void;
/**
 * Initialize the logging system to be able to send logs to the backend.
 * @param options
 */
export declare function init(initOptions: InitOptions): void;
