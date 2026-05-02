import { BottomNav } from '@/components/BottomNav';
import { TOPICS } from '@/constants/topics';
import { useTheme } from '@/hooks/useTheme';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SeekingPayload {
  userId: string;
  intent: string;
  specific: string;
}

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
  listenerId: string;
  talkerId: string;
  talkerIntent: string;
}): Promise<string> {
  const { data, error } = await supabase
    .from('sessions')
    .insert({
      topic: input.topic,
      specific: input.specific || null,
      participant_a: input.listenerId,
      participant_b: input.talkerId,
      intent_a: 'listen',
      intent_b: input.talkerIntent,
    })
    .select('id')
    .single();

  if (error || !data?.id) {
    throw new Error('Session could not be created.');
  }

  return data.id as string;
}

export default function ListenerScreen() {
  const t = useTheme();
  const router = useRouter();
  const [online, setOnline] = useState(false);
  const [topicFilter, setTopicFilter] = useState<string[]>([]);
  const [matched, setMatched] = useState(false);
  const [topicError, setTopicError] = useState('');

  const [userId, setUserId] = useState<string | null>(null);
  const [badgeCount, setBadgeCount] = useState<number | null>(null);
  const channelsRef = useRef<ReturnType<typeof supabase.channel>[]>([]);
  const matchedRef = useRef(false);
  const removalPromiseRef = useRef<Promise<unknown>>(Promise.resolve());

  const topicsArr = Object.values(TOPICS);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      setUserId(user.id);
      const { data } = await supabase
        .from('session_ratings_public')
        .select('badge_count')
        .eq('rated_user_id', user.id)
        .maybeSingle();
      if (data) {
        setBadgeCount((data as { badge_count: number | null }).badge_count ?? 0);
      }
    });
  }, []);

  function cleanupChannels() {
    if (channelsRef.current.length > 0) {
      removalPromiseRef.current = Promise.all(
        channelsRef.current.map(ch => supabase.removeChannel(ch))
      );
      channelsRef.current = [];
    }
  }

  useEffect(() => {
    if (!online || !userId || topicFilter.length === 0) {
      cleanupChannels();
      return;
    }

    let isCancelled = false;

    async function setup() {
      await removalPromiseRef.current;  // wait for any in-flight removal from previous cleanup
      if (isCancelled) return;

      matchedRef.current = false;

      topicFilter.forEach(topicKey => {
        const channel = supabase.channel(`match-queue:${topicKey}:listener`, {
          config: { broadcast: { self: false } },
        });

        channel
          .on('broadcast', { event: 'seeking' }, ({ payload }: { payload: SeekingPayload }) => {
            if (matchedRef.current || payload.userId === userId) return;
            if (userId! < payload.userId) {
              void handleMatchAsLower(payload, channel, userId!, topicKey);
            } else {
              void channel.send({
                type: 'broadcast', event: 'match-offer',
                payload: { fromId: userId!, toId: payload.userId, intent: 'listen', specific: payload.specific },
              });
            }
          })
          .on('broadcast', { event: 'matched' }, ({ payload }: { payload: MatchedPayload }) => {
            if (matchedRef.current || payload.toId !== userId) return;
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
                  my_role: 'listener',
                  specific_from: 'them',
                },
              } as never);
            }, 1500);
          })
          .subscribe(() => { /* broadcast-only */ });

        channelsRef.current.push(channel);
      });
    }

    void setup();

    return () => { isCancelled = true; cleanupChannels(); };
  }, [online, topicFilter, userId]);

  async function handleMatchAsLower(
    other: SeekingPayload,
    channel: ReturnType<typeof supabase.channel>,
    uid: string,
    topicKey: string,
  ) {
    if (matchedRef.current) return;
    matchedRef.current = true;

    try {
      const sessionId = await createSession({
        topic: topicKey,
        specific: other.specific,
        listenerId: uid,
        talkerId: other.userId,
        talkerIntent: other.intent,
      });
      const matchedPayload: MatchedPayload = {
        session_id: sessionId,
        topic: topicKey,
        toId: other.userId,
        matched_user_intent: other.intent,
        other_user_id: uid,
        specific: other.specific,
      };

      await channel.send({ type: 'broadcast', event: 'matched', payload: matchedPayload });
      cleanupChannels();
      setMatched(true);
      setTimeout(() => {
        router.replace({
          pathname: '/chat',
          params: {
            session_id: sessionId,
            topic: topicKey,
            specific: other.specific,
            other_user_id: other.userId,
            my_role: 'listener',
            specific_from: 'them',
          },
        } as never);
      }, 1500);
    } catch {
      matchedRef.current = false;
      setMatched(false);
      setTopicError('Could not create the session. Try going on duty again.');
    }
  }

  const toggleTopic = (k: string) => {
    setTopicError('');
    setTopicFilter(tf => tf.includes(k) ? tf.filter(x => x !== k) : [...tf, k]);
  };

  const handleDutyToggle = () => {
    if (matched) return;
    if (!online && topicFilter.length === 0) {
      setTopicError('Pick at least one topic before going on duty.');
      return;
    }
    setTopicError('');
    setOnline(o => !o);
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
            onPress={handleDutyToggle}
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
          {!!topicError && (
            <Text style={{ marginTop: 10, fontSize: 12, color: t.red, lineHeight: 16 }}>
              {topicError}
            </Text>
          )}
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
