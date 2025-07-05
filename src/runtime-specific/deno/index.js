import { setConfig } from "./otel/config.js";
import { setupTracer } from "./otel/tracers.js";
import { patchFetch } from "./patch-fetch.js";
import { wrapServe } from "./wrap-serve.js";


class DenoRuntime {
  constructor(config) {
    if (!config.apiKey) throw new Error('apiKey required')

    setConfig(config)
  }

  init() {
    setupTracer()

    patchFetch()
  }

  getWrappedServe(serveFn) {
    console.log('getWrappedServe', serveFn)
    return wrapServe(serveFn)
  }
}

export default DenoRuntime;