---
title: How to use?
---

You first need to initialize the interceptors and the URL to send the logs.
You can also decided which listeners you initialize.

```
import { init, sendLogs } from "firewatch-js";

init({
  url: "/testWithUrl",
  interceptors: {
    interceptConsole: true,
    interceptUncaughtExceptions: true,
    interceptUnhandledRejections: true,
  },
});
```

You can also pass a function if you wish to rework the logs before sending them to the backend.

```
import { init, sendLogs } from "firewatch-js";

init({
  sendLog: (log) => {
    // you can do whatever
    log.enrichedProperty = 42;
    // you can send your log
  },
});
```
