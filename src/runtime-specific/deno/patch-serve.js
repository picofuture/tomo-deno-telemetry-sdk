import { trace, context, SpanKind } from 'npm:@opentelemetry/api@1.9.0'
import * as std from 'https://deno.land/std@0.203.0/http/server.ts'

import { getTracer } from './otel/tracers.js'
import { setActiveRootSpan, flushBuffer } from './otel/context.js'

const originalServe = std.serve

function patchServe() {
  std.serve = function (userHandler, options) {
    return originalServe(async (req) => {
      const tracer = getTracer()
      const span = tracer.startSpan('http.request', {
        kind: SpanKind.SERVER,
        attributes: { 'http.method': req.method, 'http.url': req.url }
      })

      setActiveRootSpan(span)

      return await context.with(trace.setSpan(context.active(), span), async () => {
        try {
          return await userHandler(req)
        } finally {
          span.end()
          await flushBuffer()
        }
      })
    }, options)
  }
}

export { patchServe }
