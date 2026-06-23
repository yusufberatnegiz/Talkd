import { useTheme } from '@/hooks/useTheme';
import mark from '@/assets/talkd-mark.png';
import { Image, Text, View } from 'react-native';

export function BrandMark({ compact = false }: { compact?: boolean }) {
  const t = useTheme();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: compact ? 7 : 9 }}>
      <Image
        source={mark}
        resizeMode="contain"
        style={{
          width: compact ? 30 : 38,
          height: compact ? 24 : 30,
        }}
      />
      <Text style={{
        fontFamily: 'Georgia',
        fontStyle: 'italic',
        fontSize: compact ? 18 : 21,
        color: t.ink,
        letterSpacing: -0.4,
      }}>
        talkd
      </Text>
    </View>
  );
}
