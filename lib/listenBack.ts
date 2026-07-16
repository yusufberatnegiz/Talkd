import { supabase } from '@/lib/supabase';

export interface ListenBackStatus {
  listensRequired: number;
  canTalk: boolean;
}

interface ListenBackRpcRow {
  listens_required?: unknown;
  can_talk?: unknown;
}

function normalizeListenBackStatus(row: ListenBackRpcRow | null): ListenBackStatus {
  const listensRequired = typeof row?.listens_required === 'number'
    ? Math.max(0, row.listens_required)
    : 0;

  return {
    listensRequired,
    canTalk: row?.can_talk === true || listensRequired === 0,
  };
}

export async function getListenBackStatus(): Promise<ListenBackStatus> {
  const { data, error } = await supabase.rpc('get_listen_back_status');

  if (error) {
    console.warn('Listen-back status RPC failed', error);
    throw new Error('Could not load listen-back status.');
  }

  const rows = Array.isArray(data) ? data as ListenBackRpcRow[] : [];
  return normalizeListenBackStatus(rows[0] ?? null);
}
