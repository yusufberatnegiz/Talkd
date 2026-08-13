import { TopicIcon } from '@/components/TopicIcon';
import { MATCH_TIMEOUT_MS } from '@/constants/config';
import { getTopic } from '@/constants/topics';
import { useTheme } from '@/hooks/useTheme';
import { cancelMatchQueue, findOrCreateMatch } from '@/lib/matching';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function RingSet({ hue, running }: { hue: string; running: boolean }) {
  const rings = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  useEffect(() => {
    const anims = rings.map((val, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 1000),
          Animated.timing(val, {
            toValue: 1,
            duration: 3200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(val, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]),
      ),
    );
    if (running) anims.forEach(a => a.start());
    return () => anims.forEach(a => a.stop());
  }, [running]);

  return (
    <View style={{ width: 240, height: 240, alignItems: 'center', justifyContent: 'center' }}>
      {rings.map((val, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            width: 110,
            height: 110,
            borderRadius: 55,
            borderWidth: 1,
            borderColor: hue,
            opacity: val.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 0.8, 0] }),
            transform: [{ scale: val.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.7] }) }],
          }}
        />
      ))}
      <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: hue, opacity: 0.6 }} />
      <View style={{ position: 'absolute', width: 9, height: 9, borderRadius: 4.5, backgroundColor: hue }} />
    </View>
  );
}

