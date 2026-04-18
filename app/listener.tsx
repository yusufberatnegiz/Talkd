import { BottomNav } from '@/components/BottomNav';
import { TOPICS } from '@/constants/topics';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MY_BADGES = [
  { label: 'Good Listener ×7', color: '#9AB39C' },
  { label: 'Calm ×4', color: '#B5A8D9' },
  { label: 'Supportive ×2', color: '#E8B57A' },
];

const INCOMING = {
  topic: 'rel',
  intent: 'advice',
  first: "I think I should break up with him but everyone thinks he's perfect. I don't know if I'm being dramatic.",
  waited: '42 seconds',
};

export default function ListenerScreen() {
  const t = useTheme();
  const router = useRouter();
  const [online, setOnline] = useState(false);
  const [topicFilter, setTopicFilter] = useState<string[]>(['rel', 'advice', 'career']);
  const [showIncoming, setShowIncoming] = useState(false);

  const topicsArr = Object.values(TOPICS);
  const incomingTopic = TOPICS[INCOMING.topic as keyof typeof TOPICS] ?? TOPICS.any;

  useEffect(() => {
    if (!online) { setShowIncoming(false); return; }
    const id = setTimeout(() => setShowIncoming(true), 2200);
    return () => clearTimeout(id);
  }, [online]);

  const toggleTopic = (k: string) => {
    setTopicFilter(tf => tf.includes(k) ? tf.filter(x => x !== k) : [...tf, k]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 8 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top bar */}
        <View style={{ paddingHorizontal: 24, paddingTop: 14, flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontFamily: 'Georgia', fontStyle: 'italic', fontSize: 18, color: t.ink3 }}>
            talkd · listener
          </Text>
          <Text style={{ fontSize: 11, color: t.ink4, letterSpacing: 1.5, textTransform: 'uppercase' }}>
            Your badges: 3
          </Text>
        </View>

        {/* Headline */}
        <View style={{ paddingHorizontal: 28, paddingTop: 40, paddingBottom: 20 }}>
          <Text style={{ fontSize: 11, letterSpacing: 2.2, color: t.ink4, textTransform: 'uppercase', marginBottom: 14 }}>
            Tonight you are
          </Text>
          <Text style={{ fontFamily: 'Georgia', fontSize: 42, lineHeight: 46, letterSpacing: -0.7, color: t.ink }}>
            {online ? (
              <Text>
                <Text style={{ fontStyle: 'italic', color: t.amber }}>on duty.</Text>
                {'\n'}ready to listen.
              </Text>
            ) : (
              <Text>
                <Text style={{ color: t.ink3 }}>off duty.</Text>
                {'\nready when\nyou are.'}
              </Text>
            )}
          </Text>

          <TouchableOpacity
            onPress={() => setOnline(o => !o)}
            style={{
              marginTop: 24, paddingVertical: 13, paddingHorizontal: 22,
              borderRadius: 99,
              backgroundColor: online ? t.amber : 'transparent',
              borderWidth: online ? 0 : 1, borderColor: t.lineStrong,
              alignSelf: 'flex-start',
              flexDirection: 'row', alignItems: 'center', gap: 10,
            }}
            activeOpacity={0.85}
          >
            {online && <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: t.bg }} />}
            <Text style={{ fontSize: 14, fontWeight: '500', color: online ? t.bg : t.ink }}>
              {online ? 'Live — tap to pause' : 'Go on duty'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Topic filter */}
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={{ fontSize: 11, letterSpacing: 2, color: t.ink4, textTransform: 'uppercase', marginBottom: 10, paddingLeft: 4 }}>
            Match me with
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {topicsArr.map(tp => {
              const active = topicFilter.includes(tp.key);
              return (
                <TouchableOpacity
                  key={tp.key}
                  onPress={() => toggleTopic(tp.key)}
                  style={{
                    paddingVertical: 7, paddingHorizontal: 12, borderRadius: 99,
                    backgroundColor: active ? tp.hue + '28' : 'transparent',
                    borderWidth: active ? 1 : 0.5,
                    borderColor: active ? tp.hue + '80' : t.lineStrong,
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={{ fontSize: 12, color: active ? tp.hue : t.ink2 }}>{tp.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Incoming card */}
        {online && showIncoming && (
          <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
            <View style={{
              backgroundColor: t.bg3, borderWidth: 1, borderColor: incomingTopic.hue + '40',
              borderRadius: 24, padding: 22, overflow: 'hidden',
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: incomingTopic.hue }} />
                <Text style={{ fontSize: 11, letterSpacing: 1.8, color: incomingTopic.hue, textTransform: 'uppercase', fontWeight: '500' }}>
                  {incomingTopic.label} · wants honest advice
                </Text>
              </View>
              <Text style={{ fontFamily: 'Georgia', fontStyle: 'italic', fontSize: 20, color: t.ink, lineHeight: 26, letterSpacing: -0.1, marginBottom: 14 }}>
                "{INCOMING.first}"
              </Text>
              <View style={{ flexDirection: 'row', gap: 14, marginBottom: 20 }}>
                <Text style={{ fontSize: 11.5, color: t.ink3 }}>waited {INCOMING.waited}</Text>
                <Text style={{ fontSize: 11.5, color: t.ink4 }}>·</Text>
                <Text style={{ fontSize: 11.5, color: t.ink3 }}>~15 min session</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  onPress={() => setShowIncoming(false)}
                  style={{
                    flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center',
                    borderWidth: 0.5, borderColor: t.line,
                  }}
                >
                  <Text style={{ fontSize: 14, color: t.ink3 }}>Pass</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push({ pathname: '/chat', params: { topic: incomingTopic.key, intent: INCOMING.intent, specific: INCOMING.first } } as never)}
                  style={{
                    flex: 2, paddingVertical: 14, borderRadius: 14, alignItems: 'center',
                    backgroundColor: incomingTopic.hue,
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '600', color: t.bg }}>Say hello</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {online && !showIncoming && (
          <View style={{ paddingHorizontal: 40, paddingTop: 32, alignItems: 'center' }}>
            <Text style={{ fontFamily: 'Georgia', fontStyle: 'italic', fontSize: 16, color: t.ink3, textAlign: 'center' }}>
              waiting for someone on your wavelength…
            </Text>
          </View>
        )}

        {/* Badges when offline */}
        {!online && (
          <View style={{ paddingHorizontal: 20, paddingTop: 28 }}>
            <Text style={{ fontSize: 11, letterSpacing: 2, color: t.ink4, textTransform: 'uppercase', marginBottom: 12, paddingLeft: 4 }}>
              Your badges
            </Text>
            <View style={{
              backgroundColor: t.bg2, borderWidth: 0.5, borderColor: t.line,
              borderRadius: 20, padding: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 8,
            }}>
              {MY_BADGES.map(b => (
                <View key={b.label} style={{
                  flexDirection: 'row', alignItems: 'center', gap: 5,
                  paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99,
                  backgroundColor: b.color + '22', borderWidth: 0.5, borderColor: b.color + '44',
                }}>
                  <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: b.color }} />
                  <Text style={{ fontSize: 11.5, color: b.color, fontWeight: '500' }}>{b.label}</Text>
                </View>
              ))}
            </View>
            <Text style={{ fontFamily: 'Georgia', fontStyle: 'italic', fontSize: 11.5, color: t.ink4, marginTop: 12, paddingLeft: 4, lineHeight: 17 }}>
              Badges unlock topic priorities and a verified listener filter for premium talkers.
            </Text>
          </View>
        )}
      </ScrollView>

      <BottomNav active="Talk" />
    </SafeAreaView>
  );
}
