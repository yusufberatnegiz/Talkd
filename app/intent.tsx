import { TopicIcon } from '@/components/TopicIcon';
import { getTopic } from '@/constants/topics';
import { usePremium } from '@/hooks/usePremium';
import { useTheme } from '@/hooks/useTheme';
import { getListenBackStatus, type ListenBackStatus } from '@/lib/listenBack';
import { Sentry } from '@/lib/sentry';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const INTENTS = [
  { k: 'vent',   title: 'I need to vent' },
  { k: 'advice', title: 'I want honest advice' },
  { k: 'think',  title: 'Help me think it through' },
  { k: 'chat',   title: 'Just want to chat' },
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
  const { isPremium, loading: premiumLoading } = usePremium();
  const { topic: topicParam } = useLocalSearchParams<{ topic: string }>();
  const tp = getTopic(topicParam ?? 'any');

  const [intent, setIntent] = useState<IntentKey | null>(null);
  const [specific, setSpecific] = useState('');
  const [listenBackStatus, setListenBackStatus] = useState<ListenBackStatus | null>(null);
  const [checkingTalkAccess, setCheckingTalkAccess] = useState(true);
  const [talkAccessError, setTalkAccessError] = useState('');

  const examples = EXAMPLES[tp.key] ?? EXAMPLES.any;
  const placeholder = `e.g. "${examples[0]}"`;
  const listensRequired = listenBackStatus?.listensRequired ?? 0;
  const talkLocked = !premiumLoading && !isPremium && listensRequired > 0;
  const ctaDisabled = !intent || checkingTalkAccess || talkLocked;
  const listenWord = listensRequired === 1 ? 'time' : 'times';

  useEffect(() => {
    let isMounted = true;

    async function loadTalkAccess() {
      setCheckingTalkAccess(true);
      setTalkAccessError('');
      try {
        const status = await getListenBackStatus();
        if (!isMounted) return;
        setListenBackStatus(status);
      } catch (error: unknown) {
        console.warn('Could not load talk access', error);
        Sentry.captureException(error);
        if (isMounted) {
          setTalkAccessError('Could not check talk access. Try again in a moment.');
        }
      } finally {
        if (isMounted) setCheckingTalkAccess(false);
      }
    }

    void loadTalkAccess();
    return () => { isMounted = false; };
  }, []);

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
            flexDirection: 'row', alignItems: 'center', gap: 7,
            paddingHorizontal: 10, paddingVertical: 5,
            borderRadius: 99, backgroundColor: tp.hue + '18', borderWidth: 0.5, borderColor: tp.hue + '44',
          }}>
            <TopicIcon topicKey={tp.key} color={tp.hue} size={11} tileSize={22} />
            <Text style={{ fontSize: 11.5, color: tp.hue, letterSpacing: 0.2 }}>{tp.label}</Text>
          </View>
        </View>

        {/* Headline */}
        <View style={{ paddingHorizontal: 28, paddingBottom: 24 }}>
          <Text style={{ fontFamily: 'Georgia', fontSize: 36, lineHeight: 40, letterSpacing: -0.6, color: t.ink }}>
            {'What do you want\n'}
            <Text style={{ fontStyle: 'italic', color: tp.hue }}>out of this?</Text>
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
                  backgroundColor: active ? tp.hue + '14' : t.bg3,
                  borderWidth: active ? 1 : 0.5,
                  borderColor: active ? tp.hue + '60' : t.line,
                  borderRadius: 16, padding: 14,
                  flexDirection: 'row', alignItems: 'center', gap: 12,
                }}
                activeOpacity={0.8}
              >
                <View style={{
                  width: 18, height: 18, borderRadius: 9,
                  borderWidth: 1.5, borderColor: active ? tp.hue : t.ink5,
                  backgroundColor: active ? tp.hue : 'transparent',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  {active && <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: t.onAccent }} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', lineHeight: 22, color: active ? tp.hue : t.ink }}>
                    {it.title}
                  </Text>
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
              color: t.ink, fontSize: 15,
            }}
          />
          <Text style={{ fontSize: 11, color: t.ink4, marginTop: 6, paddingLeft: 4, lineHeight: 15 }}>
            Specific beats vague. "Just got broken up with" finds a better match than "relationships."
          </Text>
        </View>

        {/* CTA */}
        <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
          {talkLocked && (
            <View style={{
              marginBottom: 14,
              padding: 14,
              borderRadius: 16,
              backgroundColor: t.bg2,
              borderWidth: 0.5,
              borderColor: t.amber + '55',
            }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: t.ink, lineHeight: 20 }}>
                Listen-back needed
              </Text>
              <Text style={{ marginTop: 6, fontSize: 12.5, color: t.ink3, lineHeight: 18 }}>
                Free accounts listen {listensRequired} more {listenWord} before starting another talk. Talkd Premium skips this.
              </Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                <TouchableOpacity
                  onPress={() => router.push('/listener' as never)}
                  style={{ flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', backgroundColor: t.amber }}
                  activeOpacity={0.85}
                >
                  <Text style={{ fontSize: 13.5, fontWeight: '700', color: t.onAccent }}>
                    Listen now
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push('/premium' as never)}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 12,
                    alignItems: 'center',
                    backgroundColor: t.bg3,
                    borderWidth: 0.5,
                    borderColor: t.line,
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={{ fontSize: 13.5, fontWeight: '700', color: t.ink }}>
                    Premium
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          {!!talkAccessError && (
            <Text style={{ marginBottom: 10, fontSize: 12, color: t.red, lineHeight: 17, textAlign: 'center' }}>
              {talkAccessError}
            </Text>
          )}
          <TouchableOpacity
            disabled={ctaDisabled}
            onPress={() => router.push({ pathname: '/match', params: { topic: tp.key, intent: intent ?? '', specific } } as never)}
            style={{
              paddingVertical: 16, borderRadius: 99, alignItems: 'center',
              backgroundColor: !ctaDisabled ? tp.hue : t.bg3,
            }}
            activeOpacity={0.85}
          >
            {checkingTalkAccess ? (
              <ActivityIndicator color={t.ink4} />
            ) : (
              <Text style={{ fontSize: 15, fontWeight: '600', letterSpacing: -0.1, color: !ctaDisabled ? t.onAccent : t.ink4 }}>
                {talkLocked ? 'Listen-back needed' : intent ? 'Find someone now' : 'Choose one'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
