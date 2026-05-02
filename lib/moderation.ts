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
    throw new Error('Moderation failed.');
  }

  return {
    isSafe: data?.isSafe === true,
    isCrisis: data?.isCrisis === true,
  };
}
