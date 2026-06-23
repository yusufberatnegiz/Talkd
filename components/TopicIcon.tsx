import { TopicKey } from '@/constants/topics';
import { useTheme } from '@/hooks/useTheme';
import {
  BriefcaseBusiness,
  Brain,
  Compass,
  Heart,
  Moon,
  Sparkles,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

const TOPIC_ICONS: Record<TopicKey, LucideIcon> = {
  mh: Brain,
  rel: Heart,
  career: BriefcaseBusiness,
  night: Moon,
  advice: Compass,
  any: Sparkles,
};

export function TopicIcon({
  topicKey,
  color,
  size = 18,
  tileSize = 36,
}: {
  topicKey: string;
  color: string;
  size?: number;
  tileSize?: number;
}) {
  const t = useTheme();
  const Icon = TOPIC_ICONS[topicKey as TopicKey] ?? Sparkles;
  const radius = Math.max(8, Math.round(tileSize / 3));

  return (
    <View style={{
      width: tileSize,
      height: tileSize,
      borderRadius: radius,
      backgroundColor: color + t.topicIconBgAlpha,
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Icon size={size} color={color} strokeWidth={2.2} />
    </View>
  );
}
