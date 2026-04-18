import { theme } from '@/lib/theme';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type Tab = 'Talk' | 'History' | 'You';

const TABS: { label: Tab; route: string }[] = [
  { label: 'Talk', route: '/(tabs)' },
  { label: 'History', route: '/(tabs)/history' },
  { label: 'You', route: '/(tabs)/profile' },
];

export function BottomNav({ active }: { active: Tab }) {
  const router = useRouter();
  const t = theme;
  const insets = useSafeAreaInsets();

  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 }}>
      <View style={{
        borderRadius: 99,
        borderWidth: 0.5,
        borderColor: t.line,
        backgroundColor: t.bg3,
        flexDirection: 'row',
        padding: 4,
      }}>
        {TABS.map(({ label, route }) => {
          const isActive = label === active;
          return (
            <TouchableOpacity
              key={label}
              onPress={() => router.push(route as never)}
              style={{
                flex: 1,
                alignItems: 'center',
                paddingVertical: 12,
                backgroundColor: isActive ? t.bg4 : 'transparent',
                borderRadius: 99,
              }}
            >
              <Text style={{
                fontSize: 13,
                fontWeight: '500',
                color: isActive ? t.ink : t.ink3,
                letterSpacing: -0.1,
              }}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
