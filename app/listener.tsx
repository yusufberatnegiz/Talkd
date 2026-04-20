import { BottomNav } from '@/components/BottomNav';
import { TOPICS } from '@/constants/topics';
import { useTheme } from '@/hooks/useTheme';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
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
  other_user_id: string;
  specific: string;
}

export default function ListenerScreen() {
  const t = useTheme();
  const router = useRouter();
  const [online, setOnline] = useState(false);
  const [topicFilter, setTopicFilter] = useState<string[]>([]);
  const [matched, setMatched] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);
  const [badgeCount, setBadgeCount] = useState<number | null>(null);
  const channelsRef = useRef<ReturnType<typeof supabase.channel>[]>([]);
  const matchedRef = useRef(false);

  const topicsArr = Object.values(TOPICS);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      setUserId(user.id);
      const { data } = await supabase
        .from('session_ratings_public')
        .select('badge')
        .eq('rated_user_id', user.id)
        .not('badge', 'is', null);
      if (data) {
        const distinct = new Set(data.map((r: { badge: string }) => r.badge)).size;
        setBadgeCount(distinct);
      }
    });
  }, []);

  function cleanupChannels() {
    channelsRef.current.forEach(ch => void supabase.removeChannel(ch));
    channelsRef.current = [];
  }

  useEffect(() => {
    if (!online || !userId || topicFilter.length === 0) {
      cleanupChannels();
      return;
    }

    cleanupChannels();
    matchedRef.current = false;

    topicFilter.forEach(topicKey => {
      const channel = supabase.channel(`match-queue:${topicKey}:listener`, {
        config: { broadcast: { self: false } },
      });

      channel
        .on('presence', { event: 'sync' }, () => {
          if (matchedRef.current) return;
          const state = channel.presenceState<PresencePayload>();
          const others = Object.values(state).flat().filter(m => m.user_id !== userId);
          if (others.length > 0) void handleMatch(others[0], channel, userId, topicKey);
        })
        .on('broadcast', { event: 'matched' }, ({ payload }: { payload: MatchedPayload }) => {
          if (matchedRef.current) return;
          matchedRef.current = true;
          cleanupChannels();
          setMatched(true);
          setTimeout(() => {
            router.replace({
              pathname: '/chat',
              params: {
                session_id: payload.session_id,
                topic: payload.topic,
                specific: payload.specific,
                other_user_id: payload.other_user_id,
              },
            } as never);
          }, 1500);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({ user_id: userId, intent: 'listen', specific: '' });
          }
        });

      channelsRef.current.push(channel);
    });

    return () => { cleanupChannels(); };
  }, [online, topicFilter, userId]);

  async function handleMatch(
    other: PresencePayload,
    channel: ReturnType<typeof supabase.channel>,
    uid: string,
    topicKey: string,
  ) {
    if (matchedRef.current) return;
    if (uid >= other.user_id) return; // higher UUID waits for broadcast
    matchedRef.current = true;

    const { data, error } = await supabase
      .from('sessions')
      .insert({ user1_id: uid, user2_id: other.user_id, topic: topicKey, status: 'active' })
      .select('id')
      .single();

    if (error || !data) {
      matchedRef.current = false;
      return;
    }

    const sessionId = (data as { id: string }).id;
    const broadcastPayload: MatchedPayload = {
      session_id: sessionId,
      topic: topicKey,
      intent: 'listen',
      matched_user_intent: other.intent,
      other_user_id: uid,
      specific: other.specific,
    };

    await channel.send({ type: 'broadcast', event: 'matched', payload: broadcastPayload });
    cleanupChannels();
    setMatched(true);
    setTimeout(() => {
      router.replace({
        pathname: '/chat',
        params: {
          session_id: sessionId,
          topic: topicKey,
          specific: other.specific,
          other_user_id: other.user_id,
        },
      } as never);
    }, 1500);
  }

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
          {badgeCount !== null && badgeCount > 0 && (
            <Text style={{ fontSize: 11, color: t.ink4, letterSpacing: 1.5, textTransform: 'uppercase' }}>
              Your badges: {badgeCount}
            </Text>
          )}
        </View>

        {/* Headline */}
        <View style={{ paddingHorizontal: 28, paddingTop: 40, paddingBottom: 20 }}>
          <Text style={{ fontSize: 11, letterSpacing: 2.2, color: t.ink4, textTransform: 'uppercase', marginBottom: 14 }}>
            Tonight you are
          </Text>
          <Text style={{ fontFamily: 'Georgia', fontSize: 42, lineHeight: 46, letterSpacing: -0.7, color: t.ink }}>
            {matched ? (
              <Text style={{ fontStyle: 'italic', color: t.amber }}>someone{'\n'}is here.</Text>
            ) : online ? (
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
            onPress={() => { if (!matched) setOnline(o => !o); }}
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
              {matched ? 'Connecting…' : online ? 'Live — tap to pause' : 'Go on duty'}
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

        {online && !matched && (
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
