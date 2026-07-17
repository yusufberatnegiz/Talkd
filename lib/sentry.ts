import type { ComponentType } from 'react';
import type * as SentryNative from '@sentry/react-native';

const sentryDsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
const sentryConfigured = process.env.EXPO_PUBLIC_ENABLE_SENTRY === 'true' && Boolean(sentryDsn);
let hasInitializedSentry = false;
let sentryModule: typeof SentryNative | null = null;

export function initSentry() {
  if (hasInitializedSentry || !sentryConfigured) return;

  const nativeSentry = loadSentry();
  if (!nativeSentry) return;

  hasInitializedSentry = true;
  nativeSentry.init({
    dsn: sentryDsn,
    enabled: Boolean(sentryDsn),
    sendDefaultPii: false,
    tracesSampleRate: 0.1,
  });
}

export function isSentryEnabled() {
  return sentryConfigured;
}

function loadSentry(): typeof SentryNative | null {
  if (!sentryConfigured) return null;
  if (sentryModule) return sentryModule;

  try {
    // Keep native Sentry out of TestFlight startup unless it is explicitly enabled.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    sentryModule = require('@sentry/react-native') as typeof SentryNative;
    return sentryModule;
  } catch (error: unknown) {
    console.warn('Sentry native module is unavailable', error);
    return null;
  }
}

const Sentry = {
  captureException(error: unknown) {
    loadSentry()?.captureException(error);
  },
  wrap(component: ComponentType): ComponentType {
    const nativeSentry = loadSentry();
    if (!nativeSentry) return component;
    return nativeSentry.wrap(component as ComponentType<Record<string, unknown>>) as ComponentType;
  },
};

export { Sentry };
