import { supabase } from '@/lib/supabase';

interface DeleteAccountResponse {
  deleted?: unknown;
}

export async function deleteOwnAccount(): Promise<void> {
  const { data, error } = await supabase.functions.invoke<DeleteAccountResponse>('delete-account', {
    body: {},
  });

  if (error || data?.deleted !== true) {
    throw new Error('Account could not be deleted.');
  }

  await supabase.auth.signOut();
}
