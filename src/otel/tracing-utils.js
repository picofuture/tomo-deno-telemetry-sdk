import { context, trace, SpanKind } from 'npm:@opentelemetry/api@1.9.0'
import { getTracer } from './tracers.js'

/**
 * Runs an async function within a span context, handling status and errors.
 * @param {string} name - Span name
 * @param {object} options - Span options (kind, attributes, parent)
 * @param {function} fn - Async function to run within the span
 * @returns {Promise<*>}
 */
export async function runWithSpan(name, options, fn) {
  const tracer = getTracer()
  const span = tracer.startSpan(name, options)
  try {
    return await context.with(trace.setSpan(context.active(), span), async () => {
      return await fn(span)
    })
  } catch (err) {
    span.setStatus({ code: 2 })
    throw err
  } finally {
    span.end()
  }
}

/**
 * Sets HTTP attributes and status on a span based on response.
 * @param {object} span - The span
 * @param {object} res - The HTTP response
 */
export function setHttpSpanStatus(span, res) {
  if (res && typeof res.status === 'number') {
    span.setAttribute('http.status_code', res.status)
    span.setStatus({ code: res.status >= 400 ? 2 : 1 })
  }
} 