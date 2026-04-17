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

  return (
    <View className="px-4 pb-5 pt-2">
      <View
        className="rounded-xl border border-border flex-row items-center"
        style={{ backgroundColor: 'rgba(30,30,54,0.9)' }}
      >
        {TABS.map(({ label, Icon, route }) => {
          const isActive = label === active;
          return (
            <TouchableOpacity
              key={label}
              onPress={() => router.push(route as never)}
              className="flex-1 flex-col items-center justify-center py-3 gap-1"
            >
              <Icon
                size={22}
                color={isActive ? '#6366f1' : '#9090aa'}
                strokeWidth={isActive ? 2.2 : 1.7}
              />
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: isActive ? '600' : '500',
                  color: isActive ? '#6366f1' : '#9090aa',
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
