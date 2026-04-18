import { BottomNav } from '@/components/BottomNav';
import { TOPICS } from '@/constants/topics';
import { useTheme } from '@/hooks/useTheme';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ListenerScreen() {
  const t = useTheme();
  const [online, setOnline] = useState(false);
  const [topicFilter, setTopicFilter] = useState<string[]>(['rel', 'advice', 'career']);

  const topicsArr = Object.values(TOPICS);

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

        {online && (
          <View style={{ paddingHorizontal: 40, paddingTop: 32, alignItems: 'center' }}>
            <Text style={{ fontFamily: 'Georgia', fontStyle: 'italic', fontSize: 16, color: t.ink3, textAlign: 'center' }}>
              waiting for someone on your wavelength…
            </Text>
          </View>
        )}

      </ScrollView>

      <BottomNav active="Talk" />
    </SafeAreaView>
  );
}
