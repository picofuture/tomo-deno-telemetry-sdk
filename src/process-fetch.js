import { SpanKind } from 'npm:@opentelemetry/api@1.9.0'
import { runWithSpan, setHttpSpanStatus } from './otel/tracing-utils.js'

/**
 * Drop-in replacement for fetch with tracing. Accepts url, options, and optional parentTrace.
 * @param {RequestInfo} url - The resource to fetch
 * @param {RequestInit} [options] - Fetch options
 * @param {object} [parentTrace] - Optional parent span/context
 * @returns {Promise<Response>}
 */
export async function tracedFetch(url, options, parentTrace) {
  const method = options?.method || (typeof url === 'object' && url.method) || 'GET'
  return runWithSpan(`HTTP ${method}`, {
    kind: SpanKind.CLIENT,
    attributes: {
      'http.method': method,
      'http.url': typeof url === 'string' ? url : url.url
    },
    parent: parentTrace || undefined
  }, async (span) => {
    const res = await fetch(url, options)
    setHttpSpanStatus(span, res)
    return res
  })
} 