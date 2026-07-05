import { beforeEach, describe, expect, it, vi } from "vitest";

import { LogLevel } from "../src/models/logLevel";

async function loadInterceptorsModule() {
  vi.resetModules();
  return import("../src/interceptors");
}

function createWindowMock() {
  const listeners = new Map<string, Array<(event: Event) => void>>();

  return {
    addEventListener(type: string, listener: (event: Event) => void) {
      const typeListeners = listeners.get(type) ?? [];
      typeListeners.push(listener);
      listeners.set(type, typeListeners);
    },
    dispatchEvent(event: Event) {
      const typeListeners = listeners.get(event.type) ?? [];
      typeListeners.forEach((listener) => listener(event));
      return true;
    },
  };
}

describe("init", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("throws when neither a url nor a custom sendLog handler is provided", async () => {
    const { init } = await loadInterceptorsModule();

    expect(() =>
      init({
        interceptors: {
          interceptConsole: false,
          interceptUncaughtExceptions: false,
          interceptUnhandledRejections: false,
        },
      }),
    ).toThrow(/url|sendLog/i);
  });

  it("accepts a custom sendLog handler without requiring a url", async () => {
    const sendLogHandler = vi.fn().mockResolvedValue(undefined);
    const { init, sendLog } = await loadInterceptorsModule();

    init({
      sendLog: sendLogHandler,
      interceptors: {
        interceptConsole: false,
        interceptUncaughtExceptions: false,
        interceptUnhandledRejections: false,
      },
    });

    sendLog({ level: LogLevel.INFO, message: "hello", timestamp: 1 });

    await Promise.resolve();

    expect(sendLogHandler).toHaveBeenCalledTimes(1);
    expect(sendLogHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        level: LogLevel.INFO,
        message: "hello",
      }),
    );
  });

  it("uses fetch when a url is configured", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchSpy);
    const { init, sendLog } = await loadInterceptorsModule();

    init({
      url: "https://example.com/logs",
      interceptors: {
        interceptConsole: false,
        interceptUncaughtExceptions: false,
        interceptUnhandledRejections: false,
      },
    });

    sendLog({ level: LogLevel.ERROR, message: "boom", timestamp: 2 });

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://example.com/logs",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }),
    );
  });

  it("forwards intercepted debug logs to the configured sendLog handler", async () => {
    const sendLogHandler = vi.fn().mockResolvedValue(undefined);
    const consoleDebugSpy = vi.spyOn(console, "debug").mockImplementation(() => undefined);
    const { init } = await loadInterceptorsModule();

    init({
      sendLog: sendLogHandler,
      interceptors: {
        interceptConsole: { debug: true },
        interceptUncaughtExceptions: false,
        interceptUnhandledRejections: false,
      },
    });

    console.debug("debug", "message");

    await Promise.resolve();

    expect(consoleDebugSpy).toHaveBeenCalledWith("debug", "message");
    expect(sendLogHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        level: LogLevel.DEBUG,
        message: "debug message",
      }),
    );
  });

  it("forwards intercepted info logs to the configured sendLog handler", async () => {
    const sendLogHandler = vi.fn().mockResolvedValue(undefined);
    const consoleInfoSpy = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const { init } = await loadInterceptorsModule();

    init({
      sendLog: sendLogHandler,
      interceptors: {
        interceptConsole: { info: true },
        interceptUncaughtExceptions: false,
        interceptUnhandledRejections: false,
      },
    });

    console.info("info", "message");

    await Promise.resolve();

    expect(consoleInfoSpy).toHaveBeenCalledWith("info", "message");
    expect(sendLogHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        level: LogLevel.INFO,
        message: "info message",
      }),
    );
  });

  it("forwards intercepted log logs to the configured sendLog handler", async () => {
    const sendLogHandler = vi.fn().mockResolvedValue(undefined);
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const { init } = await loadInterceptorsModule();

    init({
      sendLog: sendLogHandler,
      interceptors: {
        interceptConsole: { log: true },
        interceptUncaughtExceptions: false,
        interceptUnhandledRejections: false,
      },
    });

    console.log("hello", "world");

    await Promise.resolve();

    expect(consoleSpy).toHaveBeenCalledWith("hello", "world");
    expect(sendLogHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        level: LogLevel.INFO,
        message: "hello world",
      }),
    );
  });

  it("forwards intercepted warn logs to the configured sendLog handler", async () => {
    const sendLogHandler = vi.fn().mockResolvedValue(undefined);
    const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const { init } = await loadInterceptorsModule();

    init({
      sendLog: sendLogHandler,
      interceptors: {
        interceptConsole: { warn: true },
        interceptUncaughtExceptions: false,
        interceptUnhandledRejections: false,
      },
    });

    console.warn("warn", "message");

    await Promise.resolve();

    expect(consoleWarnSpy).toHaveBeenCalledWith("warn", "message");
    expect(sendLogHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        level: LogLevel.WARN,
        message: "warn message",
      }),
    );
  });

  it("forwards intercepted error logs to the configured sendLog handler", async () => {
    const sendLogHandler = vi.fn().mockResolvedValue(undefined);
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const { init } = await loadInterceptorsModule();

    init({
      sendLog: sendLogHandler,
      interceptors: {
        interceptConsole: { error: true },
        interceptUncaughtExceptions: false,
        interceptUnhandledRejections: false,
      },
    });

    console.error("error", "message");

    await Promise.resolve();

    expect(consoleErrorSpy).toHaveBeenCalledWith("error", "message");
    expect(sendLogHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        level: LogLevel.ERROR,
        message: "error message",
      }),
    );
  });

  it("forwards uncaught exceptions to the configured sendLog handler", async () => {
    const sendLogHandler = vi.fn().mockResolvedValue(undefined);
    const windowMock = createWindowMock();
    vi.stubGlobal("window", windowMock);
    const { init } = await loadInterceptorsModule();

    init({
      sendLog: sendLogHandler,
      interceptors: {
        interceptConsole: false,
        interceptUncaughtExceptions: true,
        interceptUnhandledRejections: false,
      },
    });

    windowMock.dispatchEvent({ type: "error", message: "boom" } as Event & { message: string });

    await Promise.resolve();

    expect(sendLogHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        level: LogLevel.ERROR,
        message: "boom",
      }),
    );
  });

  it("forwards unhandled rejections to the configured sendLog handler", async () => {
    const sendLogHandler = vi.fn().mockResolvedValue(undefined);
    const windowMock = createWindowMock();
    vi.stubGlobal("window", windowMock);
    const { init } = await loadInterceptorsModule();

    init({
      sendLog: sendLogHandler,
      interceptors: {
        interceptConsole: false,
        interceptUncaughtExceptions: false,
        interceptUnhandledRejections: true,
      },
    });

    windowMock.dispatchEvent({ type: "unhandledrejection", reason: new Error("nope") } as Event & {
      reason: Error;
    });

    await Promise.resolve();

    expect(sendLogHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        level: LogLevel.ERROR,
        message: "nope",
      }),
    );
  });
});

describe("sendLog", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("throws until init has been called", async () => {
    const { sendLog } = await loadInterceptorsModule();

    expect(() => sendLog({ level: LogLevel.INFO, message: "hello", timestamp: 1 })).toThrow(/initialized/i);
  });
});
