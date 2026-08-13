import { AppErrorBoundary } from '@/components/AppErrorBoundary';
import { StartupConfigurationError } from '@/components/StartupConfigurationError';
import { PremiumProvider } from '@/hooks/usePremium';
import { Sentry, isSentryEnabled } from '@/lib/sentry';
import { missingSupabaseConfig, supabase } from '@/lib/supabase';
import { ensureOwnProfile } from '@/lib/profile';
import {
  hasAcceptedSafetyGuidelines,
  hasPendingSafetyAcceptance,
  markSafetyGuidelinesAccepted,
  subscribeSafetyAcceptance,
} from '@/lib/safetyAcceptance';
import { markPasswordRecoveryUrl, setPasswordRecoveryActive, subscribePasswordRecoveryActive } from '@/lib/passwordRecovery';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Linking, View } from 'react-native';
import type { Session } from '@supabase/supabase-js';

function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [safetyAccepted, setSafetyAccepted] = useState<boolean | undefined>(undefined);
  const [passwordRecoveryOpen, setPasswordRecoveryOpen] = useState(false);
  const activeUserId = useRef<string | null>(null);
  const sessionUserId = session?.user.id;

  useEffect(() => {
    function applySession(nextSession: Session | null) {
      const nextUserId = nextSession?.user.id ?? null;
      if (!nextSession) {
        setSafetyAccepted(false);
      } else if (activeUserId.current !== nextUserId) {
        setSafetyAccepted(undefined);
      }
      activeUserId.current = nextUserId;
      setSession(nextSession);
    }

    supabase.auth.getSession()
      .then(({ data: { session: s } }) => {
        applySession(s);
      })
      .catch((error: unknown) => {
        console.warn('Could not restore auth session', error);
        Sentry.captureException(error);
        applySession(null);
      });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === 'PASSWORD_RECOVERY') setPasswordRecoveryActive(true);
      if (event === 'SIGNED_OUT') setPasswordRecoveryActive(false);
      applySession(s);
    });
    const unsubscribeSafetyAcceptance = subscribeSafetyAcceptance(setSafetyAccepted);
    const unsubscribePasswordRecovery = subscribePasswordRecoveryActive(setPasswordRecoveryOpen);
    Linking.getInitialURL()
      .then(markPasswordRecoveryUrl)
      .catch((error: unknown) => {
        console.warn('Could not read initial auth link', error);
        Sentry.captureException(error);
      });
    const linkingSubscription = Linking.addEventListener('url', ({ url }) => {
      markPasswordRecoveryUrl(url);
    });
    return () => {
      unsubscribeSafetyAcceptance();
      unsubscribePasswordRecovery();
      linkingSubscription.remove();
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    async function loadSafetyAcceptance() {
      if (!sessionUserId) {
        setSafetyAccepted(false);
        return;
      }

      setSafetyAccepted(undefined);
      try {
        await ensureOwnProfile();
        let accepted = await hasAcceptedSafetyGuidelines();
        if (!accepted && await hasPendingSafetyAcceptance()) {
          await markSafetyGuidelinesAccepted();
          accepted = true;
        }
        if (!isCancelled) setSafetyAccepted(accepted);
      } catch (error: unknown) {
        console.warn('Could not prepare signed-in account', error);
        Sentry.captureException(error);
        if (!isCancelled) setSafetyAccepted(false);
      }
    }

    void loadSafetyAcceptance();

    return () => {
      isCancelled = true;
    };
  }, [sessionUserId]);

  useEffect(() => {
    if (session === undefined) return; // still loading
    if (session && safetyAccepted === undefined) return;

    const inAuthGroup = segments[0] === 'auth' || segments[0] === 'onboarding';
    const inOnboarding = segments[0] === 'onboarding';

    if (!session && !inAuthGroup) {
      router.replace('/onboarding');
    } else if (session && !safetyAccepted && !inOnboarding) {
      router.replace('/onboarding');
    } else if (session && safetyAccepted && inAuthGroup && !passwordRecoveryOpen) {
      router.replace('/(tabs)');
    }
  }, [session, safetyAccepted, segments, passwordRecoveryOpen]);

  // Keep routing transitions invisible until auth and safety state agree.
  if (session === undefined || (session && safetyAccepted === undefined)) {
    return <View style={{ flex: 1, backgroundColor: '#0E0D0C' }} />;
  }

  return (
    <PremiumProvider enabled={session !== null}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="intent" />
        <Stack.Screen name="match" />
        <Stack.Screen name="chat" />
        <Stack.Screen name="listener" />
        <Stack.Screen name="privacy" />
        <Stack.Screen name="premium" />
        <Stack.Screen name="rating" />
      </Stack>
    </PremiumProvider>
  );
}

function RootLayoutGuard() {
  return (
    <AppErrorBoundary>
      {missingSupabaseConfig.length > 0
        ? <StartupConfigurationError missing={missingSupabaseConfig} />
        : <RootLayout />}
    </AppErrorBoundary>
  );
}

export default isSentryEnabled() ? Sentry.wrap(RootLayoutGuard) : RootLayoutGuard;
