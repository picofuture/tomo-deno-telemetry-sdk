import { trace } from 'npm:@opentelemetry/api@1.9.0'

let tracer

function setupTracer() {
  tracer = trace.getTracer('tomo-runtime', '0.1')
}

function getTracer() {
  return tracer
}

export { setupTracer, getTracer }
