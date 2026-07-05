import { type InitOptions } from "./models/initOptions";
import { type LogEntry } from "./models/logEntry";
import { LogLevel } from "./models/logLevel";

/*
 * TODO:
 * - implement messagerror
 */

let initialized = false;

/* we init with default options values */
let options: InitOptions = {
  interceptors: {
    interceptConsole: true,
    interceptUncaughtExceptions: true,
    interceptUnhandledRejections: true,
  },
};

function validateOptions(options: InitOptions) {
  if (!options.url && !options.sendLog) {
    throw new Error(
      "You need to define either a 'url' to send the logs to or a 'sendLog' function to handle the logs.",
    );
  }
}

function createUncaughtExceptionInterceptor() {
  window.addEventListener("error", (event) => {
    const logEntry: LogEntry = {
      level: LogLevel.ERROR,
      message: event.message,
      timestamp: Date.now(),
      stack: event.error?.stack,
    };
    sendLog(logEntry);
  });
}

function createUnhandledRejectionInterceptor() {
  window.addEventListener("unhandledrejection", (event) => {
    const logEntry: LogEntry = {
      level: LogLevel.ERROR,
      message: event.reason?.message ?? "Unhandled promise rejection",
      timestamp: Date.now(),
      stack: event.reason?.stack,
    };
    sendLog(logEntry);
  });
}

function getLevelFromConsoleFunctionName(functionName: string): LogLevel {
  let logLevel: LogLevel;
  switch (functionName) {
    case "debug":
      logLevel = LogLevel.DEBUG;
      break;
    case "warn":
      logLevel = LogLevel.WARN;
      break;
    case "error":
      logLevel = LogLevel.ERROR;
      break;
    default:
    case "log":
    case "info":
      logLevel = LogLevel.INFO;
      break;
  }
  return logLevel;
}

function createConsoleInterceptor(options: InitOptions) {
  const consoleLevels = ["debug", "info", "log", "warn", "error"] as const;
  consoleLevels.forEach((level) => {
    if (
      (typeof options.interceptors?.interceptConsole === "boolean" && options.interceptors?.interceptConsole) ||
      (typeof options.interceptors?.interceptConsole === "object" && options.interceptors?.interceptConsole[level])
    ) {
      const originalFunction = console[level];
      console[level] = (...args: unknown[]) => {
        const logLevel = getLevelFromConsoleFunctionName(level);
        const logEntry: LogEntry = {
          level: logLevel,
          message: args.join(" "),
          timestamp: Date.now(),
        };
        sendLog(logEntry);
        originalFunction.apply(console, args);
      };
    }
  });
}

function createInterceptors(options: InitOptions) {
  if (options.interceptors?.interceptUncaughtExceptions) {
    createUncaughtExceptionInterceptor();
  }
  if (options.interceptors?.interceptUnhandledRejections) {
    createUnhandledRejectionInterceptor();
  }
  createConsoleInterceptor(options);
}

/**
 * Sends a log entry to the backend.
 * @param logEntry The log entry to send.
 */
export function sendLog(logEntry: LogEntry) {
  if (!initialized) {
    throw new Error("Logging system is not initialized. Call init() first.");
  }
  if (options.sendLog) {
    options.sendLog(logEntry).catch(() => {
      // failing silently to avoid infinite loops if the sendLog function itself logs errors
    });
  } else if (options.url) {
    fetch(options.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(logEntry),
    }).catch(() => {
      // failing silently to avoid infinite loops if the sendLog function itself logs errors
    });
  }
}

/**
 * Initialize the logging system to be able to send logs to the backend.
 * @param options
 */
export function init(initOptions: InitOptions) {
  if (initialized) {
    return;
  }
  validateOptions(initOptions);

  initialized = true;
  options = {
    ...options,
    ...initOptions,
    interceptors: {
      ...options.interceptors,
      ...initOptions.interceptors,
    },
  };

  createInterceptors(options);
}
