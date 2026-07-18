import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

function readPublicConfig(value: string | undefined) {
  const normalized = value?.trim();
  return normalized || undefined;
}

const supabaseUrl = readPublicConfig(process.env.EXPO_PUBLIC_SUPABASE_URL);
const supabaseAnonKey = readPublicConfig(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);

export const missingSupabaseConfig = [
  !supabaseUrl ? 'EXPO_PUBLIC_SUPABASE_URL' : null,
  !supabaseAnonKey ? 'EXPO_PUBLIC_SUPABASE_ANON_KEY' : null,
].filter((name): name is string => name !== null);

// Keep module evaluation safe so a missing build variable can render a useful
// startup error instead of becoming an opaque native crash in Release builds.
export const supabase = createClient(
  supabaseUrl ?? 'https://invalid.talkd.local',
  supabaseAnonKey ?? 'missing-anon-key',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
