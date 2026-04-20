import { supabase } from '@/lib/supabase';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import type { Session } from '@supabase/supabase-js';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => setSession(s));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session === undefined) return; // still loading
    const inAuthGroup = segments[0] === 'auth' || segments[0] === 'onboarding';
    if (!session && !inAuthGroup) {
      router.replace('/onboarding');
    } else if (session && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [session, segments]);

  // Avoid rendering screens before session is known
  if (session === undefined) {
    return <View style={{ flex: 1, backgroundColor: '#0E0D0C' }} />;
  }

  return (
    <>
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
        <Stack.Screen name="rating" />
      </Stack>
    </>
  );
}
