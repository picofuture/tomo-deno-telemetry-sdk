import { trace } from 'npm:@opentelemetry/api@1.9.0'
import { BasicTracerProvider, BatchSpanProcessor } from 'npm:@opentelemetry/sdk-trace-base@2.0.1'
import { OTLPTraceExporter } from 'npm:@opentelemetry/exporter-trace-otlp-http@0.202.0'
import { resourceFromAttributes, defaultResource } from 'npm:@opentelemetry/resources@2.0.1'
import { SemanticResourceAttributes } from 'npm:@opentelemetry/semantic-conventions@1.34.0'

let tracer

function setupTracer(serviceName, serviceVersion, apiKey) {
  const name = serviceName || 'unknown_service'
  const version = serviceVersion || '0.0.1'
  const resource = defaultResource().merge(resourceFromAttributes({
    [SemanticResourceAttributes.SERVICE_NAME]: name,
    [SemanticResourceAttributes.SERVICE_VERSION]: version
  }))
  const traceExporter = new OTLPTraceExporter({
    url: 'https://collector.picofuture.com/v1/traces',
    headers: {
      'x-api-key': apiKey
    }
  })
  const processor = new BatchSpanProcessor(traceExporter)

  const provider = new BasicTracerProvider(
    { 
      resource,
      spanProcessors: [processor]
    }
  )

  trace.setGlobalTracerProvider(provider)

  tracer = trace.getTracer(name)
}

function getTracer() {
  return tracer
}

export { setupTracer, getTracer }