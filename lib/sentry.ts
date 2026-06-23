import * as Sentry from '@sentry/react-native';

const sentryDsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
let hasInitializedSentry = false;

export function initSentry() {
  if (hasInitializedSentry) return;
  hasInitializedSentry = true;

  Sentry.init({
    dsn: sentryDsn,
    enabled: Boolean(sentryDsn),
    sendDefaultPii: false,
    tracesSampleRate: 0.1,
  });
}

export { Sentry };
