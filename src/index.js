/**
 * Entry point for Tomo Deno Telemetry SDK.
 * Exports the TomoDenoTelemetry class and polyfills for Deno compatibility.
 * @module index
 */
import "./polyfills/settimeout.js";
import "./polyfills/setinterval.js";

import { setupTracer, getTracer } from "./otel/tracers.js";
import { wrapServe as _wrapServe } from "./wrap-serve.js";
import { tracedFetch as _tracedFetch } from "./process-fetch.js";

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
    this.config = config;

    setupTracer(this.config.serviceName, this.config.serviceVersion, this.config.apiKey, this.config.collectorUrl)

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

  /**
   * Drop-in replacement for fetch with tracing. Accepts url, options, and optional parentTrace.
   * @param {RequestInfo} url
   * @param {RequestInit} [options]
   * @param {object} [parentTrace]
   * @returns {Promise<Response>}
   */
  tracedFetch(url, options, parentTrace) {
    return _tracedFetch(url, options, parentTrace);
  }
}

export default TomoDenoTelemetry;