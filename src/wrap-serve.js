import { SpanKind, SpanStatusCode, context, trace } from 'npm:@opentelemetry/api@1.9.0'
import { getTracer } from './otel/tracers.js'

/**
 * Wraps a Deno serve function with tracing. Each HTTP request is wrapped in a root span and context.
 * The handler receives (req, rootSpan, rootContext) and should pass rootContext to all downstream traced operations.
 * @param {function} serveFn - The Deno serve function to wrap (e.g., from std/http)
 * @returns {function} A serve function with tracing enabled
 */
function wrapServe(serveFn) {
  return function tracedServe(handler, opts) {
    return serveFn(async (req) => {
      const tracer = getTracer()
      const rootSpan = tracer.startSpan('http.request', {
        kind: SpanKind.SERVER,
        attributes: {
          'http.method': req.method,
          'http.url': req.url
        }
      })
      const rootContext = trace.setSpan(context.active(), rootSpan)
      try {
        return await handler(req, rootContext)
      } catch (err) {
        rootSpan.setStatus({ code: SpanStatusCode.ERROR })
        throw err
      } finally {
        rootSpan.end()
      }
    }, opts)
  }
}

export { wrapServe }