function FallbackScreen({ hue, specific, onBack }: { hue: string; specific: string; onBack: () => void }) {
  const t = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 36 }}>
        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: hue, marginBottom: 28 }} />
        <Text style={{ fontFamily: 'Georgia', fontStyle: 'italic', fontSize: 34, lineHeight: 40, color: t.ink, textAlign: 'center' }}>
          Quiet right now.
        </Text>
        <Text style={{ fontSize: 13.5, color: t.ink3, marginTop: 14, lineHeight: 20, textAlign: 'center', maxWidth: 290 }}>
          We couldn&apos;t find a compatible person this time. Nothing was sent or saved.
        </Text>
        {!!specific && (
          <View style={{ marginTop: 24, padding: 14, borderRadius: 8, backgroundColor: t.bg2, borderWidth: 0.5, borderColor: t.line, maxWidth: 300 }}>
            <Text numberOfLines={3} style={{ fontSize: 13, lineHeight: 19, color: t.ink2 }}>
              &quot;{specific}&quot;
            </Text>
          </View>
        )}
        <TouchableOpacity
          onPress={onBack}
          style={{ marginTop: 30, minWidth: 180, paddingVertical: 15, borderRadius: 99, alignItems: 'center', backgroundColor: hue }}
          activeOpacity={0.85}
        >
          <Text style={{ fontSize: 14.5, fontWeight: '600', color: t.onAccent }}>Keep looking</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.replace('/(tabs)')}
          style={{ marginTop: 10, paddingVertical: 14, paddingHorizontal: 32 }}
          activeOpacity={0.85}
        >
          <Text style={{ fontSize: 14, fontWeight: '500', color: t.ink3 }}>Go home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default function MatchScreen() {
  const t = useTheme();
  const router = useRouter();
  const { topic: topicParam, intent: intentParam, specific: specificParam } = useLocalSearchParams<{
    topic: string;
    intent: string;
    specific: string;
  }>();
  const tp = getTopic(topicParam ?? 'any');
  const intent = intentParam ?? 'chat';
  const specific = specificParam ?? '';

  const [secs, setSecs] = useState(0);
  const [queueType, setQueueType] = useState<'listener' | 'talker'>('listener');
  const [showOptions, setShowOptions] = useState(false);
  const [fallback, setFallback] = useState(false);
  const [pollKey, setPollKey] = useState(0);
  const [matchError, setMatchError] = useState<string | null>(null);
  const [matchedUi, setMatchedUi] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const matchedRef = useRef(false);
  const cancellingRef = useRef(false);

  const intentLabel = {
    vent: 'to listen',
    advice: 'to give honest advice',
    think: 'to think with you',
    chat: 'to chat',
  }[intent] ?? 'to talk';

  useEffect(() => {
    if (fallback) return;
    const id = setInterval(() => setSecs(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [fallback]);

  useEffect(() => {
    if (matchedRef.current || fallback) return;
    if (queueType === 'listener' && secs === 45 && !showOptions) setShowOptions(true);
    if (secs * 1000 >= MATCH_TIMEOUT_MS) {
      void cancelMatchQueue();
      setFallback(true);
    }
  }, [secs, fallback, showOptions, queueType]);

  useEffect(() => {
    if (fallback || showOptions || matchedRef.current) return;

    let isCancelled = false;
    let pollTimer: ReturnType<typeof setInterval> | null = null;

    async function poll() {
      if (matchedRef.current) return;

      try {
        const result = await findOrCreateMatch({
          topic: tp.key,
          specific,
          intent,
          role: 'talker',
          allowTalkerFallback: queueType === 'talker',
        });

        if (isCancelled || matchedRef.current || !result.matched) return;

        if (!result.sessionId || !result.otherUserId) {
          setMatchError('Could not open the matched session. Please try again.');
          return;
        }

        matchedRef.current = true;
        setShowOptions(false);
        setMatchError(null);
        setMatchedUi(true);

        if (pollTimer) clearInterval(pollTimer);

        const matchedSpecific = queueType === 'talker'
          ? result.otherSpecific ?? specific
          : specific;

        setTimeout(() => {
          router.replace({
            pathname: '/chat',
            params: {
              session_id: result.sessionId,
              topic: tp.key,
              intent: result.otherIntent ?? 'listen',
              specific: matchedSpecific,
              other_user_id: result.otherUserId,
              my_role: 'talker',
              specific_from: queueType === 'talker' ? 'them' : 'me',
            },
          } as never);
        }, 1500);
      } catch (error: unknown) {
        console.warn('Match polling failed', error);
        if (!isCancelled) {
          setMatchError('Could not search for a match. Please try again.');
        }
      }
    }

    void poll();
    pollTimer = setInterval(() => void poll(), 4000);

    return () => {
      isCancelled = true;
      if (pollTimer) clearInterval(pollTimer);
      if (!matchedRef.current) void cancelMatchQueue();
    };
  }, [fallback, showOptions, queueType, pollKey, tp.key, specific, intent]);

  async function handleCancel() {
    if (cancellingRef.current) return;
    cancellingRef.current = true;
    setCancelling(true);
    await cancelMatchQueue();
    router.replace('/(tabs)' as never);
  }

  if (fallback) {
    return (
      <FallbackScreen
        hue={tp.hue}
        specific={specific}
        onBack={() => {
          matchedRef.current = false;
          setSecs(0);
          setShowOptions(false);
          setFallback(false);
          setPollKey(k => k + 1);
        }}
      />
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <View style={{ paddingHorizontal: 24, paddingTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          paddingHorizontal: 10,
          paddingVertical: 5,
          borderRadius: 99,
          backgroundColor: tp.hue + '18',
          borderWidth: 0.5,
          borderColor: tp.hue + '44',
        }}>
          <TopicIcon topicKey={tp.key} color={tp.hue} size={10} tileSize={20} />
          <Text style={{ fontSize: 11, color: tp.hue, letterSpacing: 0.2 }}>{tp.label}</Text>
        </View>
        <TouchableOpacity
          onPress={() => void handleCancel()}
          disabled={cancelling}
          style={{ padding: 8, opacity: cancelling ? 0.45 : 1 }}
        >
          <Text style={{ fontSize: 13, color: t.ink3 }}>{cancelling ? 'Canceling...' : 'Cancel'}</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        {matchedUi ? (
          <View style={{ paddingHorizontal: 28, width: '100%', alignItems: 'center' }}>
            <Text style={{ fontFamily: 'Georgia', fontStyle: 'italic', fontSize: 30, lineHeight: 36, letterSpacing: -0.4, color: t.ink, textAlign: 'center', marginBottom: 8 }}>
              Someone is here.
            </Text>
            <Text style={{ fontSize: 13, color: t.ink3, textAlign: 'center', lineHeight: 18 }}>
              Opening the room...
            </Text>
          </View>
        ) : showOptions ? (
          <View style={{ paddingHorizontal: 28, width: '100%' }}>
            <Text style={{ fontFamily: 'Georgia', fontStyle: 'italic', fontSize: 28, lineHeight: 34, letterSpacing: -0.4, color: t.ink, textAlign: 'center', marginBottom: 8 }}>
              No listener yet.
            </Text>
            <Text style={{ fontSize: 13, color: t.ink3, textAlign: 'center', lineHeight: 18, marginBottom: 28 }}>
              What would you like to do?
            </Text>
            <View style={{ gap: 10 }}>
              <TouchableOpacity
                onPress={() => setShowOptions(false)}
                style={{ paddingVertical: 16, borderRadius: 16, alignItems: 'center', backgroundColor: tp.hue }}
                activeOpacity={0.85}
              >
                <Text style={{ fontSize: 15, fontWeight: '600', color: t.onAccent }}>Keep waiting for a listener</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { setShowOptions(false); setQueueType('talker'); }}
                style={{
                  paddingVertical: 16,
                  borderRadius: 16,
                  alignItems: 'center',
                  backgroundColor: t.bg3,
                  borderWidth: 0.5,
                  borderColor: t.line,
                }}
                activeOpacity={0.85}
              >
                <Text style={{ fontSize: 15, fontWeight: '500', color: t.ink }}>Talk to someone in the same situation</Text>
                <Text style={{ fontSize: 11.5, color: t.ink3, marginTop: 4 }}>Match with another talker</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <RingSet hue={tp.hue} running />
        )}
      </View>

      {!showOptions && (
        <View style={{ paddingHorizontal: 40, paddingBottom: 16, alignItems: 'center' }}>
          <Text style={{ fontSize: 10.5, letterSpacing: 2.4, color: t.ink4, textTransform: 'uppercase', marginBottom: 16 }}>
            {queueType === 'listener'
              ? `Looking for someone ${intentLabel}`
              : 'Looking for someone in the same situation'}
          </Text>
          <Text style={{
            fontSize: 30,
            lineHeight: 36,
            letterSpacing: -0.3,
            color: t.ink,
            textAlign: 'center',
            minHeight: 72,
          }}>
            looking...
          </Text>
          {!!matchError && (
            <Text style={{ marginTop: 10, fontSize: 12, color: t.red, textAlign: 'center' }}>
              {matchError}
            </Text>
          )}
          <Text style={{ marginTop: 20, fontSize: 12, color: t.ink4, letterSpacing: 0.3 }}>
            {secs}s - {secs < 30 ? 'usually under 60s' : 'taking a moment...'}
          </Text>
        </View>
      )}

      {!showOptions && (
        <View style={{
          marginHorizontal: 20,
          marginBottom: 30,
          padding: 14,
          backgroundColor: t.bg2,
          borderWidth: 0.5,
          borderColor: t.line,
          borderRadius: 16,
          flexDirection: 'row',
          gap: 12,
          alignItems: 'flex-start',
        }}>
          <View style={{ width: 16, height: 16, borderRadius: 8, borderWidth: 1.3, borderColor: tp.hue, marginTop: 2 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, fontWeight: '500', color: t.ink, letterSpacing: -0.1 }}>
              Neither of you will know who the other is.
            </Text>
            <Text style={{ fontSize: 11, color: t.ink3, marginTop: 2, lineHeight: 15 }}>
              Real-time anonymous chat - messages are not saved after the session
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
