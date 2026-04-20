import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export function useOnlineCount() {
  const [total, setTotal] = useState<number | null>(null);
  const [byTopic, setByTopic] = useState<Record<string, number>>({});

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    async function setup() {
      // If a stale channel with this topic exists (e.g. remount after navigation),
      // await its removal so supabase.channel() creates a fresh one.
      const stale = supabase.getChannels().find(c => c.topic === 'realtime:presence:global');
      if (stale) await supabase.removeChannel(stale);
      if (cancelled) return;

      channel = supabase.channel('presence:global');

      channel
        .on('presence', { event: 'sync' }, () => {
          if (!channel) return;
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
          if (status === 'SUBSCRIBED' && channel) {
            await channel.track({ topic: null });
          }
        });
    }

    void setup();

    return () => {
      cancelled = true;
      if (channel) void supabase.removeChannel(channel);
    };
  }, []);

  return { total, byTopic };
}
