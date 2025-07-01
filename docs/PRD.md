# Tomo Telemetry SDK – Product Requirements Document (PRD)

**Product Name:** Tomo Telemetry SDK  
**Owner:** Pico Future  
**Target Release:** v0.1.0  
**Audience:** Internal team, AI-native devtools, platform integrators

---

## 1. Overview

Tomo is a lightweight, plug-and-play telemetry SDK for capturing runtime signals from any JavaScript-based runtime. It provides structured observability for client environments (React, React Native), edge runtimes (Supabase, Cloudflare Workers), and Node servers.

---

## 2. Problem

Low-code and AI-generated codebases lack traceability. Bugs occur at runtime with no persistent log, trace, or request context. Existing observability tools are too heavyweight or require manual setup, which is infeasible for non-experts.

---

## 3. Goals

* One-liner setup: `Tomo.init({ apikey })`
* Auto-capture:

  * `console.log`, `warn`, `error`, `debug`, `info`
  * Unhandled exceptions and rejections
  * Fetch calls (URL, status, body if JSON)
* Works in any JS/TS runtime (Node, Browser, Edge, React Native*)
* Sends logs and traces to centralized Tomo collector endpoint

---

## 4. Non-Goals

* Heap dump capture in browser/edge/mobile
* Complex user-side config, dashboards, or metrics UI
* In-depth trace instrumentation for custom spans (at v0.1)

---

## 5. Requirements

### Functional

* Accept `apikey`, `collectorUrl`, `serviceName` via config
* Send all logs via OTLP-compatible exporter
* Send fetch traces (URL, status, method, JSON response if possible)
* Hook `console.*` methods to emit logs
* Hook `process.on('uncaughtException')` and `unhandledRejection` (Node only)
* No-throw guarantee: if telemetry fails, app must still run

### Technical

* Output OTLP logs to `${collectorUrl}/ingest`
* Use OpenTelemetry `LoggerProvider` and `OTLPLogExporter`
* Detect if platform is Node vs Browser and adjust behavior accordingly
* Avoid bundling Node modules in browser/edge build
* `createTomo(config)` should return a class instance with `init()` and `shutdown()` methods
* Must work without TypeScript, but expose JSDoc annotations for TS support

---

## 6. API Design

### Example usage:

```js
import createTomo from 'tomo-sdk'

const sdk = createTomo({
  apikey: 'abc123',
  serviceName: 'client-webapp'
})
sdk.init()
```

---

## 7. Platform Compatibility

| Platform      | Status         | Notes                               |
| ------------- | -------------- | ----------------------------------- |
| Node.js       | ✅              | Full support                        |
| React Web     | ✅              | Remove Node APIs before shipping    |
| Supabase Edge | ✅              | Strip dynamic import, use ESM only  |
| React Native  | ⛔️ Planned     | Requires platform-specific patching |
| Deno          | ⛔️ Not planned |                                     |

---

## 8. Future Roadmap

* React Native compatibility
* Add session + user context tracking
* Visual debugger / timeline viewer
* Custom span support
* Heap snapshot support in local/dev 