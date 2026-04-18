import { getTopic } from '@/constants/topics';
import { useTheme } from '@/hooks/useTheme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const INTENTS = [
  { k: 'vent',   title: 'I need to vent',           sub: "Someone who won't interrupt" },
  { k: 'advice', title: 'I want honest advice',      sub: 'Tell me what you actually think' },
  { k: 'think',  title: 'Help me think it through',  sub: 'Questions, not answers' },
  { k: 'chat',   title: 'Just want to chat',         sub: 'No pressure, no agenda' },
] as const;

type IntentKey = typeof INTENTS[number]['k'];

const EXAMPLES: Record<string, string[]> = {
  rel:    ['Just got broken up with', 'My partner doesn\'t hear me', 'Crush thing'],
  career: ['Offer decision', 'Thinking of quitting', 'Stuck in final year'],
  mh:     ['Anxious all week', 'Low mood again', "Can't turn my brain off"],
  night:  ["Can't sleep", 'Thinking too much', '3am spiral'],
  advice: ['Family drama', 'Roommate issue', 'Should I move'],
  any:    ['Something weird happened', 'Just a day', 'No topic, just talk'],
};

export default function IntentScreen() {
  const t = useTheme();
  const router = useRouter();
  const { topic: topicParam } = useLocalSearchParams<{ topic: string }>();
  const tp = getTopic(topicParam ?? 'any');

  const [intent, setIntent] = useState<IntentKey | null>(null);
  const [specific, setSpecific] = useState('');

  const examples = EXAMPLES[tp.key] ?? EXAMPLES.any;
  const placeholder = `e.g. "${examples[0]}"`;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 4, flexDirection: 'row', alignItems: 'center', gap: 6 }}
        >
          <Text style={{ fontSize: 18, color: t.ink3 }}>←</Text>
          <Text style={{ fontSize: 13, color: t.ink3 }}>Back</Text>
        </TouchableOpacity>

        {/* Topic chip */}
        <View style={{ paddingHorizontal: 28, paddingTop: 20, paddingBottom: 8 }}>
          <View style={{
            alignSelf: 'flex-start',
            flexDirection: 'row', alignItems: 'center', gap: 6,
            paddingHorizontal: 12, paddingVertical: 6,
            borderRadius: 99, backgroundColor: tp.hue + '18', borderWidth: 0.5, borderColor: tp.hue + '44',
          }}>
            <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: tp.hue }} />
            <Text style={{ fontSize: 11.5, color: tp.hue, letterSpacing: 0.2 }}>{tp.label}</Text>
          </View>
        </View>

        {/* Headline */}
        <View style={{ paddingHorizontal: 28, paddingBottom: 24 }}>
          <Text style={{ fontFamily: 'Georgia', fontSize: 36, lineHeight: 40, letterSpacing: -0.6, color: t.ink }}>
            {'What do you want\n'}
            <Text style={{ fontStyle: 'italic', color: t.amber }}>out of this?</Text>
          </Text>
          <Text style={{ fontSize: 13, color: t.ink3, marginTop: 10, lineHeight: 18 }}>
            Helps us find someone on the same wavelength.
          </Text>
        </View>

        {/* Intent options */}
        <View style={{ paddingHorizontal: 20, gap: 6 }}>
          {INTENTS.map((it) => {
            const active = intent === it.k;
            return (
              <TouchableOpacity
                key={it.k}
                onPress={() => setIntent(it.k)}
                style={{
                  backgroundColor: active ? t.amberSoft : t.bg3,
                  borderWidth: active ? 1 : 0.5,
                  borderColor: active ? t.amber + '60' : t.line,
                  borderRadius: 16, padding: 14,
                  flexDirection: 'row', alignItems: 'center', gap: 12,
                }}
                activeOpacity={0.8}
              >
                <View style={{
                  width: 18, height: 18, borderRadius: 9,
                  borderWidth: 1.5, borderColor: active ? t.amber : t.ink5,
                  backgroundColor: active ? t.amber : 'transparent',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  {active && <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: t.bg }} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: 'Georgia', fontSize: 19, letterSpacing: -0.2, lineHeight: 23, color: t.ink }}>
                    {it.title}
                  </Text>
                  <Text style={{ fontSize: 12, color: t.ink3, marginTop: 1 }}>{it.sub}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Optional one-liner */}
        <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
          <Text style={{ fontSize: 11, letterSpacing: 1.8, color: t.ink4, textTransform: 'uppercase', marginBottom: 8, paddingLeft: 4 }}>
            One line about it (optional)
          </Text>
          <TextInput
            value={specific}
            onChangeText={setSpecific}
            placeholder={placeholder}
            placeholderTextColor={t.ink4}
            style={{
              width: '100%', padding: 14, borderRadius: 14,
              backgroundColor: t.bg2, borderWidth: 0.5, borderColor: t.line,
              color: t.ink, fontFamily: 'Georgia', fontSize: 15,
            }}
          />
          <Text style={{ fontSize: 11, color: t.ink4, marginTop: 6, paddingLeft: 4, lineHeight: 15 }}>
            Specific beats vague. "Just got broken up with" finds a better match than "relationships."
          </Text>
        </View>

        {/* CTA */}
        <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
          <TouchableOpacity
            disabled={!intent}
            onPress={() => router.push({ pathname: '/match', params: { topic: tp.key, intent: intent ?? '', specific } } as never)}
            style={{
              paddingVertical: 16, borderRadius: 99, alignItems: 'center',
              backgroundColor: intent ? t.amber : t.bg3,
            }}
            activeOpacity={0.85}
          >
            <Text style={{ fontSize: 15, fontWeight: '600', letterSpacing: -0.1, color: intent ? t.bg : t.ink4 }}>
              {intent ? 'Find someone now' : 'Pick one above'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
