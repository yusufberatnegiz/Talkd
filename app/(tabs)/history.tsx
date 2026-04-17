import { BottomNav } from '@/components/BottomNav';
import {
  ChevronRight,
  Clock,
  Heart,
  MessageCircle,
  Star,
  Users,
} from 'lucide-react-native';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CHAT_HISTORY = [
  {
    id: 1,
    category: 'Mental Health',
    Icon: Heart,
    iconColor: '#6366f1',
    date: 'Today',
    duration: '24 min',
    rating: 5,
    preview: 'Thank you for listening. I feel much better now...',
  },
  {
    id: 2,
    category: 'Relationships',
    Icon: Users,
    iconColor: '#4f4f7a',
    date: 'Yesterday',
    duration: '18 min',
    rating: 4,
    preview: 'It was helpful to talk about my situation with...',
  },
  {
    id: 3,
    category: 'General Advice',
    Icon: MessageCircle,
    iconColor: '#38b2ac',
    date: 'Mar 15',
    duration: '32 min',
    rating: 5,
    preview: 'Great advice on my career decision. Really helped...',
  },
  {
    id: 4,
    category: 'Mental Health',
    Icon: Heart,
    iconColor: '#6366f1',
    date: 'Mar 12',
    duration: '15 min',
    rating: 3,
    preview: 'The session was okay but felt a bit rushed...',
  },
  {
    id: 5,
    category: 'Relationships',
    Icon: Users,
    iconColor: '#4f4f7a',
    date: 'Mar 10',
    duration: '28 min',
    rating: 5,
    preview: 'Such a supportive listener. Helped me see things...',
  },
] as const;

export default function HistoryScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="px-5 pt-4 pb-4">
        <Text className="text-2xl font-semibold text-foreground mb-1">History</Text>
        <Text className="text-muted-foreground text-sm">Your past conversations</Text>
      </View>

      {/* Stats summary */}
      <View className="px-5 pb-4">
        <View className="flex-row gap-3">
          {[
            { value: '12', label: 'Sessions' },
            { value: '4.2', label: 'Avg Rating' },
            { value: '5h', label: 'Total Time' },
          ].map(({ value, label }) => (
            <View
              key={label}
              className="flex-1 bg-card rounded-xl p-3 border border-border items-center"
            >
              <Text className="text-xl font-semibold text-foreground">{value}</Text>
              <Text className="text-xs text-muted-foreground">{label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* List */}
      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, paddingBottom: 8 }}
      >
        {CHAT_HISTORY.map((chat) => (
          <TouchableOpacity
            key={chat.id}
            className="w-full bg-card rounded-2xl p-4 border border-border"
            activeOpacity={0.7}
          >
            <View className="flex-row items-start gap-3">
              <View className="w-10 h-10 rounded-xl bg-secondary items-center justify-center flex-shrink-0">
                <chat.Icon size={20} color={chat.iconColor} />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="font-medium text-foreground text-sm">{chat.category}</Text>
                  <ChevronRight size={16} color="#9898aa" />
                </View>
                <Text className="text-xs text-muted-foreground mb-2" numberOfLines={1}>
                  {chat.preview}
                </Text>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3">
                    <Text className="text-xs text-muted-foreground">{chat.date}</Text>
                    <View className="flex-row items-center gap-1">
                      <Clock size={12} color="#9898aa" />
                      <Text className="text-xs text-muted-foreground">{chat.duration}</Text>
                    </View>
                  </View>
                  <View className="flex-row items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        color={i < chat.rating ? '#6366f1' : 'rgba(152,152,170,0.3)'}
                        fill={i < chat.rating ? '#6366f1' : 'transparent'}
                      />
                    ))}
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <BottomNav active="History" />
    </SafeAreaView>
  );
}
