import { BrandMark } from '@/components/BrandMark';
import { TopicIcon } from '@/components/TopicIcon';
import { TOPICS } from '@/constants/topics';
import { SESSION_DURATION_SECONDS } from '@/constants/config';
import { useTheme } from '@/hooks/useTheme';
import { markSafetyGuidelinesAccepted, markSafetyGuidelinesPending } from '@/lib/safetyAcceptance';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { ArrowLeft, ArrowRight, EyeOff, HeartHandshake, MessageCircle, ShieldCheck } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Visual 1: a preview of the conversation users are about to enter.
function Visual1() {
  const t = useTheme();
  const firstOpacity = useRef(new Animated.Value(0)).current;
  const secondOpacity = useRef(new Animated.Value(0)).current;
  const firstY = useRef(new Animated.Value(8)).current;
  const secondY = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(firstOpacity, { toValue: 1, duration: 360, useNativeDriver: true }),
        Animated.timing(firstY, { toValue: 0, duration: 360, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(secondOpacity, { toValue: 1, duration: 360, useNativeDriver: true }),
        Animated.timing(secondY, { toValue: 0, duration: 360, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={{ width: 300, height: 190, justifyContent: 'center' }}>
      <View style={{
        flexDirection: 'row', alignItems: 'center', gap: 8,
        borderBottomWidth: 0.5, borderBottomColor: t.line,
        paddingBottom: 12, marginBottom: 16,
      }}>
        <MessageCircle size={17} color={t.amber} strokeWidth={2} />
        <Text style={{ flex: 1, color: t.ink2, fontSize: 12.5, fontWeight: '600' }}>Anonymous conversation</Text>
        <Text style={{ color: t.ink4, fontSize: 11 }}>15:00</Text>
      </View>

      <Animated.View style={{
        alignSelf: 'flex-start', maxWidth: 226,
        borderRadius: 18, borderBottomLeftRadius: 6,
        backgroundColor: t.bg3, paddingHorizontal: 15, paddingVertical: 11,
        opacity: firstOpacity, transform: [{ translateY: firstY }],
      }}>
        <Text style={{ color: t.ink2, fontSize: 13.5, lineHeight: 19 }}>I could use another perspective.</Text>
      </Animated.View>

      <Animated.View style={{
        alignSelf: 'flex-end', maxWidth: 236, marginTop: 10,
        borderRadius: 18, borderBottomRightRadius: 6,
        backgroundColor: t.amberDim, paddingHorizontal: 15, paddingVertical: 11,
        opacity: secondOpacity, transform: [{ translateY: secondY }],
      }}>
        <Text style={{ color: t.ink, fontSize: 13.5, lineHeight: 19 }}>I'm here. What's on your mind?</Text>
      </Animated.View>
    </View>
  );
}

// Visual 2: a compact preview of the real topic picker.
function Visual2() {
  const t = useTheme();
  const topics = Object.values(TOPICS);
  const opacities = useRef(topics.map(() => new Animated.Value(0))).current;
  const translates = useRef(topics.map(() => new Animated.Value(8))).current;

  useEffect(() => {
    Animated.stagger(
      120,
      topics.map((_, i) =>
        Animated.parallel([
          Animated.timing(opacities[i], { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(translates[i], { toValue: 0, duration: 400, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        ])
      )
    ).start();
  }, []);

  return (
    <View style={{ width: 300, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {topics.map((tp, i) => (
        <Animated.View
          key={tp.key}
          style={{
            opacity: opacities[i],
            transform: [{ translateY: translates[i] }],
            width: 146, height: 52, borderRadius: 12,
            backgroundColor: tp.hue + t.topicBgAlpha,
            borderWidth: 0.5, borderColor: tp.hue + t.topicBorderAlpha,
            paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 9,
          }}
        >
          <TopicIcon topicKey={tp.key} color={tp.hue} size={14} tileSize={28} />
          <Text numberOfLines={2} style={{ flex: 1, fontSize: 11.5, lineHeight: 15, fontWeight: '600', color: t.ink }}>
            {tp.label}
          </Text>
        </Animated.View>
      ))}
    </View>
  );
}

// Visual 3: two sides of an anonymous, caring conversation.
function Visual3() {
  const t = useTheme();
  const leftY = useRef(new Animated.Value(3)).current;
  const rightY = useRef(new Animated.Value(-3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(leftY, { toValue: -3, duration: 1700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(rightY, { toValue: 3, duration: 1700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(leftY, { toValue: 3, duration: 1700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(rightY, { toValue: -3, duration: 1700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <View style={{ width: 280, height: 164, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={{
        position: 'absolute', left: 6, top: 18,
        width: 118, height: 78, borderRadius: 22,
        borderWidth: 0.5, borderColor: t.amber + '50',
        backgroundColor: t.amberSoft, padding: 15,
        transform: [{ translateY: leftY }],
      }}>
        <MessageCircle size={20} color={t.amber} strokeWidth={2} />
        <View style={{ width: 64, height: 3, borderRadius: 2, backgroundColor: t.amber + '55', marginTop: 12 }} />
        <View style={{ width: 42, height: 3, borderRadius: 2, backgroundColor: t.amber + '30', marginTop: 6 }} />
      </Animated.View>

      <Animated.View style={{
        position: 'absolute', right: 6, bottom: 16,
        width: 118, height: 78, borderRadius: 22,
        borderWidth: 0.5, borderColor: t.coral + '50',
        backgroundColor: t.coralSoft, padding: 15, alignItems: 'flex-end',
        transform: [{ translateY: rightY }],
      }}>
        <MessageCircle size={20} color={t.coral} strokeWidth={2} />
        <View style={{ width: 64, height: 3, borderRadius: 2, backgroundColor: t.coral + '55', marginTop: 12 }} />
        <View style={{ width: 42, height: 3, borderRadius: 2, backgroundColor: t.coral + '30', marginTop: 6 }} />
      </Animated.View>

      <View style={{
        width: 60, height: 60, borderRadius: 30,
        backgroundColor: t.bg2, borderWidth: 1, borderColor: t.lineStrong,
        alignItems: 'center', justifyContent: 'center',
      }}>
        <HeartHandshake size={28} color={t.ink} strokeWidth={1.8} />
      </View>
    </View>
  );
}

function KindnessRule({ icon: Icon, title, body }: { icon: LucideIcon; title: string; body: string }) {
  const t = useTheme();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View style={{
        width: 36, height: 36, borderRadius: 12,
        backgroundColor: t.bg3, alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={17} color={t.amber} strokeWidth={2} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: t.ink, fontSize: 13.5, fontWeight: '600' }}>{title}</Text>
        <Text style={{ color: t.ink3, fontSize: 11.5, lineHeight: 16, marginTop: 2 }}>{body}</Text>
      </View>
    </View>
  );
}

export default function OnboardingScreen() {
  const t = useTheme();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [accepting, setAccepting] = useState(false);
  const [acceptError, setAcceptError] = useState('');
  const sessionMinutes = Math.round(SESSION_DURATION_SECONDS / 60);

  const steps = [
    {
      kicker: 'WELCOME',
      before: 'A real person,\n',
      italic: 'right now.',
      accentColor: t.amber,
      body: `Talk about what matters with someone ready to listen. Every conversation is anonymous, real-time, and lasts ${sessionMinutes} minutes.`,
      cta: 'Continue',
    },
    {
      kicker: 'FIND YOUR ROOM',
      before: 'Start with what\n',
      italic: 'matters.',
      accentColor: t.coral,
      body: 'Choose a topic, then decide whether you want to talk or listen. We will look for the right person for that moment.',
      cta: 'Continue',
    },
    {
      kicker: 'OUR AGREEMENT',
      before: 'One rule:\n',
      italic: 'be kind.',
      accentColor: t.amber,
      body: 'Behind every message is a real person. Listen without judgment, protect your privacy, and leave any conversation that feels wrong.',
      cta: 'I agree and continue',
    },
  ];

  const s = steps[step];
  const isLast = step === steps.length - 1;

  async function handleNext() {
    if (!isLast) {
      setStep(step + 1);
      return;
    }

    setAcceptError('');
    setAccepting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        await markSafetyGuidelinesPending();
        router.replace('/auth' as never);
        return;
      }

      await markSafetyGuidelinesAccepted();
      router.replace('/(tabs)' as never);
    } catch {
      setAcceptError('Could not save your safety agreement. Check your connection and try again.');
    } finally {
      setAccepting(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <View style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 24, paddingTop: 12, paddingBottom: 14,
      }}>
        <BrandMark compact />
        <Text style={{ color: t.ink4, fontSize: 11.5, fontWeight: '600' }}>
          {step + 1} of {steps.length}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', paddingHorizontal: 24, gap: 6 }}>
        {steps.map((_, i) => (
          <View key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            backgroundColor: i <= step ? t.amber : t.bg3,
          }} />
        ))}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={{
          minHeight: isLast ? 184 : 224,
          flex: 1, alignItems: 'center', justifyContent: 'center',
          paddingHorizontal: 24, paddingVertical: 12,
        }}>
          {step === 0 && <Visual1 />}
          {step === 1 && <Visual2 />}
          {step === 2 && <Visual3 />}
        </View>

        <View style={{ paddingHorizontal: 28, paddingBottom: 28 }}>
          <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 0, color: t.ink4, marginBottom: 12 }}>
            {s.kicker}
          </Text>
          <Text style={{ fontFamily: 'Georgia', fontSize: 38, lineHeight: 42, letterSpacing: 0, color: t.ink }}>
            {s.before}
            <Text style={{ fontStyle: 'italic', color: s.accentColor }}>{s.italic}</Text>
          </Text>
          <Text style={{ fontSize: 14.5, color: t.ink3, marginTop: 14, lineHeight: 22, maxWidth: 330 }}>
            {s.body}
          </Text>
          {isLast && (
            <View style={{ gap: 12, marginTop: 18 }}>
              <KindnessRule icon={HeartHandshake} title="Listen with care" body="No judgment, pressure, or cruelty." />
              <KindnessRule icon={EyeOff} title="Keep it anonymous" body="No names, photos, or contact details." />
              <KindnessRule icon={ShieldCheck} title="Put safety first" body="Leave and report anything that feels wrong." />
            </View>
          )}
          {!!acceptError && (
            <Text style={{ fontSize: 12.5, color: t.red, marginTop: 12, lineHeight: 18 }}>
              {acceptError}
            </Text>
          )}
        </View>
      </ScrollView>

      <View style={{
        paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16,
        flexDirection: 'row', gap: 8,
        borderTopWidth: 0.5, borderTopColor: t.line,
      }}>
        {step > 0 && (
          <TouchableOpacity
            onPress={() => setStep(step - 1)}
            accessibilityRole="button"
            accessibilityLabel="Previous onboarding step"
            style={{
              width: 52, height: 52, borderRadius: 16,
              borderWidth: 0.5, borderColor: t.lineStrong,
              alignItems: 'center', justifyContent: 'center',
            }}
            activeOpacity={0.75}
          >
            <ArrowLeft size={20} color={t.ink2} strokeWidth={2} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={() => void handleNext()}
          disabled={accepting}
          accessibilityRole="button"
          style={{
            flex: 1, height: 52, backgroundColor: accepting ? t.bg3 : t.amber,
            borderRadius: 16, alignItems: 'center', justifyContent: 'center',
            flexDirection: 'row', gap: 8,
          }}
          activeOpacity={0.85}
        >
          <Text style={{ fontSize: 15, fontWeight: '600', color: accepting ? t.ink4 : t.onAccent, letterSpacing: 0 }}>
            {accepting ? 'Saving...' : s.cta}
          </Text>
          {!accepting && <ArrowRight size={18} color={t.onAccent} strokeWidth={2.2} />}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
