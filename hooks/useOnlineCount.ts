import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export function useOnlineCount() {
  const [total, setTotal] = useState<number | null>(null);
  const [byTopic, setByTopic] = useState<Record<string, number>>({});

  useEffect(() => {
    const channel = supabase.channel('presence:global');

    function handleSync() {
      const state = channel.presenceState<{ topic: string | null }>();
      const members = Object.values(state).flat();
      setTotal(members.length);
      const counts: Record<string, number> = {};
      for (const m of members) {
        if (m.topic) counts[m.topic] = (counts[m.topic] ?? 0) + 1;
      }
      setByTopic(counts);
    }

    // supabase.channel() returns an existing channel if one with this topic
    // already exists in the registry. If the returned channel is already
    // joined/joining (stale from a previous mount), .on() would throw.
    // In that case we read current state once and skip re-subscribing.
    const alreadyActive = channel.state === 'joined' || channel.state === 'joining';

    if (!alreadyActive) {
      channel
        .on('presence', { event: 'sync' }, handleSync)
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') await channel.track({ topic: null });
        });
    } else {
      handleSync();
    }

    return () => { void supabase.removeChannel(channel); };
  }, []);

  return { total, byTopic };
}
