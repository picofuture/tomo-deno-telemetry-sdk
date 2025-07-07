const nativeSetTimeout = setTimeout;
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