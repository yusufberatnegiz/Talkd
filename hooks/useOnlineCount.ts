import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export function useOnlineCount() {
  const [total, setTotal] = useState<number | null>(null);
  const [byTopic, setByTopic] = useState<Record<string, number>>({});

  useEffect(() => {
    const channel = supabase.channel('presence:global');

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<{ topic: string | null }>();
        const members = Object.values(state).flat();
        setTotal(members.length);
        const counts: Record<string, number> = {};
        for (const m of members) {
          if (m.topic) counts[m.topic] = (counts[m.topic] ?? 0) + 1;
        }
        setByTopic(counts);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ topic: null });
        }
      });

    return () => { supabase.removeChannel(channel); };
  }, []);

  return { total, byTopic };
}
