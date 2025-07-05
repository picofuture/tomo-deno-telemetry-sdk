let activeRoot = null
let spanBuffer = []
let config = {}

function setConfig(cfg) {
  config = cfg
}

function getConfig() {
  return config
}

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

  const apiKey = config.apiKey
  spanBuffer = []

  return fetch('https://collector.picofuture.com/v1/traces', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey
    },
    body: JSON.stringify(body)
  })
}

export {
  setConfig,
  getConfig,
  setActiveRootSpan,
  getActiveRootSpan,
  bufferSpan,
  flushBuffer
}
