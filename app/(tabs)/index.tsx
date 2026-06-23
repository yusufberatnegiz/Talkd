import { BrandMark } from '@/components/BrandMark';
import { BottomNav } from '@/components/BottomNav';
import { TopicIcon } from '@/components/TopicIcon';
import { TOPICS } from '@/constants/topics';
import { useOnlineCount } from '@/hooks/useOnlineCount';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import { ArrowRight, Headphones, Users } from 'lucide-react-native';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function Dot({ size = 6, color }: { size?: number; color: string }) {
  return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }} />;
}

export default function HomeScreen() {
  const t = useTheme();
  const router = useRouter();
  const { total } = useOnlineCount();

  const topicsArr = Object.values(TOPICS);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 8 }}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        bounces={false}
      >
        <View style={{
          flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
          paddingHorizontal: 24, paddingTop: 14,
        }}>
          <BrandMark compact />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Dot size={6} color={t.amber} />
            <Text style={{ fontSize: 12, color: t.ink3, letterSpacing: 0.4 }}>{total ?? '...'} online</Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 28, paddingTop: 34, paddingBottom: 22 }}>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 18 }}>
            <View style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 99, backgroundColor: t.bg3, borderWidth: 0.5, borderColor: t.line }}>
              <Text style={{ fontSize: 11, color: t.ink3 }}>Anonymous</Text>
            </View>
            <View style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 99, backgroundColor: t.bg3, borderWidth: 0.5, borderColor: t.line }}>
              <Text style={{ fontSize: 11, color: t.ink3 }}>15 min</Text>
            </View>
          </View>
          <Text style={{ fontFamily: 'Georgia', fontSize: 38, lineHeight: 42, letterSpacing: -0.8, color: t.ink }}>
            {'Find the right\nperson now.'}
          </Text>
        </View>

        <View style={{
          paddingHorizontal: 20,
          flexDirection: 'row', flexWrap: 'wrap', gap: 8,
        }}>
          {topicsArr.map((tp) => {
            return (
              <TouchableOpacity
                key={tp.key}
                onPress={() => router.push({ pathname: '/intent', params: { topic: tp.key } } as never)}
                style={{
                  width: '48%',
                  backgroundColor: tp.hue + t.topicBgAlpha,
                  borderWidth: 0.5, borderColor: tp.hue + t.topicBorderAlpha,
                  borderRadius: 18, padding: 14,
                  minHeight: 104,
                  justifyContent: 'space-between',
                }}
                activeOpacity={0.75}
              >
                <TopicIcon topicKey={tp.key} color={tp.hue} />
                <View>
                  <Text style={{ fontSize: 15.5, fontWeight: '600', lineHeight: 21, color: t.ink, marginBottom: 3 }}>
                    {tp.label}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <TouchableOpacity
            onPress={() => router.push('/listener' as never)}
            style={{
              backgroundColor: t.bg, borderWidth: 0.5, borderColor: t.coral + '40',
              borderRadius: 18, padding: 18,
              flexDirection: 'row', alignItems: 'center', gap: 14,
            }}
            activeOpacity={0.75}
          >
            <View style={{
              width: 42, height: 42, borderRadius: 14,
              backgroundColor: t.coralDim,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Headphones size={20} color={t.coral} strokeWidth={2.2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '500', letterSpacing: -0.2, color: t.coral }}>
                Go on duty
              </Text>
              <Text style={{ fontSize: 12, color: t.ink3, marginTop: 3 }}>
                Be there for someone
              </Text>
            </View>
            <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: t.bg3, alignItems: 'center', justifyContent: 'center' }}>
              <ArrowRight size={15} color={t.ink3} strokeWidth={2.2} />
            </View>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14, paddingHorizontal: 4 }}>
            <Users size={13} color={t.ink4} strokeWidth={2} />
            <Text style={{ fontSize: 11.5, color: t.ink4 }}>No profiles. Just the room you enter.</Text>
          </View>
        </View>
      </ScrollView>

      <BottomNav active="Talk" />
    </SafeAreaView>
  );
}
