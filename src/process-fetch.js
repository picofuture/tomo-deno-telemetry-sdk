import { SpanKind } from 'npm:@opentelemetry/api@1.9.0'
import { runWithSpan, setHttpSpanStatus } from './otel/tracing-utils.js'

/**
 * Drop-in replacement for fetch with tracing. Accepts url, options, and required parentContext.
 * @param {RequestInfo} url - The resource to fetch
 * @param {RequestInit} [options] - Fetch options
 * @param {object} parentContext - Parent context for trace propagation (required)
 * @returns {Promise<Response>}
 */
export async function tracedFetch(url, options, parentContext) {
  const method = options?.method || (typeof url === 'object' && url.method) || 'GET'
  return runWithSpan(`HTTP ${method}`, {
    kind: SpanKind.CLIENT,
    attributes: {
      'http.method': method,
      'http.url': typeof url === 'string' ? url : url.url
    },
    parentContext
  }, async (span) => {
    const res = await fetch(url, options)
    setHttpSpanStatus(span, res)
    return res
  })
} 