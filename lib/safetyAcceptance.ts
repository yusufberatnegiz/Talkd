import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';

type SafetyAcceptanceListener = (accepted: boolean) => void;

const listeners = new Set<SafetyAcceptanceListener>();
const PENDING_SAFETY_ACCEPTANCE_KEY = 'talkd:pending-safety-acceptance';

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
    console.warn('Could not load safety acceptance', error);
    return false;
  }

  const profile = data as SafetyProfileRow | null;
  return typeof profile?.safety_accepted_at === 'string';
}

export async function hasPendingSafetyAcceptance(): Promise<boolean> {
  return await AsyncStorage.getItem(PENDING_SAFETY_ACCEPTANCE_KEY) === 'true';
}

export async function markSafetyGuidelinesPending(): Promise<void> {
  await AsyncStorage.setItem(PENDING_SAFETY_ACCEPTANCE_KEY, 'true');
}

export async function markSafetyGuidelinesAccepted(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Sign in is required.');
  }

  const { error } = await supabase.rpc('accept_safety_guidelines');

  if (error) {
    console.warn('Could not save safety acceptance', error);
    throw new Error('Could not save safety acceptance.');
  }

  await AsyncStorage.removeItem(PENDING_SAFETY_ACCEPTANCE_KEY);
  notifySafetyAcceptance(true);
}
