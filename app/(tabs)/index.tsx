import { BottomNav } from '@/components/BottomNav';
import { TopicCard } from '@/components/TopicCard';
import { Bell, Briefcase, Heart, MessageSquare, Moon, Sparkles, Users } from 'lucide-react-native';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TOPICS = [
  {
    topic: 'mental-health',
    title: 'Mental Health',
    description: 'Anxiety, depression, stress and beyond',
    listeners: 24,
    Icon: Heart,
  },
  {
    topic: 'relationships',
    title: 'Relationships',
    description: 'Family, friends, dating and connection',
    listeners: 18,
    Icon: Users,
  },
  {
    topic: 'general-advice',
    title: 'General Advice',
    description: 'Life decisions and everyday challenges',
    listeners: 31,
    Icon: MessageSquare,
  },
  {
    topic: 'work-career',
    title: 'Work & Career',
    description: 'Burnout, growth, and finding direction',
    listeners: 12,
    Icon: Briefcase,
  },
  {
    topic: 'sleep-rest',
    title: 'Sleep & Rest',
    description: 'Late-night thoughts and wind-down talks',
    listeners: 9,
    Icon: Moon,
  },
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
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-5 pt-12 pb-5 flex-row items-start justify-between">
          <View>
            <Text style={{ fontSize: 12, letterSpacing: 1.4, color: '#9090aa', fontWeight: '500', textTransform: 'uppercase' }}>
              {getToday()}
            </Text>
            <Text style={{ fontFamily: 'Georgia', fontSize: 34, lineHeight: 38, fontWeight: '600', color: '#eeeef5', marginTop: 4 }}>
              {'Good to see\nyou again.'}
            </Text>
          </View>
          <TouchableOpacity
            className="h-10 w-10 rounded-full bg-surface border border-border items-center justify-center"
            style={{ marginTop: 4 }}
          >
            <Bell size={18} color="rgba(238,238,245,0.7)" strokeWidth={1.8} />
            <View className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary" />
          </TouchableOpacity>
        </View>

        {/* Hero CTA */}
        <View className="px-5">
          <TouchableOpacity
            className="rounded-2xl p-5 overflow-hidden"
            style={{ backgroundColor: '#6366f1' }}
            activeOpacity={0.85}
          >
            <View className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-full self-start mb-3"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
              <Sparkles size={12} color="#fff" />
              <Text style={{ fontSize: 11, fontWeight: '500', color: '#fff' }}>Available now</Text>
            </View>
            <Text style={{ fontFamily: 'Georgia', fontSize: 24, fontWeight: '600', color: '#fff', lineHeight: 30 }}>
              Start a quiet conversation
            </Text>
            <Text style={{ marginTop: 6, fontSize: 13.5, color: 'rgba(255,255,255,0.75)', lineHeight: 20, maxWidth: 280 }}>
              Connect anonymously with someone who'll really listen. No judgement, no records.
            </Text>
            <View className="mt-4 flex-row items-center gap-2">
              <Text style={{ fontSize: 13, fontWeight: '500', color: '#fff' }}>Begin now</Text>
              <View className="h-6 w-6 rounded-full items-center justify-center"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                <Text style={{ color: '#fff', fontSize: 14 }}>→</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Mood check-in */}
        <View className="mt-7">
          <Text style={{ fontFamily: 'Georgia', fontSize: 15, fontWeight: '600', color: '#eeeef5', marginBottom: 10, paddingHorizontal: 20 }}>
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
                className="flex-row items-center gap-2 px-3.5 py-2 rounded-xl bg-surface border border-border"
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 16 }}>{m.e}</Text>
                <Text style={{ fontSize: 13, fontWeight: '500', color: '#eeeef5' }}>{m.l}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Topics */}
        <View className="px-5 mt-7">
          <View className="flex-row items-baseline justify-between mb-3">
            <Text style={{ fontFamily: 'Georgia', fontSize: 15, fontWeight: '600', color: '#eeeef5' }}>
              Topics
            </Text>
            <Text style={{ fontSize: 12, color: '#9090aa' }}>{TOPICS.length} available</Text>
          </View>
          <View className="gap-2.5">
            {TOPICS.map((t) => (
              <TopicCard key={t.topic} {...t} />
            ))}
          </View>
        </View>

        {/* Reassurance footer */}
        <View className="px-5 mt-8 mb-2">
          <View className="rounded-xl bg-elevated border border-border p-4">
            <Text style={{ fontFamily: 'Georgia', fontStyle: 'italic', fontSize: 14, color: 'rgba(238,238,245,0.8)', textAlign: 'center', lineHeight: 22 }}>
              "You don't have to carry it alone."
            </Text>
          </View>
        </View>
      </ScrollView>

      <BottomNav active="Home" />
    </SafeAreaView>
  );
}
