import * as Sentry from '@sentry/react-native';

const sentryDsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
const sentryConfigured = process.env.EXPO_PUBLIC_ENABLE_SENTRY === 'true' && Boolean(sentryDsn);
let hasInitializedSentry = false;

export function initSentry() {
  if (hasInitializedSentry || !sentryConfigured) return;
  hasInitializedSentry = true;

  Sentry.init({
    dsn: sentryDsn,
    enabled: Boolean(sentryDsn),
    sendDefaultPii: false,
    tracesSampleRate: 0.1,
  });
}

export function isSentryEnabled() {
  return sentryConfigured;
}

export { Sentry };
