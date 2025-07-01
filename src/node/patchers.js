// Node-specific patchers for Tomo SDK

const { sendTelemetry } = require('../apis/tomo');

/**
 * Monkey-patch global.fetch to capture network requests in Node.js
 * @param {Object} config - SDK config
 * @returns {{shutdown: function}} - Shutdown restores original fetch
 */
function patchNetwork(config) {
  if (typeof global.fetch !== 'function') {
    return { shutdown: () => {} };
  }
  const originalFetch = global.fetch;
  global.fetch = async function patchedFetch(...args) {
    const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;
    // Avoid sending telemetry for requests to the collector itself
    if (url && url.startsWith(config.collectorUrl)) {
      return originalFetch.apply(this, args);
    }
    const response = await originalFetch.apply(this, args);
    const cloned = response.clone ? response.clone() : response;
    try {
      const data = await cloned.json();
      sendTelemetry({
        collectorUrl: config.collectorUrl,
        apiKey: config.apikey,
        payload: {
          type: 'network',
          url,
          method: args[1]?.method || 'GET',
          status: response.status,
          responseData: data
        }
      });
    } catch (e) {
      sendTelemetry({
        collectorUrl: config.collectorUrl,
        apiKey: config.apikey,
        payload: {
          type: 'network',
          url,
          method: args[1]?.method || 'GET',
          status: response.status,
          responseData: null
        }
      });
    }
    return response;
  };
  return {
    shutdown: () => {
      global.fetch = originalFetch;
    }
  };
}

/**
 * Monkey-patch process to capture uncaught exceptions and unhandled rejections in Node.js
 * @param {Object} config - SDK config
 * @returns {{shutdown: function}} - Shutdown removes listeners
 */
function patchErrors(config) {
  function onUncaughtException(error) {
    sendTelemetry({
      collectorUrl: config.collectorUrl,
      apiKey: config.apikey,
      payload: {
        type: 'error',
        message: error.message,
        stack: error.stack,
        severity: 'uncaughtException'
      }
    });
  }
  function onUnhandledRejection(reason) {
    sendTelemetry({
      collectorUrl: config.collectorUrl,
      apiKey: config.apikey,
      payload: {
        type: 'error',
        message: reason && reason.message ? reason.message : String(reason),
        stack: reason && reason.stack ? reason.stack : undefined,
        severity: 'unhandledRejection'
      }
    });
  }
  process.on('uncaughtException', onUncaughtException);
  process.on('unhandledRejection', onUnhandledRejection);
  return {
    shutdown: () => {
      process.off('uncaughtException', onUncaughtException);
      process.off('unhandledRejection', onUnhandledRejection);
    }
  };
}

module.exports = { patchNetwork, patchErrors };
