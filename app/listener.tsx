import { BrandMark } from '@/components/BrandMark';
import { BottomNav } from '@/components/BottomNav';
import { TopicIcon } from '@/components/TopicIcon';
import { TOPICS } from '@/constants/topics';
import { useTheme } from '@/hooks/useTheme';
import { cancelMatchQueue, findOrCreateMatch } from '@/lib/matching';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ListenerScreen() {
  const t = useTheme();
  const router = useRouter();
  const [online, setOnline] = useState(false);
  const [topicFilter, setTopicFilter] = useState<string[]>([]);
  const [matched, setMatched] = useState(false);
  const [topicError, setTopicError] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [badgeCount, setBadgeCount] = useState<number | null>(null);

  const matchedRef = useRef(false);
  const topicIndexRef = useRef(0);
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

  useEffect(() => {
    if (!online || !userId || topicFilter.length === 0 || matchedRef.current) return;

    let isCancelled = false;
    let pollTimer: ReturnType<typeof setInterval> | null = null;

    async function poll() {
      if (matchedRef.current || topicFilter.length === 0) return;

      const topicKey = topicFilter[topicIndexRef.current % topicFilter.length];
      topicIndexRef.current += 1;

      try {
        const result = await findOrCreateMatch({
          topic: topicKey,
          specific: '',
          intent: 'listen',
          role: 'listener',
          allowTalkerFallback: false,
        });

        if (isCancelled || matchedRef.current || !result.matched) return;
        if (!result.sessionId || !result.otherUserId) {
          setTopicError('Could not open the matched session. Try going on duty again.');
          return;
        }

        matchedRef.current = true;
        setMatched(true);
        setTopicError('');
        if (pollTimer) clearInterval(pollTimer);

        setTimeout(() => {
          router.replace({
            pathname: '/chat',
            params: {
              session_id: result.sessionId,
              topic: topicKey,
              specific: result.otherSpecific ?? '',
              other_user_id: result.otherUserId,
              my_role: 'listener',
              specific_from: 'them',
            },
          } as never);
        }, 1500);
      } catch (error: unknown) {
        console.error('Listener match polling failed', error);
        if (!isCancelled) {
          setTopicError('Could not search for a match. Try going on duty again.');
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
  }, [online, userId, topicFilter, router]);

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
    if (online) {
      void cancelMatchQueue();
    } else {
      matchedRef.current = false;
      topicIndexRef.current = 0;
    }
    setOnline(o => !o);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 8 }}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        bounces={false}
      >
        <View style={{ paddingHorizontal: 24, paddingTop: 14, flexDirection: 'row', justifyContent: 'space-between' }}>
          <BrandMark compact />
          {badgeCount !== null && badgeCount > 0 && (
            <Text style={{ fontSize: 11, color: t.ink4, letterSpacing: 1.5, textTransform: 'uppercase' }}>
              Your badges: {badgeCount}
            </Text>
          )}
        </View>

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
              marginTop: 24,
              paddingVertical: 13,
              paddingHorizontal: 22,
              borderRadius: 99,
              backgroundColor: online ? t.amber : 'transparent',
              borderWidth: online ? 0 : 1,
              borderColor: t.lineStrong,
              alignSelf: 'flex-start',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
            }}
            activeOpacity={0.85}
          >
            {online && <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: t.onAccent }} />}
            <Text style={{ fontSize: 14, fontWeight: '500', color: online ? t.onAccent : t.ink }}>
              {matched ? 'Connecting...' : online ? 'Live - tap to pause' : 'Go on duty'}
            </Text>
          </TouchableOpacity>
          {!!topicError && (
            <Text style={{ marginTop: 10, fontSize: 12, color: t.red, lineHeight: 16 }}>
              {topicError}
            </Text>
          )}
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          <Text style={{ fontSize: 11, letterSpacing: 2, color: t.ink4, textTransform: 'uppercase', marginBottom: 10, paddingLeft: 4 }}>
            Topics
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {topicsArr.map(tp => {
              const active = topicFilter.includes(tp.key);
              return (
                <TouchableOpacity
                  key={tp.key}
                  onPress={() => toggleTopic(tp.key)}
                  style={{
                    paddingVertical: 7,
                    paddingLeft: 8,
                    paddingRight: 12,
                    borderRadius: 99,
                    backgroundColor: active ? tp.hue + '28' : 'transparent',
                    borderWidth: active ? 1 : 0.5,
                    borderColor: active ? tp.hue + '80' : t.lineStrong,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                  }}
                  activeOpacity={0.8}
                >
                  <TopicIcon topicKey={tp.key} color={active ? tp.hue : t.ink4} size={10} tileSize={20} />
                  <Text style={{ fontSize: 12, color: active ? tp.hue : t.ink2 }}>{tp.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {online && !matched && (
          <View style={{ paddingHorizontal: 40, paddingTop: 32, alignItems: 'center' }}>
            <Text style={{ fontSize: 13, fontWeight: '500', color: t.ink3, textAlign: 'center' }}>
              waiting for someone to arrive...
            </Text>
          </View>
        )}
      </ScrollView>

      <BottomNav active="Talk" />
    </SafeAreaView>
  );
}
