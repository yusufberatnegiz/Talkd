import { TOPICS } from '@/constants/topics';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Visual 1 — two glowing circles drifting toward each other
function Visual1() {
  const t = useTheme();
  const leftX = useRef(new Animated.Value(-28)).current;
  const rightX = useRef(new Animated.Value(28)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(leftX, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(rightX, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(leftX, { toValue: -28, duration: 2200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(rightX, { toValue: 28, duration: 2200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <View style={{ width: 240, height: 180, alignItems: 'center', justifyContent: 'center' }}>
      {/* Outer glow circles */}
      <Animated.View style={{
        position: 'absolute', width: 80, height: 80, borderRadius: 40,
        backgroundColor: t.amber, opacity: 0.18,
        transform: [{ translateX: leftX }],
        left: 20,
      }} />
      <Animated.View style={{
        position: 'absolute', width: 80, height: 80, borderRadius: 40,
        backgroundColor: t.coral, opacity: 0.18,
        transform: [{ translateX: rightX }],
        right: 20,
      }} />
      {/* Connection line */}
      <View style={{ width: 80, height: 0.5, backgroundColor: t.lineStrong }} />
      {/* Inner solid circles */}
      <Animated.View style={{
        position: 'absolute', width: 48, height: 48, borderRadius: 24,
        backgroundColor: t.amber, opacity: 0.65,
        transform: [{ translateX: leftX }],
        left: 46,
      }} />
      <Animated.View style={{
        position: 'absolute', width: 48, height: 48, borderRadius: 24,
        backgroundColor: t.coral, opacity: 0.65,
        transform: [{ translateX: rightX }],
        right: 46,
      }} />
    </View>
  );
}

// Visual 2 — topic chips stagger fade-in
function Visual2() {
  const chips = Object.values(TOPICS).slice(0, 5);
  const opacities = useRef(chips.map(() => new Animated.Value(0))).current;
  const translates = useRef(chips.map(() => new Animated.Value(10))).current;

  useEffect(() => {
    Animated.stagger(
      120,
      chips.map((_, i) =>
        Animated.parallel([
          Animated.timing(opacities[i], { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(translates[i], { toValue: 0, duration: 400, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        ])
      )
    ).start();
  }, []);

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 280 }}>
      {chips.map((tp, i) => (
        <Animated.View
          key={tp.key}
          style={{
            opacity: opacities[i],
            transform: [{ translateY: translates[i] }],
            paddingHorizontal: 14, paddingVertical: 9, borderRadius: 99,
            backgroundColor: tp.hue + '18', borderWidth: 0.5, borderColor: tp.hue + '44',
          }}
        >
          <Text style={{ fontFamily: 'Georgia', fontStyle: 'italic', fontSize: 13, color: tp.hue }}>{tp.label}</Text>
        </Animated.View>
      ))}
    </View>
  );
}

// Visual 3 — breathing "be kind" circle
function Visual3() {
  const t = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, { toValue: 1.14, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.9, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.5, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <View style={{ width: 180, height: 180, alignItems: 'center', justifyContent: 'center' }}>
      {/* Outer breathing ring */}
      <Animated.View style={{
        position: 'absolute', width: 160, height: 160, borderRadius: 80,
        borderWidth: 1, borderColor: t.amber + '60',
        opacity, transform: [{ scale }],
      }} />
      {/* Inner ring */}
      <Animated.View style={{
        position: 'absolute', width: 130, height: 130, borderRadius: 65,
        borderWidth: 0.5, borderColor: t.amber + '40',
        opacity, transform: [{ scale }],
      }} />
      <Text style={{ fontFamily: 'Georgia', fontStyle: 'italic', fontSize: 28, color: t.amber }}>
        be kind
      </Text>
    </View>
  );
}

export default function OnboardingScreen() {
  const t = useTheme();
  const router = useRouter();
  const [step, setStep] = useState(0);

  const steps = [
    {
      kicker: 'WELCOME',
      before: "You're not ",
      italic: 'alone.',
      accentColor: t.amber,
      body: 'talkd connects you with a real stranger, right now, for 10–15 minutes. No names. No history. No records.',
      cta: 'Ok',
    },
    {
      kicker: 'HOW IT WORKS',
      before: 'Pick a ',
      italic: 'topic.',
      accentColor: t.coral,
      body: 'Relationships, work decisions, mental health, late-night thoughts — or just chat. You both chose the same thing.',
      cta: 'Got it',
    },
    {
      kicker: 'THE CONTRACT',
      before: 'One rule: ',
      italic: 'be kind.',
      accentColor: '#B5A8D9',
      body: "No names, no photos, no contact info — it keeps everyone safe. In crisis we'll point you somewhere better.",
      cta: 'I understand',
    },
  ];

  const s = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      {/* Progress bars */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 24, paddingTop: 16, gap: 6 }}>
        {steps.map((_, i) => (
          <View key={i} style={{
            flex: 1, height: 2, borderRadius: 99,
            backgroundColor: i <= step ? t.amber : t.bg3,
          }} />
        ))}
      </View>

      {/* Animated visual */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 }}>
        {step === 0 && <Visual1 />}
        {step === 1 && <Visual2 />}
        {step === 2 && <Visual3 />}
      </View>

      {/* Content */}
      <View style={{ paddingHorizontal: 28, paddingBottom: 24 }}>
        <Text style={{ fontSize: 11, letterSpacing: 2.2, color: t.ink4, textTransform: 'uppercase', marginBottom: 14 }}>
          {s.kicker}
        </Text>
        <Text style={{ fontFamily: 'Georgia', fontSize: 40, lineHeight: 44, letterSpacing: -0.8, color: t.ink }}>
          {s.before}
          <Text style={{ fontStyle: 'italic', color: s.accentColor }}>{s.italic}</Text>
        </Text>
        <Text style={{ fontSize: 14.5, color: t.ink3, marginTop: 14, lineHeight: 22, maxWidth: 320 }}>
          {s.body}
        </Text>
      </View>

      {/* CTAs */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 20, flexDirection: 'row', gap: 8 }}>
        {step > 0 && (
          <TouchableOpacity
            onPress={() => setStep(step - 1)}
            style={{
              paddingVertical: 15, paddingHorizontal: 24, borderRadius: 99,
              borderWidth: 0.5, borderColor: t.lineStrong,
            }}
          >
            <Text style={{ fontSize: 14, color: t.ink2 }}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={() => isLast ? router.replace('/auth' as never) : setStep(step + 1)}
          style={{ flex: 1, paddingVertical: 16, backgroundColor: t.amber, borderRadius: 99, alignItems: 'center' }}
          activeOpacity={0.85}
        >
          <Text style={{ fontSize: 15, fontWeight: '600', color: t.bg, letterSpacing: -0.1 }}>{s.cta}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
