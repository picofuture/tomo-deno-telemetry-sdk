import { context, trace, SpanKind } from 'npm:@opentelemetry/api@1.9.0'
import { getTracer } from './otel/tracers.js'
import { bufferSpan } from './otel/context.js'

function patchFetch() {
  const originalFetch = globalThis.fetch
  
  if (!originalFetch || originalFetch.__tomoPatched) return

  globalThis.fetch = async function (...args) {
    const url = typeof args[0] === 'string' ? args[0] : args[0]?.url
    const method = args[1]?.method || 'GET'
    const tracer = getTracer()
    const parent = trace.getSpan(context.active())

    const span = tracer.startSpan(`HTTP ${method}`, {
      kind: SpanKind.CLIENT,
      parent: parent?.spanContext?.(),
      attributes: {
        'http.method': method,
        'http.url': url
      }
    })

    console.log('span', span)

    return await context.with(trace.setSpan(context.active(), span), async () => {
      try {
        const res = await originalFetch(...args)
        span.setAttribute('http.status_code', res.status)
        span.setStatus({ code: res.status >= 400 ? 2 : 1 })
        return res
      } catch (err) {
        span.setStatus({ code: 2 })
        throw err
      } finally {
        span.end()
        bufferSpan(span)
      }
    })
  }

  globalThis.fetch.__tomoPatched = true
}

export { patchFetch }
