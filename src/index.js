import { detectRuntime } from 'detect-runtime'

import DenoRuntime from './runtime-specific/deno.js'

class TomoTelemetry {
  constructor(config) {
    this.config = config
    this.runtime = detectRuntime()
  }

  init() {
    switch (this.runtime) {
      case 'deno': {
        const denoRuntime = new DenoRuntime(this.config)
        denoRuntime.init()
        break
      }
      default:
        console.error(`Unsupported runtime: ${this.runtime} for Tomo.`)
    }
  }
}

const tomoTelemetry = (config) => new TomoTelemetry(config)

export default tomoTelemetry
