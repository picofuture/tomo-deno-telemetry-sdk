import { detectRuntime } from 'detect-runtime'

import DenoRuntime from './runtime-specific/deno/index.js'
import GeneralRuntime from './runtime-specific/general/index.js'

class TomoTelemetry {
  constructor(config) {
    this.config = config
    this.runtime = detectRuntime()
  }

  init() {
    console.log('--------------------------------')
    console.log('Initializing Tomo Telemetry')
    console.log('Initializing general runtime telemetry')

    const generalRuntime = new GeneralRuntime(this.config)
    generalRuntime.init()
    
    console.log('Intializing telemetry for runtime:', this.runtime)

    switch (this.runtime) {
      case 'deno': {
        const denoRuntime = new DenoRuntime(this.config)
        denoRuntime.init()
        break
      }
      default:
        console.warn(`Tomo Telemetry: runtime ${this.runtime} not instrumented yet.`)
    }

    console.log('Tomo Telemetry initialized')
    console.log('--------------------------------')
  }
}

const tomoTelemetry = (config) => new TomoTelemetry(config)

export default tomoTelemetry
