import { SpanKind } from 'npm:@opentelemetry/api@1.9.0'
import { runWithSpan } from './otel/tracing-utils.js'

/**
 * Wraps a Deno serve function with tracing. Each HTTP request is wrapped in a span.
 * @param {function} serveFn - The Deno serve function to wrap (e.g., from std/http)
 * @param {object} [options] - Optional options object
 * @param {object} [options.parentTrace] - Optional parent span/context for trace propagation
 * @returns {function} A serve function with tracing enabled
 */
function wrapServe(serveFn, options = {}) {
  return function tracedServe(handler, opts) {
    return serveFn(async (req) => {
      return runWithSpan('http.request', {
        kind: SpanKind.SERVER,
        attributes: {
          'http.method': req.method,
          'http.url': req.url
        },
        parent: options.parentTrace || undefined
      }, async () => handler(req))
    }, opts)
  }
}

export { wrapServe }
