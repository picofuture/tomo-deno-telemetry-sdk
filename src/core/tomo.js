/**
 * @fileoverview Tomo core class for telemetry SDK. Handles config, platform detection, and patcher loading.
 * @module core/tomo
 */

const { detectPlatform } = require('../utils/platform');

/**
 * @typedef {Object} TomoConfig
 * @property {string} apikey - API key for authentication
 * @property {string} collectorUrl - URL of the telemetry collector
 * @property {string} serviceName - Name of the service being instrumented
 */

/**
 * Tomo Telemetry SDK core class
 */
class Tomo {
  /**
   * @param {TomoConfig} config - SDK configuration
   */
  constructor(config) {
    /** @private */
    this.config = config;
    /** @private */
    this.platform = detectPlatform();
    /** @private */
    this.patchers = [];
  }

  /**
   * Initialize telemetry patchers for the detected platform
   */
  init() {
    if (this.platform === 'node') {
      this.initNodePatchers();
    }
    // Future: add browser, deno, react-native patchers
  }

  /**
   * Initialize Node-specific patchers
   * @private
   */
  initNodePatchers() {
    const { patchNetwork, patchErrors } = require('../node/patchers');

    this.patchers.push(patchNetwork(this.config));
    this.patchers.push(patchErrors(this.config));
  }

  /**
   * Shutdown and cleanup all patchers
   */
  shutdown() {
    this.patchers.forEach((patcher) => {
      if (typeof patcher.shutdown === 'function') patcher.shutdown();
    });
  }
}

module.exports = Tomo; 