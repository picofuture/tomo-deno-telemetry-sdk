import { getConfig } from './config.js'

let activeRoot = null
let spanBuffer = []

function setActiveRootSpan(span) {
  activeRoot = span
}

function getActiveRootSpan() {
  return activeRoot
}

function bufferSpan(span) {
  spanBuffer.push(span)
}

function flushBuffer() {
  if (!spanBuffer.length) return

  const spans = spanBuffer.map((span) => {
    return {
      traceId: span.spanContext().traceId,
      spanId: span.spanContext().spanId,
      parentSpanId: span.parentSpanId || undefined,
      name: span.name,
      startTimeUnixNano: span.startNano,
      endTimeUnixNano: span.endNano,
      attributes: Object.entries(span.attributes || {}).map(([key, val]) => ({
        key,
        value: { stringValue: String(val) }
      })),
      kind: span.kind,
      status: { code: span.status?.code || 1 }
    }
  })

  const body = {
    resourceSpans: [
      {
        resource: {
          attributes: [{ key: 'service.name', value: { stringValue: 'tomo-runtime' } }]
        },
        scopeSpans: [
          {
            scope: { name: 'tomo-runtime' },
            spans
          }
        ]
      }
    ]
  }

  const apiKey = getConfig().apiKey
  spanBuffer = []

  console.log('body', JSON.stringify(body, null, 2))

  // return fetch('https://collector.picofuture.com/v1/traces', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'x-api-key': apiKey
  //   },
  //   body: JSON.stringify(body)
  // })
}

export {
  setActiveRootSpan,
  getActiveRootSpan,
  bufferSpan,
  flushBuffer
}
