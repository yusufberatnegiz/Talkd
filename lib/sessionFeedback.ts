import { supabase } from '@/lib/supabase';

export async function submitSessionRating(input: {
  sessionId: string;
  stars: number | null;
  badge: string | null;
  privateNote: string | null;
}): Promise<void> {
  const { error } = await supabase.rpc('submit_session_rating', {
    p_session_id: input.sessionId,
    p_stars: input.stars,
    p_badge: input.badge,
    p_private_note: input.privateNote,
  });

  if (error) {
    console.warn('Submit session rating RPC failed', error);
    throw new Error('Could not save session rating.');
  }
}

export async function submitSessionReport(input: {
  sessionId: string;
  reason: string;
  details?: string | null;
}): Promise<void> {
  const { error } = await supabase.rpc('submit_session_report', {
    p_session_id: input.sessionId,
    p_reason: input.reason,
    p_details: input.details ?? null,
  });

  if (error) {
    console.warn('Submit session report RPC failed', error);
    throw new Error('Could not save session report.');
  }
}
