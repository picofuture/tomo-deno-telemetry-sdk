# Tomo Deno Telemetry SDK

A simple SDK for adding OpenTelemetry-based tracing to your Deno applications.

## Installation

Import the SDK and Deno's standard HTTP server:

```ts
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import TomoDenoTelemetry from "https://esm.sh/@picofuture/tomo-deno-telemetry-sdk@latest";
```

## Usage

1. **Initialize the Telemetry SDK:**

```ts
const tomoDenoTelemetry = new TomoDenoTelemetry({
  debug: false,
  apiKey: "your-api-key",
  serviceName: "your-service-name",
  serviceVersion: "your-service-version",
  collectorUrl: "your-collector-url",
});
```

2. **Wrap the Deno `serve` function (optional, for tracing HTTP requests):**

```ts
const wrappedServe = tomoDenoTelemetry.wrapServe(serve);
```

3. **Use `wrappedServe` instead of default Deno's serve:**

```ts
wrappedServe(async (req) => {
  const response = await fetch(
    "https://jsonplaceholder.typicode.com/posts/1",
    {
      method: "GET",
      headers: { "Accept": "application/json" },
    }
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
- Automatic tracing of outgoing HTTP requests
- Easy integration with OpenTelemetry-compatible collectors

## Configuration
- `debug`: Enable/Disable console debugging (required)
- `apiKey`: Your telemetry API key (required)
- `serviceName`: Name of your service (required)
- `serviceVersion`: Version of your service (required)
- `collectorUrl`: URL of your OpenTelemetry collector (required)

## License
MIT
