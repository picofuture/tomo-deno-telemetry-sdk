/**
 * Polyfill for Node.js-style setTimeout with unref/ref/close for Deno compatibility.
 * @module polyfills/settimeout
 */
const nativeSetTimeout = setTimeout;
/**
 * Polyfilled setTimeout that returns an object with unref, ref, and close methods.
 * @param {Function} cb - The callback function to execute.
 * @param {number} delay - The delay in milliseconds.
 * @param {...*} args - Additional arguments to pass to the callback.
 * @returns {{id: number, unref: function(): object, ref: function(): object, close: function(): void}}
 */
globalThis.setTimeout = function (cb, delay, ...args) {
  const id = nativeSetTimeout(cb, delay, ...args);
  // Return an object with .unref() (and optionally .ref())
  return {
    id,
    unref() { return this; }, // No-op for Deno
    ref() { return this; },   // Optional, for completeness
    close() { clearTimeout(id); } // Optional helper
  };
};