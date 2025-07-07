import { trace } from 'npm:@opentelemetry/api@1.9.0'
import { BasicTracerProvider, BatchSpanProcessor, ConsoleSpanExporter } from 'npm:@opentelemetry/sdk-trace-base@2.0.1'
import { OTLPTraceExporter } from 'npm:@opentelemetry/exporter-trace-otlp-http@0.202.0'
import { resourceFromAttributes } from 'npm:@opentelemetry/resources@2.0.1'
import { SemanticResourceAttributes } from 'npm:@opentelemetry/semantic-conventions@1.34.0'

let tracer

/**
 * Tracer setup and retrieval utilities for Tomo Deno Telemetry SDK.
 * Provides functions to initialize and access the OpenTelemetry tracer.
 * @module otel/tracers
 */

/**
 * Sets up the OpenTelemetry tracer provider and exporters.
 * @param {string} serviceName - Name of the service.
 * @param {string} serviceVersion - Version of the service.
 * @param {string} apiKey - API key for the collector.
 * @param {string} collectorUrl - URL of the OTLP collector endpoint.
 */
function setupTracer(serviceName, serviceVersion, apiKey, collectorUrl) {
  const name = serviceName || 'unknown_service'
  const version = serviceVersion || '0.0.1'
  const resource = resourceFromAttributes({
    [SemanticResourceAttributes.SERVICE_NAME]: name,
    [SemanticResourceAttributes.SERVICE_VERSION]: version,
    [SemanticResourceAttributes.TELEMETRY_SDK_LANGUAGE]: 'deno',
    [SemanticResourceAttributes.TELEMETRY_SDK_NAME]: 'tomo-deno-telemetry-sdk',
    [SemanticResourceAttributes.TELEMETRY_SDK_VERSION]: '0.1.14'
  })
  const traceExporter = new OTLPTraceExporter({
    url: collectorUrl,
    headers: {
      'x-api-key': apiKey
    }
  })
  const consoleExporter = new ConsoleSpanExporter();
  
  const traceProcessor = new BatchSpanProcessor(traceExporter)
  const consoleProcessor = new BatchSpanProcessor(consoleExporter)

  const provider = new BasicTracerProvider(
    { 
      resource,
      spanProcessors: [traceProcessor, consoleProcessor]
    }
  )

  trace.setGlobalTracerProvider(provider)

  tracer = trace.getTracer(name)
}

/**
 * Returns the initialized tracer instance.
 * @returns {import('@opentelemetry/api').Tracer|undefined} The tracer instance or undefined if not initialized.
 */
function getTracer() {
  return tracer
}

export { setupTracer, getTracer }