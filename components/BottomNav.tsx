import { useRouter } from 'expo-router';
import { Heart, MessageCircle, User } from 'lucide-react-native';
import { Text, TouchableOpacity, View } from 'react-native';

type Tab = 'Home' | 'History' | 'Profile';

const TABS: { label: Tab; Icon: typeof MessageCircle; route: string }[] = [
  { label: 'Home', Icon: MessageCircle, route: '/(tabs)' },
  { label: 'History', Icon: Heart, route: '/(tabs)/history' },
  { label: 'Profile', Icon: User, route: '/(tabs)/profile' },
];

export function BottomNav({ active }: { active: Tab }) {
  const router = useRouter();

  return (
    <View className="px-5 pb-8 pt-4">
      <View className="bg-card rounded-2xl border border-border p-2 flex-row items-center justify-around">
        {TABS.map(({ label, Icon, route }) => {
          const isActive = label === active;
          return (
            <TouchableOpacity
              key={label}
              onPress={() => router.push(route as never)}
              className="flex-col items-center gap-1 py-2 px-4 rounded-xl"
              style={isActive ? { backgroundColor: 'rgba(99,102,241,0.1)' } : undefined}
            >
              <Icon size={20} color={isActive ? '#6366f1' : '#9898aa'} />
              <Text
                className="text-xs font-medium"
                style={{ color: isActive ? '#6366f1' : '#9898aa' }}
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
