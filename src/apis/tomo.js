/**
 * @fileoverview Tomo API utility for sending telemetry to the Tomo collector
 * @module apis/tomo
 */

/**
 * Sends telemetry data to the Tomo collector.
 * @param {Object} params
 * @param {string} params.collectorUrl - The base URL of the telemetry collector
 * @param {string} params.apiKey - The API key for authentication
 * @param {Object} params.payload - The telemetry payload to send
 * @returns {Promise<Response>} The fetch response
 */
async function sendTelemetry({ collectorUrl, apiKey, payload }) {
  const url = `${collectorUrl.replace(/\/$/, '')}/ingest`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });
  return res;
}

module.exports = { sendTelemetry }; 