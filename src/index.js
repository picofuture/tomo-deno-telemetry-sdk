/**
 * @fileoverview Entry point for Tomo Telemetry SDK. Exports createTomo for one-liner setup.
 * @module index
 */

const Tomo = require('./core/tomo');

/**
 * Creates a Tomo Telemetry SDK instance
 * @param {import('./core/tomo').TomoConfig} config - SDK configuration
 * @returns {Tomo} Tomo instance
 */
function createTomo(config) {
  return new Tomo(config);
}

module.exports = createTomo;
