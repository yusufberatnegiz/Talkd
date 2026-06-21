import { BottomNav } from '@/components/BottomNav';
import { formatFeedbackBadge, useReceivedFeedback } from '@/hooks/useReceivedFeedback';
import { useTheme } from '@/hooks/useTheme';
import { useUserStats } from '@/hooks/useUserStats';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = minutes / 60;
  return Number.isInteger(h) ? `${h}h` : `${h.toFixed(1)}h`;
}

export default function HistoryScreen() {
  const t = useTheme();
  const { stats, loading } = useUserStats();
  const { byTopic, recent, loading: feedbackLoading } = useReceivedFeedback();

  const dash = '—';
  const statRows = [
    { v: loading ? dash : String(stats.sessions), l: 'Sessions' },
    { v: loading ? dash : stats.avgRating !== null ? String(stats.avgRating) : dash, l: 'Avg rating' },
    { v: loading ? dash : formatTime(stats.totalMinutes), l: 'Total time' },
  ];
  const feedbackDash = '-';
  const hasFeedback = byTopic.length > 0 || recent.length > 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8 }}>

        {/* Header */}
        <View style={{ paddingHorizontal: 28, paddingTop: 48, paddingBottom: 20 }}>
          <Text style={{ fontSize: 11, letterSpacing: 2.2, color: t.ink4, textTransform: 'uppercase', marginBottom: 14 }}>
            Past sessions
          </Text>
          <Text style={{ fontFamily: 'Georgia', fontSize: 40, lineHeight: 44, letterSpacing: -0.8, color: t.ink }}>
            Session activity
          </Text>
        </View>

        {/* Summary card */}
        <View style={{ paddingHorizontal: 20 }}>
          <View style={{ borderRadius: 16, backgroundColor: t.bg3, borderWidth: 0.5, borderColor: t.line, padding: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 }}>
              <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: t.amber }} />
              <Text style={{ fontSize: 11, letterSpacing: 1.5, color: t.ink4, textTransform: 'uppercase' }}>Last 30 days</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              {statRows.map((s, i) => (
                <View
                  key={s.l}
                  style={[
                    { flex: 1, alignItems: 'center' },
                    i > 0 ? { borderLeftWidth: 0.5, borderLeftColor: t.line } : undefined,
                  ]}
                >
                  <Text style={{ fontFamily: 'Georgia', fontSize: 26, fontWeight: '600', color: t.ink, lineHeight: 30 }}>
                    {s.v}
                  </Text>
                  <Text style={{ marginTop: 6, fontSize: 11.5, color: t.ink3 }}>{s.l}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Rating feedback by category */}
        <View style={{ paddingHorizontal: 20, marginTop: 28 }}>
          <Text style={{ fontSize: 11, fontWeight: '600', letterSpacing: 1.4, color: t.ink4, textTransform: 'uppercase', marginBottom: 8, paddingLeft: 4 }}>
            By category
          </Text>
          {feedbackLoading ? (
            <View style={{ borderRadius: 12, backgroundColor: t.bg3, borderWidth: 0.5, borderColor: t.line, padding: 18 }}>
              <Text style={{ fontFamily: 'Georgia', fontStyle: 'italic', fontSize: 15, color: t.ink4, textAlign: 'center' }}>
                Loading feedback...
              </Text>
            </View>
          ) : byTopic.length > 0 ? (
            <View style={{ gap: 8 }}>
              {byTopic.map(item => (
                <View
                  key={item.topicKey}
                  style={{ borderRadius: 12, backgroundColor: t.bg3, borderWidth: 0.5, borderColor: t.line, padding: 14 }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: item.hue }} />
                    <Text style={{ flex: 1, fontSize: 14.5, fontWeight: '600', color: t.ink }}>
                      {item.topicLabel}
                    </Text>
                    <Text style={{ fontFamily: 'Georgia', fontSize: 18, fontWeight: '600', color: t.ink }}>
                      {item.avgStars !== null ? `${item.avgStars}/5` : feedbackDash}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
                    <Text style={{ fontSize: 12, color: t.ink4 }}>
                      {item.ratingCount} {item.ratingCount === 1 ? 'rating' : 'ratings'}
                    </Text>
                    {item.topBadge ? (
                      <Text style={{ fontSize: 12, color: t.ink3 }}>
                        Top badge: {item.topBadge}
                      </Text>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={{ borderRadius: 12, backgroundColor: t.bg3, borderWidth: 0.5, borderColor: t.line, padding: 18 }}>
              <Text style={{ fontFamily: 'Georgia', fontStyle: 'italic', fontSize: 15, color: t.ink4, textAlign: 'center' }}>
                Category ratings will appear after people rate your sessions.
              </Text>
            </View>
          )}
        </View>

        {/* Recent feedback */}
        <View style={{ paddingHorizontal: 20, marginTop: 28 }}>
          <Text style={{ fontSize: 11, fontWeight: '600', letterSpacing: 1.4, color: t.ink4, textTransform: 'uppercase', marginBottom: 8, paddingLeft: 4 }}>
            Recent anonymous feedback
          </Text>
          {feedbackLoading ? null : recent.length > 0 ? (
            <View style={{ borderRadius: 12, backgroundColor: t.bg3, borderWidth: 0.5, borderColor: t.line, overflow: 'hidden' }}>
              {recent.map((item, index) => {
                const badge = formatFeedbackBadge(item.badge);
                return (
                  <View
                    key={item.id}
                    style={[
                      { padding: 14 },
                      index < recent.length - 1 ? { borderBottomWidth: 0.5, borderBottomColor: t.line } : undefined,
                    ]}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: item.hue }} />
                      <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color: t.ink }}>
                        {item.topicLabel}
                      </Text>
                      <Text style={{ fontSize: 13, color: t.ink3 }}>
                        {item.stars !== null ? `${item.stars}/5` : feedbackDash}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 12, color: t.ink4, marginTop: 6 }}>
                      {badge ? `Badge: ${badge}` : 'No badge selected'}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={{ borderRadius: 12, backgroundColor: t.bg3, borderWidth: 0.5, borderColor: t.line, padding: 18 }}>
              <Text style={{ fontFamily: 'Georgia', fontStyle: 'italic', fontSize: 15, color: t.ink4, textAlign: 'center' }}>
                Recent feedback will appear here without names or exact session details.
              </Text>
            </View>
          )}
        </View>

        {!feedbackLoading && !hasFeedback && (
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, paddingTop: 28 }}>
            <Text style={{ fontSize: 12.5, color: t.ink5, textAlign: 'center', lineHeight: 18 }}>
              Ratings are grouped by topic so feedback stays anonymous.
            </Text>
          </View>
        )}
      </ScrollView>

      <BottomNav active="Activity" />
    </SafeAreaView>
  );
}
