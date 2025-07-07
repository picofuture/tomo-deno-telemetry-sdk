const nativeSetInterval = setInterval;
globalThis.setInterval = function (cb, delay, ...args) {
  const id = nativeSetInterval(cb, delay, ...args);
  return {
    id,
    unref() { return this; },
    ref() { return this; },
    close() { clearInterval(id); }
  };
};