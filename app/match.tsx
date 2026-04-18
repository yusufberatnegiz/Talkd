import { getTopic } from '@/constants/topics';
import { useTheme } from '@/hooks/useTheme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function RingSet({ hue, running }: { hue: string; running: boolean }) {
  const rings = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];

  useEffect(() => {
    const anims = rings.map((val, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 1000),
          Animated.timing(val, { toValue: 1, duration: 3200, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(val, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      )
    );
    if (running) anims.forEach(a => a.start());
    return () => anims.forEach(a => a.stop());
  }, [running]);

  return (
    <View style={{ width: 240, height: 240, alignItems: 'center', justifyContent: 'center' }}>
      {rings.map((val, i) => (
        <Animated.View key={i} style={{
          position: 'absolute', width: 110, height: 110, borderRadius: 55,
          borderWidth: 1, borderColor: hue,
          opacity: val.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 0.8, 0] }),
          transform: [{ scale: val.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.7] }) }],
        }} />
      ))}
      <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: hue, opacity: 0.6 }} />
      <View style={{ position: 'absolute', width: 9, height: 9, borderRadius: 4.5, backgroundColor: hue }} />
    </View>
  );
}

function FallbackScreen({ hue, specific, onBack }: { hue: string; specific: string; onBack: () => void }) {
  const t = useTheme();
  const [note, setNote] = useState(specific);
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
        <TouchableOpacity onPress={onBack} style={{ paddingHorizontal: 24, paddingTop: 12 }}>
          <Text style={{ fontSize: 13, color: t.ink3 }}>← Done</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 }}>
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: hue, marginBottom: 28 }} />
          <Text style={{ fontFamily: 'Georgia', fontStyle: 'italic', fontSize: 32, lineHeight: 38, letterSpacing: -0.3, color: t.ink, textAlign: 'center' }}>
            Your note is out there.
          </Text>
          <Text style={{ fontSize: 13.5, color: t.ink3, marginTop: 14, lineHeight: 20, textAlign: 'center', maxWidth: 280 }}>
            We'll nudge you the moment someone opens it.
          </Text>
          <View style={{
            marginTop: 30, padding: 16, backgroundColor: t.bg2,
            borderWidth: 0.5, borderColor: t.line, borderRadius: 16, maxWidth: 300,
          }}>
            <Text style={{ fontFamily: 'Georgia', fontStyle: 'italic', fontSize: 15, color: t.ink2 }}>
              "{note || 'Someone wanted to talk.'}"
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <TouchableOpacity onPress={onBack} style={{ paddingHorizontal: 24, paddingTop: 12 }}>
        <Text style={{ fontSize: 13, color: t.ink3 }}>← Keep looking</Text>
      </TouchableOpacity>
      <View style={{ paddingHorizontal: 28, paddingTop: 28, paddingBottom: 20 }}>
        <Text style={{ fontSize: 11, letterSpacing: 2.2, color: t.ink4, textTransform: 'uppercase', marginBottom: 14 }}>
          ASYNC FALLBACK
        </Text>
        <Text style={{ fontFamily: 'Georgia', fontSize: 34, lineHeight: 40, letterSpacing: -0.6, color: t.ink }}>
          Quiet right now.{'\n'}
          <Text style={{ fontStyle: 'italic', color: hue }}>Leave a note?</Text>
        </Text>
        <Text style={{ fontSize: 13, color: t.ink3, marginTop: 10, lineHeight: 19 }}>
          Write what's on your mind. When someone good comes online, we'll connect you both.
        </Text>
      </View>
      <View style={{ flex: 1, paddingHorizontal: 20 }}>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="what's going on…"
          placeholderTextColor={t.ink4}
          multiline
          style={{
            flex: 1, padding: 18, borderRadius: 20,
            backgroundColor: t.bg2, borderWidth: 0.5, borderColor: t.line,
            color: t.ink, fontFamily: 'Georgia', fontSize: 17, lineHeight: 24,
            textAlignVertical: 'top',
          }}
        />
      </View>
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 }}>
        <TouchableOpacity
          disabled={!note.trim()}
          onPress={() => setSent(true)}
          style={{
            paddingVertical: 16, borderRadius: 99, alignItems: 'center',
            backgroundColor: note.trim() ? hue : t.bg3,
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: '600', color: note.trim() ? t.bg : t.ink4 }}>
            Send into the quiet
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default function MatchScreen() {
  const t = useTheme();
  const router = useRouter();
  const { topic: topicParam, intent: intentParam, specific: specificParam } = useLocalSearchParams<{
    topic: string; intent: string; specific: string;
  }>();
  const tp = getTopic(topicParam ?? 'any');
  const intent = intentParam ?? 'chat';
  const specific = specificParam ?? '';

  const [phase, setPhase] = useState(0);
  const [secs, setSecs] = useState(0);
  const [fallback, setFallback] = useState(false);

  const intentLabel = {
    vent: 'to listen', advice: 'to give honest advice',
    think: 'to think with you', chat: 'to chat',
  }[intent] ?? 'to talk';

  const statusLine = ['looking for someone…', 'someone is here.', 'saying hello…'][phase] ?? '';

  useEffect(() => {
    const id = setInterval(() => setSecs(s => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (fallback) return;
    const t1 = setTimeout(() => setPhase(1), 3200);
    const t2 = setTimeout(() => setPhase(2), 5200);
    const t3 = setTimeout(() => {
      router.replace({ pathname: '/chat', params: { topic: tp.key, intent, specific } } as never);
    }, 6800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [fallback]);

  if (fallback) {
    return <FallbackScreen hue={tp.hue} specific={specific} onBack={() => setFallback(false)} />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      {/* Top row */}
      <View style={{ paddingHorizontal: 24, paddingTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{
          flexDirection: 'row', alignItems: 'center', gap: 6,
          paddingHorizontal: 11, paddingVertical: 5, borderRadius: 99,
          backgroundColor: tp.hue + '18', borderWidth: 0.5, borderColor: tp.hue + '44',
        }}>
          <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: tp.hue }} />
          <Text style={{ fontSize: 11, color: tp.hue, letterSpacing: 0.2 }}>{tp.label}</Text>
        </View>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <Text style={{ fontSize: 13, color: t.ink3 }}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {/* Rings */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <RingSet hue={tp.hue} running={phase < 2} />
      </View>

      {/* Status */}
      <View style={{ paddingHorizontal: 40, paddingBottom: 16, alignItems: 'center' }}>
        <Text style={{ fontSize: 10.5, letterSpacing: 2.4, color: t.ink4, textTransform: 'uppercase', marginBottom: 16 }}>
          Looking for someone {intentLabel}
        </Text>
        <Text style={{
          fontFamily: 'Georgia', fontStyle: 'italic', fontSize: 30, lineHeight: 36, letterSpacing: -0.3,
          color: phase === 1 ? tp.hue : t.ink, textAlign: 'center', minHeight: 72,
        }}>
          {statusLine}
        </Text>
        <Text style={{ marginTop: 20, fontSize: 12, color: t.ink4, letterSpacing: 0.3 }}>
          {phase < 2 ? `${secs}s · usually under 30s` : 'connecting securely…'}
        </Text>
        {secs > 15 && phase < 2 && (
          <TouchableOpacity
            onPress={() => setFallback(true)}
            style={{
              marginTop: 18, paddingVertical: 10, paddingHorizontal: 18,
              borderRadius: 99, borderWidth: 0.5, borderColor: t.lineStrong,
            }}
          >
            <Text style={{ fontSize: 12.5, color: t.ink2 }}>Taking a while — leave a note instead →</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Reassurance */}
      <View style={{
        marginHorizontal: 20, marginBottom: 30, padding: 14,
        backgroundColor: t.bg2, borderWidth: 0.5, borderColor: t.line,
        borderRadius: 16, flexDirection: 'row', gap: 12, alignItems: 'flex-start',
      }}>
        <View style={{ width: 16, height: 16, borderRadius: 8, borderWidth: 1.3, borderColor: tp.hue, marginTop: 2 }} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 12, fontWeight: '500', color: t.ink, letterSpacing: -0.1 }}>
            Neither of you will know who the other is.
          </Text>
          <Text style={{ fontSize: 11, color: t.ink3, marginTop: 2, lineHeight: 15 }}>
            10–15 min session · ends when the timer runs out · nothing saved
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
