import { getTopic } from '@/constants/topics';
import { useTheme } from '@/hooks/useTheme';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const POSITIVE_BADGES = [
  { k: 'listener',   label: 'Good Listener', color: '#9AB39C' },
  { k: 'calm',       label: 'Calm',          color: '#B5A8D9' },
  { k: 'supportive', label: 'Supportive',    color: '#E8B57A' },
  { k: 'present',    label: 'Present',       color: '#E89A8A' },
] as const;

const NEGATIVE_BADGES = [
  { k: 'unresponsive', label: 'Unresponsive',      color: '#D97757' },
  { k: 'dismissive',   label: 'Dismissive',        color: '#D97757' },
  { k: 'unhelpful',    label: 'Unhelpful',          color: '#B5A8D9' },
  { k: 'disconnected', label: 'Left too soon',      color: '#9AB39C' },
] as const;

const STAR_LABELS = ['', 'Not great', 'Okay', 'Good', 'Really helpful', 'The best'];

export default function RatingScreen() {
  const t = useTheme();
  const { topic: topicParam } = useLocalSearchParams<{ topic?: string }>();
  const tp = getTopic(topicParam ?? 'any');

  const [stars, setStars] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const isPositive = stars >= 3;
  const badges = stars === 0 ? POSITIVE_BADGES : isPositive ? POSITIVE_BADGES : NEGATIVE_BADGES;

  // Clear badge when polarity flips
  useEffect(() => {
    setPicked(null);
  }, [isPositive]);

  const handleStars = (n: number) => {
    setStars(n);
  };

  if (submitted) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: t.bg, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: tp.hue + '22', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
          <Text style={{ fontSize: 44, color: tp.hue }}>✓</Text>
        </View>
        <Text style={{ fontFamily: 'Georgia', fontStyle: 'italic', fontSize: 30, color: t.ink, textAlign: 'center', marginBottom: 8 }}>
          Thank you.
        </Text>
        <Text style={{ fontSize: 14, color: t.ink3, textAlign: 'center', lineHeight: 22 }}>
          Your feedback helps good people stay on talkd.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView
        style={{ flex: 1, paddingHorizontal: 20 }}
        contentContainerStyle={{ paddingTop: 28, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ paddingHorizontal: 8, paddingBottom: 16 }}>
          <Text style={{ fontSize: 11, letterSpacing: 2.2, color: t.ink4, textTransform: 'uppercase', marginBottom: 14 }}>
            Conversation ended
          </Text>
          <Text style={{ fontFamily: 'Georgia', fontSize: 38, lineHeight: 42, letterSpacing: -0.6, color: t.ink }}>
            {'How was '}
            <Text style={{ fontStyle: 'italic', color: tp.hue }}>it?</Text>
          </Text>
          <Text style={{ fontSize: 13, color: t.ink3, marginTop: 10, lineHeight: 19 }}>
            Rate the listener and pick one badge. Your rating stays anonymous — it just helps good people stay on talkd.
          </Text>
        </View>

        {/* Stars */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4, paddingTop: 20, paddingBottom: 12 }}>
          {[1, 2, 3, 4, 5].map(n => {
            const active = stars >= n;
            return (
              <TouchableOpacity
                key={n}
                onPress={() => handleStars(n)}
                style={{ width: 52, height: 52, alignItems: 'center', justifyContent: 'center' }}
                activeOpacity={0.7}
              >
                <View style={{
                  width: 40, height: 40, borderRadius: 20,
                  backgroundColor: active ? tp.hue + '22' : t.bg3,
                  borderWidth: active ? 1 : 0.5,
                  borderColor: active ? tp.hue + '80' : t.lineStrong,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text style={{ fontSize: 20, color: active ? tp.hue : t.ink4 }}>★</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={{
          textAlign: 'center', fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase',
          color: stars > 0 ? tp.hue : t.ink4, marginBottom: 28,
        }}>
          {stars === 0 ? 'Tap to rate' : STAR_LABELS[stars]}
        </Text>

        {/* Badges */}
        <Text style={{ fontSize: 11, letterSpacing: 1.8, color: t.ink4, textTransform: 'uppercase', marginBottom: 10, paddingLeft: 4 }}>
          {stars > 0 ? (isPositive ? 'What made it good?' : 'What went wrong?') : 'Pick one badge'}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 24 }}>
          {badges.map(b => {
            const active = picked === b.k;
            return (
              <TouchableOpacity
                key={b.k}
                onPress={() => setPicked(b.k)}
                style={{
                  width: '48%', padding: 14, borderRadius: 14,
                  backgroundColor: active ? b.color + '20' : t.bg3,
                  borderWidth: active ? 1 : 0.5,
                  borderColor: active ? b.color + '70' : t.line,
                  flexDirection: 'row', alignItems: 'center', gap: 10,
                }}
                activeOpacity={0.8}
              >
                <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: b.color }} />
                <Text style={{ fontFamily: 'Georgia', fontSize: 16, letterSpacing: -0.1, color: active ? b.color : t.ink }}>
                  {b.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Private note */}
        <Text style={{ fontSize: 11, letterSpacing: 1.8, color: t.ink4, textTransform: 'uppercase', marginBottom: 8, paddingLeft: 4 }}>
          Note for yourself (private)
        </Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="What do you want to remember…"
          placeholderTextColor={t.ink4}
          multiline
          style={{
            minHeight: 64, padding: 14, borderRadius: 14,
            backgroundColor: t.bg2, borderWidth: 0.5, borderColor: t.line,
            color: t.ink, fontFamily: 'Georgia', fontStyle: 'italic', fontSize: 14,
            textAlignVertical: 'top', marginBottom: 24,
          }}
        />

        {/* Submit */}
        <TouchableOpacity
          onPress={() => setSubmitted(true)}
          style={{ paddingVertical: 16, borderRadius: 99, alignItems: 'center', backgroundColor: t.amber }}
          activeOpacity={0.85}
        >
          <Text style={{ fontSize: 14.5, fontWeight: '600', color: t.bg, letterSpacing: -0.1 }}>
            {stars || picked ? 'Send & close' : 'Skip & close'}
          </Text>
        </TouchableOpacity>
        <Text style={{ textAlign: 'center', fontSize: 10.5, color: t.ink5, marginTop: 10, letterSpacing: 0.4 }}>
          THEY'RE RATING YOU TOO. NEITHER OF YOU SEES THE OTHER'S RATING.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
