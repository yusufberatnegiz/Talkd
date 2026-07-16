import { supabase } from '@/lib/supabase';

export interface MatchQueueResult {
  matched: boolean;
  sessionId: string | null;
  otherUserId: string | null;
  otherIntent: string | null;
  otherSpecific: string | null;
}

interface MatchQueueRpcRow {
  matched?: unknown;
  session_id?: unknown;
  other_user_id?: unknown;
  other_intent?: unknown;
  other_specific?: unknown;
}

function normalizeMatchQueueRow(row: MatchQueueRpcRow | null): MatchQueueResult {
  return {
    matched: row?.matched === true,
    sessionId: typeof row?.session_id === 'string' ? row.session_id : null,
    otherUserId: typeof row?.other_user_id === 'string' ? row.other_user_id : null,
    otherIntent: typeof row?.other_intent === 'string' ? row.other_intent : null,
    otherSpecific: typeof row?.other_specific === 'string' ? row.other_specific : null,
  };
}

export async function findOrCreateMatch(input: {
  topic: string;
  specific: string;
  intent: string;
  role: 'talker' | 'listener';
  allowTalkerFallback: boolean;
  preferHelpfulListeners?: boolean;
  skipListenBackGate?: boolean;
}): Promise<MatchQueueResult> {
  const rpcParams = {
    p_topic: input.topic,
    p_specific: input.specific,
    p_intent: input.intent,
    p_role: input.role,
    p_allow_talker_fallback: input.allowTalkerFallback,
    p_priority_listener_preference: input.preferHelpfulListeners === true,
    p_skip_listen_back_gate: input.skipListenBackGate === true,
  };

  const { data, error } = await supabase.rpc('find_or_create_match', rpcParams);

  if (error) {
    console.warn('Match queue RPC failed', error);
    throw new Error('Could not search for a match.');
  }

  const rows = Array.isArray(data) ? data as MatchQueueRpcRow[] : [];
  return normalizeMatchQueueRow(rows[0] ?? null);
}

export async function cancelMatchQueue(): Promise<void> {
  const { error } = await supabase.rpc('cancel_match_queue');

  if (error) {
    console.warn('Cancel match queue RPC failed', error);
  }
}
