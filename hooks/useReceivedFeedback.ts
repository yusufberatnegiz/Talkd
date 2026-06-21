import { getTopic } from '@/constants/topics';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export type TopicFeedback = {
  topicKey: string;
  topicLabel: string;
  hue: string;
  avgStars: number | null;
  ratingCount: number;
  badgeCount: number;
  topBadge: string | null;
};

export type RecentFeedback = {
  id: string;
  topicKey: string;
  topicLabel: string;
  hue: string;
  stars: number | null;
  badge: string | null;
};

interface TopicFeedbackRow {
  topic: string | null;
  avg_stars: number | null;
  rating_count: number | null;
  badge_count: number | null;
  listener_count: number | null;
  calm_count: number | null;
  supportive_count: number | null;
  present_count: number | null;
}

interface RecentFeedbackRow {
  feedback_id: string;
  topic: string | null;
  stars: number | null;
  badge: string | null;
}

const BADGE_LABELS: Record<string, string> = {
  listener: 'Good Listener',
  calm: 'Calm',
  supportive: 'Supportive',
  present: 'Present',
  unresponsive: 'Unresponsive',
  dismissive: 'Dismissive',
  unhelpful: 'Unhelpful',
  disconnected: 'Left too soon',
};

function roundRating(value: number | null): number | null {
  return value === null ? null : Math.round(value * 10) / 10;
}

function getTopBadge(row: TopicFeedbackRow): string | null {
  const entries = [
    { key: 'listener', count: row.listener_count ?? 0 },
    { key: 'calm', count: row.calm_count ?? 0 },
    { key: 'supportive', count: row.supportive_count ?? 0 },
    { key: 'present', count: row.present_count ?? 0 },
  ];
  const best = entries.reduce((current, next) => next.count > current.count ? next : current, entries[0]);
  return best.count > 0 ? BADGE_LABELS[best.key] : null;
}

export function formatFeedbackBadge(badge: string | null): string | null {
  return badge ? BADGE_LABELS[badge] ?? badge : null;
}

export function useReceivedFeedback() {
  const [byTopic, setByTopic] = useState<TopicFeedback[]>([]);
  const [recent, setRecent] = useState<RecentFeedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [topicRes, recentRes] = await Promise.all([
          supabase
            .from('received_rating_feedback_by_topic')
            .select('topic,avg_stars,rating_count,badge_count,listener_count,calm_count,supportive_count,present_count')
            .order('rating_count', { ascending: false }),
          supabase
            .from('received_rating_feedback_recent')
            .select('feedback_id,topic,stars,badge')
            .limit(5),
        ]);

        if (isCancelled) return;

        const topicRows = (topicRes.data ?? []) as TopicFeedbackRow[];
        const recentRows = (recentRes.data ?? []) as RecentFeedbackRow[];

        setByTopic(topicRows.map(row => {
          const topic = getTopic(row.topic ?? 'any');
          return {
            topicKey: topic.key,
            topicLabel: topic.label,
            hue: topic.hue,
            avgStars: roundRating(row.avg_stars),
            ratingCount: row.rating_count ?? 0,
            badgeCount: row.badge_count ?? 0,
            topBadge: getTopBadge(row),
          };
        }));

        setRecent(recentRows.map(row => {
          const topic = getTopic(row.topic ?? 'any');
          return {
            id: row.feedback_id,
            topicKey: topic.key,
            topicLabel: topic.label,
            hue: topic.hue,
            stars: row.stars,
            badge: formatFeedbackBadge(row.badge),
          };
        }));
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      isCancelled = true;
    };
  }, []);

  return { byTopic, recent, loading };
}
