import { supabase } from '@/lib/supabase';

export async function ensureOwnProfile(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.rpc('ensure_own_profile');

  if (error) {
    console.warn('Could not ensure profile row', error);
    throw new Error('Could not prepare your account.');
  }
}
