import { useTheme } from '@/hooks/useTheme';
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
  const t = useTheme();

  return (
    <TouchableOpacity
      onPress={() => router.push('/chat' as never)}
      style={{
        borderRadius: 12,
        backgroundColor: t.surface,
        borderWidth: 1,
        borderColor: t.border,
        padding: 16,
      }}
      activeOpacity={0.7}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 16 }}>
        <View
          style={{
            height: 44,
            width: 44,
            borderRadius: 12,
            backgroundColor: t.primarySoft,
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon size={18} color={t.primary} strokeWidth={2} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
            <Text style={{ fontFamily: 'Georgia', fontSize: 17, fontWeight: '600', color: t.foreground, lineHeight: 22 }}>
              {title}
            </Text>
            <ChevronRight size={16} color={t.mutedForeground} style={{ marginTop: 2, opacity: 0.6 }} />
          </View>
          <Text style={{ marginTop: 4, fontSize: 13.5, color: t.mutedForeground, lineHeight: 20 }}>
            {description}
          </Text>
          <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: t.success }} />
            <Text style={{ fontSize: 11.5, color: t.mutedForeground }}>{listeners} listeners online</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
