import { supabase } from '@/lib/supabase';

export async function ensureOwnProfile(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('profiles')
    .upsert({ id: user.id }, { onConflict: 'id', ignoreDuplicates: true });

  if (error) {
    console.warn('Could not ensure profile row', error);
    throw new Error('Could not prepare your account.');
  }
}
