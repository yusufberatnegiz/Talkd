import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export type UserStats = {
  sessions: number;
  totalMinutes: number;
  avgRating: number | null;
};

interface SessionRow { duration_seconds: number }
interface RatingSummaryRow {
  avg_stars: number | null;
  rating_count: number | null;
}

export function useUserStats() {
  const [stats, setStats] = useState<UserStats>({ sessions: 0, totalMinutes: 0, avgRating: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const [sessionsRes, ratingsRes] = await Promise.all([
          supabase
            .from('sessions')
            .select('duration_seconds')
            .or(`participant_a.eq.${user.id},participant_b.eq.${user.id}`),
          supabase
            .from('session_ratings_public')
            .select('avg_stars,rating_count')
            .eq('rated_user_id', user.id)
            .maybeSingle(),
        ]);

        const sessions = (sessionsRes.data ?? []) as SessionRow[];
        const ratingSummary = ratingsRes.data as RatingSummaryRow | null;

        const totalSeconds = sessions.reduce((acc, s) => acc + (s.duration_seconds ?? 0), 0);
        const avgRating = ratingSummary?.avg_stars !== null && ratingSummary?.avg_stars !== undefined
          ? Math.round(ratingSummary.avg_stars * 10) / 10
          : null;

        setStats({
          sessions: sessions.length,
          totalMinutes: Math.round(totalSeconds / 60),
          avgRating,
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { stats, loading };
}
