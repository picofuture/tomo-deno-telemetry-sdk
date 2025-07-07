# Tomo Deno Telemetry SDK

A simple SDK for adding OpenTelemetry-based tracing to your Deno applications.

## Installation

Import the SDK and Deno's standard HTTP server:

```ts
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import TomoDenoTelemetry from "https://esm.sh/@picofuture/tomo-deno-telemetry-sdk@0.1.14";
```

## Usage

1. **Initialize the Telemetry SDK:**

```ts
const tomoDenoTelemetry = new TomoDenoTelemetry({
  apiKey: "YOUR_API_KEY",
  serviceName: "your-service-name",
  serviceVersion: "1.0.0",
  collectorUrl: "http://localhost:8080/ingest",
});

tomoDenoTelemetry.init();
```

2. **Wrap the Deno `serve` function (optional, for tracing HTTP requests):**

```ts
const wrappedServe = tomoDenoTelemetry.wrapServe(serve);
```

3. **Use `tracedFetch` for instrumented HTTP requests:**

```ts
wrappedServe(async (req, rootContext) => {
  // Traced fetch to external API
  const response = await tomoDenoTelemetry.tracedFetch(
    "https://jsonplaceholder.typicode.com/posts/1",
    {
      method: "GET",
      headers: { "Accept": "application/json" },
    },
    rootContext,
  );

  const data = await response.json();

  return new Response(data, {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
});
```

## Features
- Automatic tracing for HTTP server requests (when using `wrapServe`)
- Traced outgoing HTTP requests via `tracedFetch`
- Easy integration with OpenTelemetry-compatible collectors

## Configuration
- `apiKey`: Your telemetry API key (required)
- `serviceName`: Name of your service (required)
- `serviceVersion`: Version of your service (required)
- `collectorUrl`: URL of your OpenTelemetry collector (required)

## License
MIT
