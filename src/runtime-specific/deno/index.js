import { setConfig } from "./otel/context";
import { setupTracer } from "./otel/tracers";


class DenoRuntime {
  constructor(config) {
    if (!config.apiKey) throw new Error('apiKey required')

    setConfig(config)
  }

  init() {
    setupTracer()

    patchFetch()
    
    patchServe()
  }
}

export default DenoRuntime;