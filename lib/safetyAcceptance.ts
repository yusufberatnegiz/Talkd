import { supabase } from '@/lib/supabase';

type SafetyAcceptanceListener = (accepted: boolean) => void;

const listeners = new Set<SafetyAcceptanceListener>();

interface SafetyProfileRow {
  safety_accepted_at: string | null;
}

export function subscribeSafetyAcceptance(listener: SafetyAcceptanceListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifySafetyAcceptance(accepted: boolean) {
  listeners.forEach(listener => listener(accepted));
}

export async function hasAcceptedSafetyGuidelines(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('profiles')
    .select('safety_accepted_at')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    console.error('Could not load safety acceptance', error);
    return false;
  }

  const profile = data as SafetyProfileRow | null;
  return typeof profile?.safety_accepted_at === 'string';
}

export async function markSafetyGuidelinesAccepted(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Sign in is required.');
  }

  const acceptedAt = new Date().toISOString();
  const { data, error } = await supabase
    .from('profiles')
    .update({ safety_accepted_at: acceptedAt })
    .eq('id', user.id)
    .select('id')
    .maybeSingle();

  if (!error && data) {
    notifySafetyAcceptance(true);
    return;
  }

  const { error: upsertError } = await supabase
    .from('profiles')
    .upsert({ id: user.id, safety_accepted_at: acceptedAt }, { onConflict: 'id' });

  if (upsertError) {
    console.error('Could not save safety acceptance', upsertError);
    throw new Error('Could not save safety acceptance.');
  }

  notifySafetyAcceptance(true);
}
