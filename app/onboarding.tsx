import { TOPICS } from '@/constants/topics';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function Visual1() {
  const t = useTheme();
  return (
    <View style={{ width: 220, height: 180, alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <View style={{
        position: 'absolute', left: 20, width: 70, height: 70, borderRadius: 35,
        backgroundColor: t.amber, opacity: 0.25,
      }} />
      <View style={{
        position: 'absolute', right: 20, width: 70, height: 70, borderRadius: 35,
        backgroundColor: t.coral, opacity: 0.25,
      }} />
      <View style={{ width: 80, height: 0.5, backgroundColor: t.lineStrong }} />
      <View style={{ position: 'absolute', left: 55, width: 46, height: 46, borderRadius: 23, backgroundColor: t.amber, opacity: 0.6 }} />
      <View style={{ position: 'absolute', right: 55, width: 46, height: 46, borderRadius: 23, backgroundColor: t.coral, opacity: 0.6 }} />
    </View>
  );
}

function Visual2() {
  const chips = Object.values(TOPICS).slice(0, 5);
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 280 }}>
      {chips.map((tp) => (
        <View key={tp.key} style={{
          paddingHorizontal: 14, paddingVertical: 9, borderRadius: 99,
          backgroundColor: tp.hue + '18', borderWidth: 0.5, borderColor: tp.hue + '44',
        }}>
          <Text style={{ fontFamily: 'Georgia', fontStyle: 'italic', fontSize: 13, color: tp.hue }}>{tp.label}</Text>
        </View>
      ))}
    </View>
  );
}

function Visual3() {
  const t = useTheme();
  return (
    <View style={{
      width: 160, height: 160, borderRadius: 80,
      borderWidth: 1, borderColor: t.amber + '60',
      alignItems: 'center', justifyContent: 'center',
    }}>
      <View style={{
        position: 'absolute', width: 120, height: 120, borderRadius: 60,
        borderWidth: 0.5, borderColor: t.amber + '40',
      }} />
      <Text style={{ fontFamily: 'Georgia', fontStyle: 'italic', fontSize: 28, color: t.amber }}>be kind</Text>
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
      {/* Progress dots */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 24, paddingTop: 16, gap: 6 }}>
        {steps.map((_, i) => (
          <View key={i} style={{
            flex: 1, height: 2, borderRadius: 99,
            backgroundColor: i <= step ? t.amber : t.bg3,
          }} />
        ))}
      </View>

      {/* Visual */}
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
          onPress={() => isLast ? router.replace('/(tabs)') : setStep(step + 1)}
          style={{
            flex: 1, paddingVertical: 16, backgroundColor: t.amber,
            borderRadius: 99, alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: '600', color: t.bg, letterSpacing: -0.1 }}>{s.cta}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
