import { setupTracer } from "./otel/tracers.js";
import { patchFetch } from "./patch-fetch.js";
import { wrapServe } from "./wrap-serve.js";


class DenoRuntime {
  constructor(config) {
    if (!config.apiKey) throw new Error('apiKey required')
    if (!config.serviceName) throw new Error('serviceName required')
    if (!config.serviceVersion) throw new Error('serviceVersion required')
    if (!config.collectorUrl) throw new Error('collectorUrl required')

    this.serviceName = config.serviceName
    this.serviceVersion = config.serviceVersion
    this.collectorUrl = config.collectorUrl
    this.apiKey = config.apiKey
  }

  init() {
    setupTracer(this.serviceName, this.serviceVersion, this.apiKey, this.collectorUrl)
    patchFetch()
  }

  getWrappedServe(serveFn) {
    return wrapServe(serveFn)
  }
}

export default DenoRuntime;