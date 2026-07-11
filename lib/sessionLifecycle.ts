import { supabase } from '@/lib/supabase';

export async function endSession(input: {
  sessionId: string;
  durationSeconds: number;
}): Promise<void> {
  const { error } = await supabase.rpc('end_session', {
    p_session_id: input.sessionId,
    p_duration_seconds: input.durationSeconds,
  });

  if (error) {
    console.warn('End session RPC failed', error);
    throw new Error('Could not end session.');
  }
}
