/**
 * Tracing utility functions for Tomo Deno Telemetry SDK.
 * Includes helpers for running code within spans and setting HTTP span status.
 * @module otel/tracing-utils
 */
import { context, trace, SpanStatusCode } from 'npm:@opentelemetry/api@1.9.0'
import { getTracer } from './tracers.js'

/**
 * Runs an async function within a span context, handling status and errors.
 * @param {string} name - Span name
 * @param {object} options - Span options (kind, attributes, parentContext)
 * @param {function} fn - Async function to run within the span
 * @returns {Promise<*>}
 */
export async function runWithSpan(name, options, fn) {
  const tracer = getTracer()
  const parentContext = options && options.parentContext ? options.parentContext : context.active()
  const span = tracer.startSpan(name, options, parentContext)
  try {
    return await context.with(trace.setSpan(parentContext, span), async () => {
      return await fn(span)
    })
  } catch (err) {
    span.setStatus({ code: SpanStatusCode.ERROR })
    throw err
  } finally {
    span.end()
  }
}

/**
 * Sets multiple attributes on the given OpenTelemetry span.
 *
 * @param {import('@opentelemetry/api').Span} span - The span to set attributes on.
 * @param {Object.<string, any>} attributes - An object containing key-value pairs to set as attributes on the span.
 */
export function setSpanAttributes(span, attributes) {
  for (const [key, value] of Object.entries(attributes)) {
    span.setAttribute(key, value)
  }
}