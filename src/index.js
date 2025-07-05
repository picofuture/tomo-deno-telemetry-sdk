import { detectRuntime } from 'detect-runtime'

import DenoRuntime from './runtime-specific/deno/index.js'
import GeneralRuntime from './runtime-specific/general/index.js'

class TomoTelemetry {
  constructor(config) {
    this.config = config
    this.runtimeEnvironment = detectRuntime()
    this.runtime = null
  }

  init() {
    console.log('--------------------------------')
    console.log('Initializing Tomo Telemetry')
    console.log('Initializing general runtime telemetry')

    const generalRuntime = new GeneralRuntime(this.config)
    generalRuntime.init()
    
    console.log('Intializing telemetry for runtime:', this.runtime)

    switch (this.runtimeEnvironment) {
      case 'deno': {
        const denoRuntime = new DenoRuntime(this.config)
        denoRuntime.init()
        this.runtime = denoRuntime
        break
      }
      default:
        console.warn(`Tomo Telemetry: runtime ${this.runtimeEnvironment} not instrumented yet.`)
    }

    console.log('Tomo Telemetry initialized')
    console.log('--------------------------------')
  }

  getRuntime() {
    return this.runtime
  }
}

const tomoTelemetry = (config) => new TomoTelemetry(config)

export default tomoTelemetry
