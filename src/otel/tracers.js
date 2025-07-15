import { trace } from 'npm:@opentelemetry/api@1.9.0'
import { BasicTracerProvider, BatchSpanProcessor, ConsoleSpanExporter } from 'npm:@opentelemetry/sdk-trace-base@2.0.1'
import { OTLPTraceExporter } from 'npm:@opentelemetry/exporter-trace-otlp-http@0.202.0'
import { resourceFromAttributes } from 'npm:@opentelemetry/resources@2.0.1'
import { SemanticResourceAttributes } from 'npm:@opentelemetry/semantic-conventions@1.34.0'
import { getConfig } from '../store/config-store.js'

let tracer

/**
 * Tracer setup and retrieval utilities for Tomo Deno Telemetry SDK.
 * Provides functions to initialize and access the OpenTelemetry tracer.
 * @module otel/tracers
 */

/**
 * Sets up the OpenTelemetry tracer provider and exporters.
 */
function setupTracer() {
  const config = getConfig();

  const resource = resourceFromAttributes({
    [SemanticResourceAttributes.SERVICE_NAME]: config.serviceName,
    [SemanticResourceAttributes.SERVICE_VERSION]: config.serviceVersion,
    [SemanticResourceAttributes.TELEMETRY_SDK_LANGUAGE]: 'deno',
    [SemanticResourceAttributes.TELEMETRY_SDK_NAME]: 'tomo-deno-telemetry-sdk',
    [SemanticResourceAttributes.TELEMETRY_SDK_VERSION]: '0.1.14'
  })
  const traceExporter = new OTLPTraceExporter({
    url: config.collectorUrl,
    headers: {
      'x-api-key': config.apiKey
    }
  })

  const exporters = [
    new BatchSpanProcessor(traceExporter)
  ];

  console.log('config', config)

  if (config.debug) {
    const consoleExporter = new ConsoleSpanExporter();

    exporters.push(new BatchSpanProcessor(consoleExporter));
  }
  
  const provider = new BasicTracerProvider(
    { 
      resource,
      spanProcessors: exporters
    }
  )

  trace.setGlobalTracerProvider(provider)

  tracer = trace.getTracer(config.serviceName)
}

/**
 * Returns the initialized tracer instance.
 * @returns {import('@opentelemetry/api').Tracer|undefined} The tracer instance or undefined if not initialized.
 */
function getTracer() {
  return tracer
}

export { setupTracer, getTracer }