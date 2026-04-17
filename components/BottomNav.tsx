import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import { Clock, Home, User } from 'lucide-react-native';
import { Text, TouchableOpacity, View } from 'react-native';

type Tab = 'Home' | 'History' | 'Profile';

const TABS: { label: Tab; Icon: typeof Home; route: string }[] = [
  { label: 'Home', Icon: Home, route: '/(tabs)' },
  { label: 'History', Icon: Clock, route: '/(tabs)/history' },
  { label: 'Profile', Icon: User, route: '/(tabs)/profile' },
];

export function BottomNav({ active }: { active: Tab }) {
  const router = useRouter();
  const t = useTheme();

  return (
    <View style={{ paddingHorizontal: 16, paddingBottom: 20, paddingTop: 8 }}>
      <View
        style={{
          borderRadius: 12,
          borderWidth: 1,
          borderColor: t.border,
          backgroundColor: t.surface,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        {TABS.map(({ label, Icon, route }) => {
          const isActive = label === active;
          return (
            <TouchableOpacity
              key={label}
              onPress={() => router.push(route as never)}
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, gap: 4 }}
            >
              <Icon
                size={22}
                color={isActive ? t.primary : t.mutedForeground}
                strokeWidth={isActive ? 2.2 : 1.7}
              />
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: isActive ? '600' : '500',
                  color: isActive ? t.primary : t.mutedForeground,
                }}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
