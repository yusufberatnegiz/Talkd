import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export type UserStats = {
  sessions: number;
  totalMinutes: number;
  avgRating: number | null;
};

interface SessionRow { duration_seconds: number }
interface RatingRow { stars: number }

export function useUserStats() {
  const [stats, setStats] = useState<UserStats>({ sessions: 0, totalMinutes: 0, avgRating: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const [sessionsRes, ratingsRes] = await Promise.all([
        supabase
          .from('sessions')
          .select('duration_seconds')
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`),
        supabase
          .from('session_ratings_public')
          .select('stars')
          .eq('rated_user_id', user.id),
      ]);

      const sessions = (sessionsRes.data ?? []) as SessionRow[];
      const ratings = (ratingsRes.data ?? []) as RatingRow[];

      const totalSeconds = sessions.reduce((acc, s) => acc + (s.duration_seconds ?? 0), 0);
      const avgRating = ratings.length > 0
        ? Math.round((ratings.reduce((acc, r) => acc + r.stars, 0) / ratings.length) * 10) / 10
        : null;

      setStats({
        sessions: sessions.length,
        totalMinutes: Math.round(totalSeconds / 60),
        avgRating,
      });
      setLoading(false);
    }
    load();
  }, []);

  return { stats, loading };
}
