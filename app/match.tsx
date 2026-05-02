import { getTopic } from '@/constants/topics';
import { MATCH_TIMEOUT_MS } from '@/constants/config';
import { useTheme } from '@/hooks/useTheme';
import { supabase } from '@/lib/supabase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SeekingPayload { userId: string; intent: string; specific: string; }
interface OfferPayload   { fromId: string; toId: string; intent: string; specific: string; }

interface MatchedPayload {
  session_id: string;
  topic: string;
  toId: string;
  matched_user_intent: string;
  other_user_id: string;
  specific: string;
}

async function createSession(input: {
  topic: string;
  specific: string;
  participantA: string;
  participantB: string;
  intentA: string;
  intentB: string;
}): Promise<string> {
  const { data, error } = await supabase
    .from('sessions')
    .insert({
      topic: input.topic,
      specific: input.specific || null,
      participant_a: input.participantA,
      participant_b: input.participantB,
      intent_a: input.intentA,
      intent_b: input.intentB,
    })
    .select('id')
    .single();

  if (error || !data?.id) {
    console.error('Session creation failed', error);
    throw new Error('Session could not be created.');
  }

  return data.id as string;
}

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
  const router = useRouter();
  const [note, setNote] = useState(specific);
  const [unavailable, setUnavailable] = useState(false);

  if (unavailable) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 }}>
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: hue, marginBottom: 28 }} />
          <Text style={{ fontFamily: 'Georgia', fontStyle: 'italic', fontSize: 32, lineHeight: 38, letterSpacing: -0.3, color: t.ink, textAlign: 'center' }}>
            Async notes are not ready yet.
          </Text>
          <Text style={{ fontSize: 13.5, color: t.ink3, marginTop: 14, lineHeight: 20, textAlign: 'center', maxWidth: 280 }}>
            We did not send or save this note. You can keep looking now, or come back later.
          </Text>
          <View style={{
            marginTop: 30, padding: 16, backgroundColor: t.bg2,
            borderWidth: 0.5, borderColor: t.line, borderRadius: 16, maxWidth: 300,
          }}>
            <Text style={{ fontFamily: 'Georgia', fontStyle: 'italic', fontSize: 15, color: t.ink2 }}>
              "{note || 'Someone wanted to talk.'}"
            </Text>
          </View>
          <TouchableOpacity
            onPress={onBack}
            style={{ marginTop: 32, paddingVertical: 14, paddingHorizontal: 32, borderRadius: 99, backgroundColor: hue }}
            activeOpacity={0.85}
          >
            <Text style={{ fontSize: 14.5, fontWeight: '600', color: t.bg }}>Keep looking</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.replace('/(tabs)')}
            style={{ marginTop: 12, paddingVertical: 14, paddingHorizontal: 32 }}
            activeOpacity={0.85}
          >
            <Text style={{ fontSize: 14.5, fontWeight: '500', color: t.ink3 }}>Go home</Text>
          </TouchableOpacity>
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
          onPress={() => setUnavailable(true)}
          style={{ paddingVertical: 16, borderRadius: 99, alignItems: 'center', backgroundColor: note.trim() ? hue : t.bg3 }}
        >
          <Text style={{ fontSize: 15, fontWeight: '600', color: note.trim() ? t.bg : t.ink4 }}>
            Check async availability
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

  const [userId, setUserId] = useState<string | null>(null);
  const [secs, setSecs] = useState(0);
  const [queueType, setQueueType] = useState<'listener' | 'talker'>('listener');
  const [showOptions, setShowOptions] = useState(false);
  const [fallback, setFallback] = useState(false);
  const [subscribeKey, setSubscribeKey] = useState(0);
  const [matchError, setMatchError] = useState<string | null>(null);
  const [matchedUi, setMatchedUi] = useState(false);

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const matchedRef = useRef(false);
  const seekIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const removalPromiseRef = useRef<Promise<unknown>>(Promise.resolve());

  const intentLabel = {
    vent: 'to listen', advice: 'to give honest advice',
    think: 'to think with you', chat: 'to chat',
  }[intent] ?? 'to talk';

  // Load user ID
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  // Timer
  useEffect(() => {
    if (fallback) return;
    const id = setInterval(() => setSecs(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [fallback]);

  // Timer milestones
  useEffect(() => {
    if (matchedRef.current || fallback) return;
    // Show talker↔talker option before async fallback.
    if (queueType === 'listener' && secs === 45 && !showOptions) setShowOptions(true);
    if (secs * 1000 >= MATCH_TIMEOUT_MS) {
      if (seekIntervalRef.current) { clearInterval(seekIntervalRef.current); seekIntervalRef.current = null; }
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setFallback(true);
    }
  }, [secs, fallback, showOptions, queueType]);

  // Channel subscription
  useEffect(() => {
    if (!userId) return;
    let isCancelled = false;

    async function setup() {
      await removalPromiseRef.current;  // wait for any in-flight removal from previous cleanup
      if (isCancelled) return;

      const channel = supabase.channel(`match-queue:${tp.key}:${queueType}`, {
        config: { broadcast: { self: false } },
      });
      channelRef.current = channel;

      channel
        .on('broadcast', { event: 'seeking' }, ({ payload }: { payload: SeekingPayload }) => {
          // Only relevant in talker-talker queue
          if (queueType !== 'talker' || matchedRef.current || payload.userId === userId) return;
          if (userId! < payload.userId) void handleMatchAsLower(payload, channel, userId!);
          // else: higher UUID — wait for 'matched' from the lower-UUID talker
        })
        .on('broadcast', { event: 'match-offer' }, ({ payload }: { payload: OfferPayload }) => {
          // Listener's UUID > ours — we're lower UUID, we create the session
          if (matchedRef.current || payload.toId !== userId) return;
          void handleMatchFromOffer(payload, channel, userId!);
        })
        .on('broadcast', { event: 'matched' }, ({ payload }: { payload: MatchedPayload }) => {
          // Other side (lower UUID) already created session
          if (matchedRef.current || payload.toId !== userId) return;
          matchedRef.current = true;
          if (seekIntervalRef.current) { clearInterval(seekIntervalRef.current); seekIntervalRef.current = null; }
          setMatchedUi(true);
          setTimeout(() => {
            void supabase.removeChannel(channel);
            channelRef.current = null;
            router.replace({
              pathname: '/chat',
              params: {
                session_id: payload.session_id,
                topic: payload.topic,
                intent: payload.matched_user_intent,
                specific: payload.specific,
                other_user_id: payload.other_user_id,
                my_role: 'talker',
                // In talker↔talker, the specific shown should be what the other party wrote.
                specific_from: queueType === 'talker' ? 'them' : 'me',
              },
            } as never);
          }, 1500);
        })
        .subscribe((status) => {
          if (status !== 'SUBSCRIBED') return;
          const broadcast = () => {
            if (matchedRef.current) return;
            void channel.send({ type: 'broadcast', event: 'seeking',
              payload: { userId: userId!, intent, specific } });
          };
          broadcast();
          seekIntervalRef.current = setInterval(broadcast, 8000);
        });
    }

    void setup();

    return () => {
      isCancelled = true;
      if (seekIntervalRef.current) { clearInterval(seekIntervalRef.current); seekIntervalRef.current = null; }
      if (channelRef.current) {
        removalPromiseRef.current = supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [userId, queueType, subscribeKey]);

  async function handleMatchAsLower(
    other: SeekingPayload,
    channel: ReturnType<typeof supabase.channel>,
    uid: string,
  ) {
    if (matchedRef.current) return;
    matchedRef.current = true;
    if (seekIntervalRef.current) { clearInterval(seekIntervalRef.current); seekIntervalRef.current = null; }
    setShowOptions(false);
    setMatchError(null);
    setMatchedUi(true);

    try {
      const matchedUserIntent = other.intent;
      const sessionSpecific = queueType === 'talker' ? other.specific : specific;
      const sessionId = await createSession({
        topic: tp.key,
        specific: sessionSpecific,
        participantA: uid,
        participantB: other.userId,
        intentA: intent,
        intentB: matchedUserIntent,
      });
      await channel.send({
        type: 'broadcast', event: 'matched',
        payload: {
          session_id: sessionId, topic: tp.key, toId: other.userId,
          matched_user_intent: matchedUserIntent, other_user_id: uid, specific,
        } as MatchedPayload,
      });
      setTimeout(() => {
        void supabase.removeChannel(channel);
        channelRef.current = null;
        router.replace({
          pathname: '/chat',
          params: {
            session_id: sessionId,
            topic: tp.key,
            intent: matchedUserIntent,
            specific: sessionSpecific,
            other_user_id: other.userId,
            my_role: 'talker',
            specific_from: queueType === 'talker' ? 'them' : 'me',
          },
        } as never);
      }, 1500);
    } catch (error: unknown) {
      console.error('Talker match session creation failed', error);
      matchedRef.current = false;
      setMatchedUi(false);
      setMatchError('Could not create the session. Please try matching again.');
    }
  }

  async function handleMatchFromOffer(
    offer: OfferPayload,
    channel: ReturnType<typeof supabase.channel>,
    uid: string,
  ) {
    if (matchedRef.current) return;
    matchedRef.current = true;
    if (seekIntervalRef.current) { clearInterval(seekIntervalRef.current); seekIntervalRef.current = null; }
    setShowOptions(false);
    setMatchError(null);
    setMatchedUi(true);

    try {
      const sessionId = await createSession({
        topic: tp.key,
        specific,
        participantA: uid,
        participantB: offer.fromId,
        intentA: intent,
        intentB: offer.intent,
      });
      await channel.send({
        type: 'broadcast', event: 'matched',
        payload: {
          session_id: sessionId, topic: tp.key, toId: offer.fromId,
          matched_user_intent: offer.intent, other_user_id: uid, specific,
        } as MatchedPayload,
      });
      setTimeout(() => {
        void supabase.removeChannel(channel);
        channelRef.current = null;
        router.replace({
          pathname: '/chat',
          params: {
            session_id: sessionId,
            topic: tp.key,
            intent: offer.intent,
            specific,
            other_user_id: offer.fromId,
            my_role: 'talker',
            specific_from: 'me',
          },
        } as never);
      }, 1500);
    } catch (error: unknown) {
      console.error('Talker offer session creation failed', error);
      matchedRef.current = false;
      setMatchedUi(false);
      setMatchError('Could not create the session. Please try matching again.');
    }
  }

  async function handleCancel() {
    if (channelRef.current) {
      await supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    router.back();
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
          setSubscribeKey(k => k + 1);
        }}
      />
    );
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
        <TouchableOpacity onPress={handleCancel} style={{ padding: 8 }}>
          <Text style={{ fontSize: 13, color: t.ink3 }}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {/* Rings / matched / options card */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        {matchedUi ? (
          <View style={{ paddingHorizontal: 28, width: '100%', alignItems: 'center' }}>
            <Text style={{ fontFamily: 'Georgia', fontStyle: 'italic', fontSize: 30, lineHeight: 36, letterSpacing: -0.4, color: t.ink, textAlign: 'center', marginBottom: 8 }}>
              Someone is here.
            </Text>
            <Text style={{ fontSize: 13, color: t.ink3, textAlign: 'center', lineHeight: 18 }}>
              Opening the room…
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
                <Text style={{ fontSize: 15, fontWeight: '600', color: t.bg }}>Keep waiting for a listener</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { setShowOptions(false); setQueueType('talker'); }}
                style={{
                  paddingVertical: 16, borderRadius: 16, alignItems: 'center',
                  backgroundColor: t.bg3, borderWidth: 0.5, borderColor: t.line,
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

      {/* Status */}
      {!showOptions && (
        <View style={{ paddingHorizontal: 40, paddingBottom: 16, alignItems: 'center' }}>
          <Text style={{ fontSize: 10.5, letterSpacing: 2.4, color: t.ink4, textTransform: 'uppercase', marginBottom: 16 }}>
            {queueType === 'listener'
              ? `Looking for someone ${intentLabel}`
              : 'Looking for someone in the same situation'}
          </Text>
          <Text style={{
            fontFamily: 'Georgia', fontStyle: 'italic', fontSize: 30, lineHeight: 36,
            letterSpacing: -0.3, color: t.ink, textAlign: 'center', minHeight: 72,
          }}>
            looking…
          </Text>
          {!!matchError && (
            <Text style={{ marginTop: 10, fontSize: 12, color: t.red, textAlign: 'center' }}>
              {matchError}
            </Text>
          )}
          <Text style={{ marginTop: 20, fontSize: 12, color: t.ink4, letterSpacing: 0.3 }}>
            {secs}s · {secs < 30 ? 'usually under 60s' : 'taking a moment…'}
          </Text>
        </View>
      )}

      {/* Reassurance */}
      {!showOptions && (
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
              Real-time anonymous chat · messages are not saved after the session
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
