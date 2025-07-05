import { setupTracer } from "./otel/tracers.js";
import { patchFetch } from "./patch-fetch.js";
import { wrapServe } from "./wrap-serve.js";


class DenoRuntime {
  constructor(config) {
    if (!config.apiKey) throw new Error('apiKey required')
    this.serviceName = config.serviceName || 'unknown_service'
    this.serviceVersion = config.serviceVersion || '0.0.1'
    this.apiKey = config.apiKey
  }

  init() {
    setupTracer(this.serviceName, this.serviceVersion, this.apiKey)
    patchFetch()
  }

  getWrappedServe(serveFn) {
    return wrapServe(serveFn)
  }
}

export default DenoRuntime;