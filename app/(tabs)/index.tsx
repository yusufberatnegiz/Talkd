import { BottomNav } from '@/components/BottomNav';
import { TOPICS } from '@/constants/topics';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function Dot({ size = 6, color }: { size?: number; color: string }) {
  return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }} />;
}

export default function HomeScreen() {
  const t = useTheme();
  const router = useRouter();
  const [listeners, setListeners] = useState(107);

  useEffect(() => {
    const id = setInterval(() => {
      setListeners(n => Math.max(82, Math.min(128, n + Math.floor(Math.random() * 7) - 3)));
    }, 3500);
    return () => clearInterval(id);
  }, []);

  const topicsArr = Object.values(TOPICS);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 8 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top bar */}
        <View style={{
          flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
          paddingHorizontal: 24, paddingTop: 14,
        }}>
          <Text style={{ fontFamily: 'Georgia', fontStyle: 'italic', fontSize: 18, color: t.ink3 }}>
            talkd
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Dot size={6} color={t.amber} />
            <Text style={{ fontSize: 12, color: t.ink3, letterSpacing: 0.4 }}>{listeners} online now</Text>
          </View>
        </View>

        {/* Greeting */}
        <View style={{ paddingHorizontal: 28, paddingTop: 40, paddingBottom: 24 }}>
          <Text style={{ fontSize: 11, letterSpacing: 2.2, color: t.ink4, textTransform: 'uppercase', marginBottom: 16 }}>
            ANONYMOUS · REAL TIME · NO RECORDS
          </Text>
          <Text style={{ fontFamily: 'Georgia', fontSize: 40, lineHeight: 44, letterSpacing: -0.8, color: t.ink }}>
            {'What do you want to\ntalk about?'}
          </Text>
        </View>

        {/* 2×3 topic grid */}
        <View style={{
          paddingHorizontal: 20,
          flexDirection: 'row', flexWrap: 'wrap', gap: 8,
        }}>
          {topicsArr.map((tp) => (
            <TouchableOpacity
              key={tp.key}
              onPress={() => router.push({ pathname: '/intent', params: { topic: tp.key } } as never)}
              style={{
                width: '48%',
                backgroundColor: t.bg3,
                borderWidth: 0.5, borderColor: t.line,
                borderRadius: 18, padding: 14,
                minHeight: 112,
                justifyContent: 'space-between',
              }}
              activeOpacity={0.75}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Dot size={7} color={tp.hue} />
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Dot size={4} color={tp.hue} />
                  <Text style={{ fontSize: 10.5, color: tp.hue, letterSpacing: 0.3 }}>{tp.n}</Text>
                </View>
              </View>
              <View>
                <Text style={{ fontFamily: 'Georgia', fontSize: 20, letterSpacing: -0.3, lineHeight: 24, color: t.ink, marginBottom: 4 }}>
                  {tp.label}
                </Text>
                <Text style={{ fontSize: 11.5, color: t.ink3, letterSpacing: 0.1, lineHeight: 15 }}>
                  {tp.hint}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Listener CTA */}
        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <Text style={{ fontSize: 11, letterSpacing: 2, color: t.ink4, textTransform: 'uppercase', marginBottom: 10, paddingLeft: 4 }}>
            OR
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/listener' as never)}
            style={{
              backgroundColor: t.bg2, borderWidth: 0.5, borderColor: t.line,
              borderRadius: 18, padding: 18,
              flexDirection: 'row', alignItems: 'center', gap: 14,
            }}
            activeOpacity={0.75}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '500', letterSpacing: -0.2, color: t.coral }}>
                Listen to someone tonight
              </Text>
              <Text style={{ fontSize: 12, color: t.ink3, marginTop: 2 }}>
                Help out · 10–15 min each
              </Text>
            </View>
            <Text style={{ fontSize: 16, color: t.ink4 }}>→</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomNav active="Talk" />
    </SafeAreaView>
  );
}
