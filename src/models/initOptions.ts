import { type LogEntry } from "./logEntry";

export interface InitOptions {
  interceptors?: {
    /**
     * Whether to intercept console methods.
     * If it's in a boolean form, either intercept all console methods or none.
     * If it's in an object form, you can specify which console methods to intercept.
     * @default true
     */
    interceptConsole?:
      | boolean
      | {
          debug?: boolean;
          info?: boolean;
          log?: boolean;
          warn?: boolean;
          error?: boolean;
        };
    /**
     * Add a listener for uncaught exceptions and send them to the backend.
     * @default true
     */
    interceptUncaughtExceptions?: boolean;
    /**
     * Add a listener for unhandled promise rejections and send them to the backend.
     * @default true
     */
    interceptUnhandledRejections?: boolean;
  };
  /**
   * The URL of the backend to send logs to. If not provided, the sendLog function must be provided.
   * If both 'url' and 'sendLog' are provided, 'sendLog' will take precedence.
   */
  url?: string;
  /**
   * Allows you to customize log before sending it to the backend.
   * @param logEntry The log entry to send.
   * @returns A promise resolving when the log entry has been sent.
   */
  sendLog?: (logEntry: LogEntry) => Promise<void>;
  /**
   * @default false
   */
  // allowBulk?: boolean; TODO LATER
}
