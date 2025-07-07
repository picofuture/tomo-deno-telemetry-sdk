/**
 * Polyfill for Node.js-style setInterval with unref/ref/close for Deno compatibility.
 * @module polyfills/setinterval
 */
const nativeSetInterval = setInterval;
/**
 * Polyfilled setInterval that returns an object with unref, ref, and close methods.
 * @param {Function} cb - The callback function to execute.
 * @param {number} delay - The delay in milliseconds.
 * @param {...*} args - Additional arguments to pass to the callback.
 * @returns {{id: number, unref: function(): object, ref: function(): object, close: function(): void}}
 */
globalThis.setInterval = function (cb, delay, ...args) {
  const id = nativeSetInterval(cb, delay, ...args);
  return {
    id,
    unref() { return this; },
    ref() { return this; },
    close() { clearInterval(id); }
  };
};