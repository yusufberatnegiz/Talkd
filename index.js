const { initSentry } = require('./lib/sentry');

initSentry();

const errorUtils = globalThis.ErrorUtils;
const previousGlobalHandler = errorUtils?.getGlobalHandler?.();

errorUtils?.setGlobalHandler?.((error, isFatal) => {
  console.error('Unhandled JavaScript error', { error, isFatal });
  previousGlobalHandler?.(error, isFatal);
});

require('expo-router/entry');
