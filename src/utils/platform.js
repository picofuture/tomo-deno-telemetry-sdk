/**
 * @fileoverview Platform detection utility for Tomo SDK
 * @module utils/platform
 */

const detectRuntime = require('detect-runtime');

/**
 * Detects the current JavaScript runtime platform using detect-runtime package.
 * @returns {string}
 */
function detectPlatform() {
  return detectRuntime();
}

module.exports = { detectPlatform }; 