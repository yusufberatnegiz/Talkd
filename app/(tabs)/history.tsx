import { BottomNav } from '@/components/BottomNav';
import { TOPICS } from '@/constants/topics';
import { useTheme } from '@/hooks/useTheme';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SESSIONS = [
  { topic: 'mh',     when: 'Today',     duration: '24 min', rating: 5 },
  { topic: 'rel',    when: 'Yesterday', duration: '18 min', rating: 4 },
  { topic: 'advice', when: 'Mar 15',    duration: '32 min', rating: 5 },
  { topic: 'mh',     when: 'Mar 12',    duration: '15 min', rating: 3 },
  { topic: 'rel',    when: 'Mar 10',    duration: '28 min', rating: 5 },
] as const;

export default function HistoryScreen() {
  const t = useTheme();

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
              {[{ v: '12', l: 'Sessions' }, { v: '4.2', l: 'Avg rating' }, { v: '5h', l: 'Total time' }].map((s, i) => (
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

        {/* Sessions list */}
        <View style={{ paddingHorizontal: 20, marginTop: 28 }}>
          <Text style={{ fontFamily: 'Georgia', fontSize: 15, color: t.ink, marginBottom: 12 }}>
            Conversations
          </Text>
          <View style={{ borderRadius: 16, backgroundColor: t.bg3, borderWidth: 0.5, borderColor: t.line, overflow: 'hidden' }}>
            {SESSIONS.map((s, i) => {
              const tp = TOPICS[s.topic as keyof typeof TOPICS] ?? TOPICS.any;
              return (
                <TouchableOpacity
                  key={i}
                  style={[
                    { padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
                    i < SESSIONS.length - 1 ? { borderBottomWidth: 0.5, borderBottomColor: t.line } : undefined,
                  ]}
                  activeOpacity={0.7}
                >
                  {/* Topic dot */}
                  <View style={{
                    width: 40, height: 40, borderRadius: 12,
                    backgroundColor: tp.hue + '18', borderWidth: 0.5, borderColor: tp.hue + '40',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: tp.hue }} />
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <Text style={{ fontFamily: 'Georgia', fontSize: 15, color: t.ink }}>{tp.label}</Text>
                      {/* Stars */}
                      <Text style={{ fontSize: 13, color: tp.hue, letterSpacing: 1 }}>
                        {'★'.repeat(s.rating)}{'☆'.repeat(5 - s.rating)}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <Text style={{ fontSize: 11.5, color: t.ink3 }}>{s.when}</Text>
                      <View style={{ width: 2, height: 2, borderRadius: 1, backgroundColor: t.ink4 }} />
                      <Text style={{ fontSize: 11.5, color: t.ink3 }}>{s.duration}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <BottomNav active="History" />
    </SafeAreaView>
  );
}
