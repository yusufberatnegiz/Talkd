import { getTopic } from '@/constants/topics';
import { useTheme } from '@/hooks/useTheme';
import { supabase } from '@/lib/supabase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PresencePayload {
  user_id: string;
  intent: string;
  specific: string;
}

interface MatchedPayload {
  session_id: string;
  topic: string;
  intent: string;
  matched_user_intent: string;
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
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
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
          <TouchableOpacity
            onPress={() => router.replace('/(tabs)')}
            style={{ marginTop: 32, paddingVertical: 14, paddingHorizontal: 32, borderRadius: 99, backgroundColor: hue }}
            activeOpacity={0.85}
          >
            <Text style={{ fontSize: 14.5, fontWeight: '600', color: t.bg }}>Go home</Text>
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
          onPress={() => setSent(true)}
          style={{ paddingVertical: 16, borderRadius: 99, alignItems: 'center', backgroundColor: note.trim() ? hue : t.bg3 }}
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

  const [userId, setUserId] = useState<string | null>(null);
  const [secs, setSecs] = useState(0);
  const [queueType, setQueueType] = useState<'listener' | 'talker'>('listener');
  const [showOptions, setShowOptions] = useState(false);
  const [fallback, setFallback] = useState(false);
  const [subscribeKey, setSubscribeKey] = useState(0);

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const matchedRef = useRef(false);

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
    if (secs === 60 && !showOptions) setShowOptions(true);
    if (secs === 90) {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setFallback(true);
    }
  }, [secs, fallback, showOptions]);

  // Channel subscription
  useEffect(() => {
    if (!userId) return;

    const channelName = `match-queue:${tp.key}:${queueType}`;
    const channel = supabase.channel(channelName, {
      config: { broadcast: { self: false } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        if (matchedRef.current) return;
        const state = channel.presenceState<PresencePayload>();
        const others = Object.values(state).flat().filter(m => m.user_id !== userId);
        if (others.length > 0) void handleMatch(others[0], channel, userId);
      })
      .on('broadcast', { event: 'matched' }, ({ payload }: { payload: MatchedPayload }) => {
        if (matchedRef.current) return;
        matchedRef.current = true;
        supabase.removeChannel(channel);
        channelRef.current = null;
        router.replace({
          pathname: '/chat',
          params: { session_id: payload.session_id, topic: payload.topic, intent: payload.matched_user_intent, specific },
        } as never);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: userId, intent, specific });
        }
      });

    channelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [userId, queueType, subscribeKey]);

  async function handleMatch(
    matched: PresencePayload,
    channel: ReturnType<typeof supabase.channel>,
    uid: string,
  ) {
    if (matchedRef.current) return;
    if (uid >= matched.user_id) return; // higher UUID waits for broadcast
    matchedRef.current = true;
    setShowOptions(false);

    const { data, error } = await supabase
      .from('sessions')
      .insert({ user1_id: uid, user2_id: matched.user_id, topic: tp.key, status: 'active' })
      .select('id')
      .single();

    if (error || !data) {
      matchedRef.current = false;
      return;
    }

    const sessionId = (data as { id: string }).id;
    const broadcastPayload: MatchedPayload = {
      session_id: sessionId,
      topic: tp.key,
      intent,
      matched_user_intent: matched.intent,
    };

    await channel.send({ type: 'broadcast', event: 'matched', payload: broadcastPayload });
    supabase.removeChannel(channel);
    channelRef.current = null;

    router.replace({
      pathname: '/chat',
      params: { session_id: sessionId, topic: tp.key, intent: matched.intent, specific },
    } as never);
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
          setQueueType('listener');
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

      {/* Rings or options card */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        {showOptions ? (
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
              10–15 min session · ends when the timer runs out · nothing saved
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
