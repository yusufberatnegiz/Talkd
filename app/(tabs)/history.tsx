import { BottomNav } from '@/components/BottomNav';
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
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8 }}>

        {/* Header */}
        <View className="px-5 pt-12 pb-5">
          <Text style={{ fontSize: 12, letterSpacing: 1.4, color: '#9090aa', fontWeight: '500', textTransform: 'uppercase' }}>
            Your journey
          </Text>
          <Text style={{ fontFamily: 'Georgia', fontSize: 34, lineHeight: 38, fontWeight: '600', color: '#eeeef5', marginTop: 4 }}>
            History
          </Text>
        </View>

        {/* Summary card */}
        <View className="px-5">
          <View className="rounded-2xl bg-surface border border-border p-5">
            <View className="flex-row items-center gap-2 mb-3">
              <TrendingUp size={14} color="#6366f1" />
              <Text style={{ fontSize: 12, color: '#9090aa' }}>Last 30 days</Text>
            </View>
            <View className="flex-row">
              {[{ v: '12', l: 'Sessions' }, { v: '4.2', l: 'Avg rating' }, { v: '5h', l: 'Total time' }].map((s, i) => (
                <View
                  key={s.l}
                  className="flex-1 items-center"
                  style={i > 0 ? { borderLeftWidth: 1, borderLeftColor: '#2e2e4a' } : undefined}
                >
                  <Text style={{ fontFamily: 'Georgia', fontSize: 26, fontWeight: '600', color: '#eeeef5', lineHeight: 30 }}>
                    {s.v}
                  </Text>
                  <Text style={{ marginTop: 6, fontSize: 11.5, color: '#9090aa' }}>{s.l}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Sessions list */}
        <View className="px-5 mt-7">
          <Text style={{ fontFamily: 'Georgia', fontSize: 15, fontWeight: '600', color: '#eeeef5', marginBottom: 12 }}>
            Conversations
          </Text>
          <View className="rounded-xl bg-surface border border-border overflow-hidden">
            {SESSIONS.map((s, i) => {
              const Icon = iconMap[s.topic] ?? MessageSquare;
              return (
                <TouchableOpacity
                  key={i}
                  className="p-4"
                  style={i < SESSIONS.length - 1 ? { borderBottomWidth: 1, borderBottomColor: '#2e2e4a' } : undefined}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-start gap-3">
                    <View className="h-10 w-10 rounded-xl bg-primary-soft items-center justify-center flex-shrink-0">
                      <Icon size={18} color="#6366f1" strokeWidth={2} />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center justify-between gap-2 mb-1">
                        <Text style={{ fontSize: 15, fontWeight: '600', color: '#eeeef5' }}>{s.topic}</Text>
                        <View className="flex-row items-center">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star
                              key={idx}
                              size={12}
                              color={idx < s.rating ? '#6366f1' : 'rgba(144,144,170,0.3)'}
                              fill={idx < s.rating ? '#6366f1' : 'transparent'}
                            />
                          ))}
                        </View>
                      </View>
                      <Text style={{ fontSize: 13.5, color: '#9090aa', lineHeight: 20 }} numberOfLines={2}>
                        {s.preview}
                      </Text>
                      <View className="mt-2.5 flex-row items-center gap-3">
                        <Text style={{ fontSize: 11.5, color: '#9090aa' }}>{s.when}</Text>
                        <View className="w-0.5 h-0.5 rounded-full bg-muted-foreground" />
                        <View className="flex-row items-center gap-1">
                          <Clock size={12} color="#9090aa" />
                          <Text style={{ fontSize: 11.5, color: '#9090aa' }}>{s.duration}</Text>
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
