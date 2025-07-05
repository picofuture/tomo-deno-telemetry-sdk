import { trace, context, SpanKind } from 'npm:@opentelemetry/api@1.9.0'

import { getTracer } from './otel/tracers.js'

function wrapServe(serveFn) {
  return function tracedServe(handler, opts) {
    const tracer = getTracer()
    return serveFn(async (req) => {
      const span = tracer.startSpan('http.request', {
        kind: SpanKind.SERVER,
        attributes: {
          'http.method': req.method,
          'http.url': req.url
        }
      })

      return await context.with(trace.setSpan(context.active(), span), async () => {
        try {
          return await handler(req)
        } finally {
          span.end()
        }
      })
    }, opts)
  }
}

export { wrapServe }
