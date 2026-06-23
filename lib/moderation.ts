import { supabase } from '@/lib/supabase';

interface ModerationResponse {
  isSafe?: unknown;
  isCrisis?: unknown;
}

export async function moderateMessage(text: string): Promise<{
  isSafe: boolean;
  isCrisis: boolean;
}> {
  const { data, error } = await supabase.functions.invoke<ModerationResponse>('moderate-message', {
    body: { text },
  });

  if (error) {
    console.warn('Moderation function failed', error);
    throw new Error('Moderation is temporarily busy.');
  }

  if (typeof data?.isSafe !== 'boolean' || typeof data?.isCrisis !== 'boolean') {
    console.warn('Moderation function returned an invalid response');
    throw new Error('Moderation is temporarily busy.');
  }

  return {
    isSafe: data.isSafe,
    isCrisis: data.isCrisis,
  };
}
