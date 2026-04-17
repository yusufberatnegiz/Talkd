import { BottomNav } from '@/components/BottomNav';
import { TopicCard } from '@/components/TopicCard';
import { useTheme } from '@/hooks/useTheme';
import { Bell, Briefcase, Heart, MessageSquare, Moon, Sparkles, Users } from 'lucide-react-native';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TOPICS = [
  { topic: 'mental-health', title: 'Mental Health', description: 'Anxiety, depression, stress and beyond', listeners: 24, Icon: Heart },
  { topic: 'relationships', title: 'Relationships', description: 'Family, friends, dating and connection', listeners: 18, Icon: Users },
  { topic: 'general-advice', title: 'General Advice', description: 'Life decisions and everyday challenges', listeners: 31, Icon: MessageSquare },
  { topic: 'work-career', title: 'Work & Career', description: 'Burnout, growth, and finding direction', listeners: 12, Icon: Briefcase },
  { topic: 'sleep-rest', title: 'Sleep & Rest', description: 'Late-night thoughts and wind-down talks', listeners: 9, Icon: Moon },
] as const;

const MOODS = [
  { e: '🌿', l: 'Calm' },
  { e: '🌧️', l: 'Low' },
  { e: '😰', l: 'Anxious' },
  { e: '🔥', l: 'Angry' },
  { e: '✨', l: 'Hopeful' },
  { e: '😴', l: 'Tired' },
];

function getToday() {
  const d = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
}

export default function HomeScreen() {
  const t = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 48, paddingBottom: 20, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ fontSize: 12, letterSpacing: 1.4, color: t.mutedForeground, fontWeight: '500', textTransform: 'uppercase' }}>
              {getToday()}
            </Text>
            <Text style={{ fontFamily: 'Georgia', fontSize: 34, lineHeight: 38, fontWeight: '600', color: t.foreground, marginTop: 4 }}>
              {'Good to see\nyou again.'}
            </Text>
          </View>
          <TouchableOpacity
            style={{
              height: 40, width: 40, borderRadius: 20,
              backgroundColor: t.surface, borderWidth: 1, borderColor: t.border,
              alignItems: 'center', justifyContent: 'center', marginTop: 4,
            }}
          >
            <Bell size={18} color={t.foreground} strokeWidth={1.8} style={{ opacity: 0.7 }} />
            <View style={{ position: 'absolute', top: 8, right: 8, width: 6, height: 6, borderRadius: 3, backgroundColor: t.primary }} />
          </TouchableOpacity>
        </View>

        {/* Hero CTA */}
        <View style={{ paddingHorizontal: 20 }}>
          <TouchableOpacity
            style={{ borderRadius: 16, padding: 20, backgroundColor: t.primary, overflow: 'hidden' }}
            activeOpacity={0.85}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.15)', alignSelf: 'flex-start', marginBottom: 12 }}>
              <Sparkles size={12} color={t.primaryForeground} />
              <Text style={{ fontSize: 11, fontWeight: '500', color: t.primaryForeground }}>Available now</Text>
            </View>
            <Text style={{ fontFamily: 'Georgia', fontSize: 24, fontWeight: '600', color: t.primaryForeground, lineHeight: 30 }}>
              Start a quiet conversation
            </Text>
            <Text style={{ marginTop: 6, fontSize: 13.5, color: t.primaryForeground, opacity: 0.75, lineHeight: 20, maxWidth: 280 }}>
              Connect anonymously with someone who'll really listen. No judgement, no records.
            </Text>
            <View style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 13, fontWeight: '500', color: t.primaryForeground }}>Begin now</Text>
              <View style={{ height: 24, width: 24, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: t.primaryForeground, fontSize: 14 }}>→</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Mood check-in */}
        <View style={{ marginTop: 28 }}>
          <Text style={{ fontFamily: 'Georgia', fontSize: 15, fontWeight: '600', color: t.foreground, marginBottom: 10, paddingHorizontal: 20 }}>
            How are you feeling?
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
          >
            {MOODS.map((m) => (
              <TouchableOpacity
                key={m.l}
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: 8,
                  paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12,
                  backgroundColor: t.surface, borderWidth: 1, borderColor: t.border,
                }}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 16 }}>{m.e}</Text>
                <Text style={{ fontSize: 13, fontWeight: '500', color: t.foreground }}>{m.l}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Topics */}
        <View style={{ paddingHorizontal: 20, marginTop: 28 }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ fontFamily: 'Georgia', fontSize: 15, fontWeight: '600', color: t.foreground }}>
              Topics
            </Text>
            <Text style={{ fontSize: 12, color: t.mutedForeground }}>{TOPICS.length} available</Text>
          </View>
          <View style={{ gap: 10 }}>
            {TOPICS.map((topic) => (
              <TopicCard key={topic.topic} {...topic} />
            ))}
          </View>
        </View>

        {/* Reassurance footer */}
        <View style={{ paddingHorizontal: 20, marginTop: 32, marginBottom: 8 }}>
          <View style={{ borderRadius: 12, backgroundColor: t.elevated, borderWidth: 1, borderColor: t.border, padding: 16 }}>
            <Text style={{ fontFamily: 'Georgia', fontStyle: 'italic', fontSize: 14, color: t.foreground, textAlign: 'center', lineHeight: 22, opacity: 0.8 }}>
              "You don't have to carry it alone."
            </Text>
          </View>
        </View>
      </ScrollView>

      <BottomNav active="Home" />
    </SafeAreaView>
  );
}
