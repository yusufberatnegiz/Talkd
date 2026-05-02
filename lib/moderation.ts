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
    console.error('Moderation function failed', error);
    throw new Error('Moderation is temporarily busy.');
  }

  return {
    isSafe: data?.isSafe === true,
    isCrisis: data?.isCrisis === true,
  };
}
