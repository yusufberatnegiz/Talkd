import { BottomNav } from '@/components/BottomNav';
import { useRouter } from 'expo-router';
import {
  Bell,
  ChevronRight,
  Heart,
  MessageCircle,
  User,
  Users,
} from 'lucide-react-native';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CATEGORIES = [
  {
    title: 'Mental Health',
    description: 'Talk about anxiety, depression, stress and more',
    Icon: Heart,
    iconColor: '#6366f1',
    bgFrom: 'rgba(99,102,241,0.3)',
    bgTo: 'rgba(99,102,241,0.1)',
    available: 24,
  },
  {
    title: 'Relationships',
    description: 'Family, friends, dating and personal connections',
    Icon: Users,
    iconColor: '#4f4f7a',
    bgFrom: 'rgba(79,79,122,0.3)',
    bgTo: 'rgba(79,79,122,0.1)',
    available: 18,
  },
  {
    title: 'General Advice',
    description: 'Life decisions, career, and everyday challenges',
    Icon: MessageCircle,
    iconColor: '#38b2ac',
    bgFrom: 'rgba(56,178,172,0.3)',
    bgTo: 'rgba(56,178,172,0.1)',
    available: 31,
  },
] as const;


export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-5 pt-4 pb-6">
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <Text className="text-muted-foreground text-sm">Welcome back</Text>
              <Text className="text-2xl font-semibold text-foreground">Talkd</Text>
            </View>
            <View className="flex-row items-center gap-3">
              <TouchableOpacity className="w-10 h-10 rounded-full bg-secondary items-center justify-center">
                <Bell size={20} color="#9898aa" />
              </TouchableOpacity>
              <TouchableOpacity className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: 'rgba(99,102,241,0.2)' }}>
                <User size={20} color="#6366f1" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Greeting card */}
          <View
            className="rounded-2xl p-4 border"
            style={{
              backgroundColor: 'rgba(99,102,241,0.12)',
              borderColor: 'rgba(99,102,241,0.2)',
            }}
          >
            <Text className="text-foreground font-medium mb-1">You're not alone</Text>
            <Text className="text-muted-foreground text-sm leading-relaxed">
              Connect anonymously with someone who understands
            </Text>
          </View>
        </View>

        {/* Categories */}
        <View className="px-5 flex-1">
          <Text className="text-lg font-medium text-foreground mb-4">Choose a topic</Text>

          <View className="gap-3">
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.title}
                className="w-full bg-card rounded-2xl p-4 border border-border"
                onPress={() => router.push('/chat')}
                activeOpacity={0.7}
              >
                <View className="flex-row items-start gap-4">
                  <View
                    className="w-12 h-12 rounded-xl items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: category.bgFrom }}
                  >
                    <category.Icon size={24} color={category.iconColor} />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center justify-between mb-1">
                      <Text className="font-medium text-foreground">{category.title}</Text>
                      <ChevronRight size={20} color="#9898aa" />
                    </View>
                    <Text className="text-sm text-muted-foreground leading-relaxed mb-2">
                      {category.description}
                    </Text>
                    <View className="flex-row items-center gap-1.5">
                      <View className="w-2 h-2 rounded-full bg-green-500" />
                      <Text className="text-xs text-muted-foreground">
                        {category.available} listeners online
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <BottomNav active="Home" />
    </SafeAreaView>
  );
}
