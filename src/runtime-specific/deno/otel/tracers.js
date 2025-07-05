import { trace } from 'npm:@opentelemetry/api@1.9.0'
import { BasicTracerProvider, BatchSpanProcessor } from 'npm:@opentelemetry/sdk-trace-base@2.0.1'
import { OTLPTraceExporter } from 'npm:@opentelemetry/exporter-trace-otlp-http@0.202.0'
import { Resource } from 'npm:@opentelemetry/resources@2.0.1'
import { SemanticResourceAttributes } from 'npm:@opentelemetry/semantic-conventions@1.34.0'
import { getConfig } from './config.js'

let tracer

function setupTracer(serviceName, serviceVersion) {
  const resource = new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    [SemanticResourceAttributes.SERVICE_VERSION]: serviceVersion
  })

  const provider = new BasicTracerProvider({ resource })

  const exporter = new OTLPTraceExporter({
    url: 'https://collector.picofuture.com/v1/traces',
    headers: {
      'x-api-key': getConfig().apiKey
    }
  })

  provider.addSpanProcessor(new BatchSpanProcessor(exporter))
  provider.register()

  tracer = trace.getTracer(serviceName)
}

function getTracer() {
  return tracer
}

export { setupTracer, getTracer }