import { BottomNav } from '@/components/BottomNav';
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

  const dash = '—';
  const statRows = [
    { v: loading ? dash : String(stats.sessions), l: 'Sessions' },
    { v: loading ? dash : stats.avgRating !== null ? String(stats.avgRating) : dash, l: 'Avg rating' },
    { v: loading ? dash : formatTime(stats.totalMinutes), l: 'Total time' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8 }}>

        {/* Header */}
        <View style={{ paddingHorizontal: 28, paddingTop: 48, paddingBottom: 20 }}>
          <Text style={{ fontSize: 11, letterSpacing: 2.2, color: t.ink4, textTransform: 'uppercase', marginBottom: 14 }}>
            Your journey
          </Text>
          <Text style={{ fontFamily: 'Georgia', fontSize: 40, lineHeight: 44, letterSpacing: -0.8, color: t.ink }}>
            History
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

        {/* Empty state */}
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 40 }}>
          <Text style={{ fontFamily: 'Georgia', fontStyle: 'italic', fontSize: 15, color: t.ink4, textAlign: 'center' }}>
            Your conversations will appear here.
          </Text>
        </View>
      </ScrollView>

      <BottomNav active="History" />
    </SafeAreaView>
  );
}
