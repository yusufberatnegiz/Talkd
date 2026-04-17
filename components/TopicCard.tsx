import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Text, TouchableOpacity, View } from 'react-native';

interface TopicCardProps {
  topic: string;
  title: string;
  description: string;
  listeners: number;
  Icon: LucideIcon;
}

export function TopicCard({ title, description, listeners, Icon }: TopicCardProps) {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.push('/chat' as never)}
      className="rounded-xl bg-surface border border-border p-4"
      activeOpacity={0.7}
    >
      <View className="flex-row items-start gap-4">
        <View className="h-11 w-11 rounded-xl bg-primary-soft items-center justify-center flex-shrink-0">
          <Icon size={18} color="#6366f1" strokeWidth={2} />
        </View>
        <View className="flex-1">
          <View className="flex-row items-start justify-between gap-2">
            <Text style={{ fontFamily: 'Georgia', fontSize: 17, fontWeight: '600', color: '#eeeef5', lineHeight: 22 }}>
              {title}
            </Text>
            <ChevronRight size={16} color="rgba(144,144,170,0.6)" style={{ marginTop: 2 }} />
          </View>
          <Text className="mt-1 text-sm text-muted-foreground leading-relaxed">{description}</Text>
          <View className="mt-3 flex-row items-center gap-1.5">
            <View className="relative">
              <View className="w-1.5 h-1.5 rounded-full bg-success" />
            </View>
            <Text style={{ fontSize: 11.5, color: '#9090aa' }}>{listeners} listeners online</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
