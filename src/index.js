/**
 * Entry point for Tomo Deno Telemetry SDK.
 * Exports the TomoDenoTelemetry class and polyfills for Deno compatibility.
 * @module index
 */
import "./polyfills/settimeout.js";
import "./polyfills/setinterval.js";

import { setupTracer, getTracer } from "./otel/tracers.js";
import { wrapServe as _wrapServe } from "./wrap-serve.js";
import { setConfig } from "./store/config-store.js";

/**
 * TomoDenoTelemetry provides tracing utilities for Deno environments.
 */
class TomoDenoTelemetry {
  /**
   * @param {object} config - { apiKey, serviceName, serviceVersion, collectorUrl }
   */
  constructor(config) {
    if (!config.apiKey) throw new Error('apiKey required')
    if (!config.serviceName) throw new Error('serviceName required')
    if (!config.serviceVersion) throw new Error('serviceVersion required')
    if (!config.collectorUrl) throw new Error('collectorUrl required')

    if (config.debug === undefined) {
      config.debug = false;
    }

    setConfig(config);

    setupTracer()

    this.tracer = getTracer();
  }

  /**
   * Returns the initialized tracer instance.
   * @returns {import('@opentelemetry/api').Tracer|null} The tracer instance or null if not initialized
   */
  getTracer() {
    return this.tracer;
  }

  /**
   * Wraps a Deno serve function with tracing. Accepts options (e.g., parentTrace).
   * @param {function} serveFn - The Deno serve function
   * @param {object} [options] - Options including parentTrace
   * @returns {function}
   */
  wrapServe(serveFn, options) {
    return _wrapServe(serveFn, options);
  }
}

export default TomoDenoTelemetry;