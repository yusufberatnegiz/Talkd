import { useTheme } from '@/hooks/useTheme';
import { Flag, LogOut, Shield } from 'lucide-react-native';
import { Text, TouchableOpacity, View } from 'react-native';

interface ChatHeaderProps {
  onExit: () => void;
  onReport: () => void;
}

export function ChatHeader({ onExit, onReport }: ChatHeaderProps) {
  const t = useTheme();

  return (
    <View
      style={{
        paddingHorizontal: 12,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: t.background,
        borderBottomWidth: 1,
        borderBottomColor: t.border,
      }}
    >
      {/* Exit — always visible, 1 tap */}
      <TouchableOpacity
        onPress={onExit}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={{
          height: 36,
          width: 36,
          borderRadius: 18,
          backgroundColor: t.muted,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <LogOut size={17} color={t.foreground} strokeWidth={2} />
      </TouchableOpacity>

      {/* Listener info */}
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View
          style={{
            height: 36,
            width: 36,
            borderRadius: 18,
            backgroundColor: t.primarySoft,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Shield size={18} color={t.primary} strokeWidth={2} />
        </View>
        <View>
          <Text style={{ fontFamily: 'Georgia', fontSize: 16, fontWeight: '600', color: t.foreground, lineHeight: 20 }}>
            Anonymous Listener
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ height: 6, width: 6, borderRadius: 3, backgroundColor: t.success }} />
            <Text style={{ fontSize: 11.5, color: t.mutedForeground }}>Active now</Text>
          </View>
        </View>
      </View>

      {/* Report — always visible, 1 tap */}
      <TouchableOpacity
        onPress={onReport}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={{
          height: 36,
          width: 36,
          borderRadius: 18,
          backgroundColor: t.muted,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Flag size={17} color={t.destructive} strokeWidth={2} />
      </TouchableOpacity>
    </View>
  );
}
