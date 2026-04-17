import { BottomNav } from '@/components/BottomNav';
import { useTheme } from '@/hooks/useTheme';
import { Clock, Heart, MessageSquare, Star, TrendingUp, Users } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const iconMap: Record<string, LucideIcon> = {
  'Mental Health': Heart,
  'Relationships': Users,
  'General Advice': MessageSquare,
};

const SESSIONS = [
  { topic: 'Mental Health', preview: 'Thank you for listening. I feel much better now.', when: 'Today', duration: '24 min', rating: 5 },
  { topic: 'Relationships', preview: 'It was helpful to talk about my situation with someone who got it.', when: 'Yesterday', duration: '18 min', rating: 4 },
  { topic: 'General Advice', preview: 'Great advice on my career decision. Really helped me think clearly.', when: 'Mar 15', duration: '32 min', rating: 5 },
  { topic: 'Mental Health', preview: 'The session was okay but felt a bit rushed.', when: 'Mar 12', duration: '15 min', rating: 3 },
  { topic: 'Relationships', preview: 'Such a supportive listener. Helped me see things from a new angle.', when: 'Mar 10', duration: '28 min', rating: 5 },
] as const;

export default function HistoryScreen() {
  const t = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.background }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8 }}>

        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 48, paddingBottom: 20 }}>
          <Text style={{ fontSize: 12, letterSpacing: 1.4, color: t.mutedForeground, fontWeight: '500', textTransform: 'uppercase' }}>
            Your journey
          </Text>
          <Text style={{ fontFamily: 'Georgia', fontSize: 34, lineHeight: 38, fontWeight: '600', color: t.foreground, marginTop: 4 }}>
            History
          </Text>
        </View>

        {/* Summary card */}
        <View style={{ paddingHorizontal: 20 }}>
          <View style={{ borderRadius: 16, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, padding: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <TrendingUp size={14} color={t.primary} />
              <Text style={{ fontSize: 12, color: t.mutedForeground }}>Last 30 days</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              {[{ v: '12', l: 'Sessions' }, { v: '4.2', l: 'Avg rating' }, { v: '5h', l: 'Total time' }].map((s, i) => (
                <View
                  key={s.l}
                  style={[
                    { flex: 1, alignItems: 'center' },
                    i > 0 ? { borderLeftWidth: 1, borderLeftColor: t.border } : undefined,
                  ]}
                >
                  <Text style={{ fontFamily: 'Georgia', fontSize: 26, fontWeight: '600', color: t.foreground, lineHeight: 30 }}>
                    {s.v}
                  </Text>
                  <Text style={{ marginTop: 6, fontSize: 11.5, color: t.mutedForeground }}>{s.l}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Sessions list */}
        <View style={{ paddingHorizontal: 20, marginTop: 28 }}>
          <Text style={{ fontFamily: 'Georgia', fontSize: 15, fontWeight: '600', color: t.foreground, marginBottom: 12 }}>
            Conversations
          </Text>
          <View style={{ borderRadius: 12, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, overflow: 'hidden' }}>
            {SESSIONS.map((s, i) => {
              const Icon = iconMap[s.topic] ?? MessageSquare;
              return (
                <TouchableOpacity
                  key={i}
                  style={[
                    { padding: 16 },
                    i < SESSIONS.length - 1 ? { borderBottomWidth: 1, borderBottomColor: t.border } : undefined,
                  ]}
                  activeOpacity={0.7}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                    <View style={{ height: 40, width: 40, borderRadius: 12, backgroundColor: t.primarySoft, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={18} color={t.primary} strokeWidth={2} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                        <Text style={{ fontSize: 15, fontWeight: '600', color: t.foreground }}>{s.topic}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star key={idx} size={12} color={idx < s.rating ? t.primary : t.border}
                              fill={idx < s.rating ? t.primary : 'transparent'} />
                          ))}
                        </View>
                      </View>
                      <Text style={{ fontSize: 13.5, color: t.mutedForeground, lineHeight: 20 }} numberOfLines={2}>
                        {s.preview}
                      </Text>
                      <View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <Text style={{ fontSize: 11.5, color: t.mutedForeground }}>{s.when}</Text>
                        <View style={{ width: 2, height: 2, borderRadius: 1, backgroundColor: t.mutedForeground, opacity: 0.5 }} />
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Clock size={12} color={t.mutedForeground} />
                          <Text style={{ fontSize: 11.5, color: t.mutedForeground }}>{s.duration}</Text>
                        </View>
                      </View>
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
