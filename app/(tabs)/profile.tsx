import { BottomNav } from '@/components/BottomNav';
import { useTheme } from '@/hooks/useTheme';
import {
  Award, Bell, ChevronRight, Clock, HelpCircle,
  LogOut, MessageCircle, MessageSquare, Moon, Shield, Star, User,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type MenuItem = { icon: LucideIcon; label: string; value?: string; destructive?: boolean };
type MenuSection = { section: string; items: MenuItem[] };

const MENU: MenuSection[] = [
  {
    section: 'Preferences',
    items: [
      { icon: Bell, label: 'Notifications', value: 'On' },
      { icon: Moon, label: 'Appearance', value: 'Auto' },
      { icon: Shield, label: 'Privacy & data' },
    ],
  },
  {
    section: 'Support',
    items: [
      { icon: HelpCircle, label: 'Help center' },
      { icon: MessageSquare, label: 'Become a listener' },
    ],
  },
];

export default function ProfileScreen() {
  const t = useTheme();

  function Row({ icon: Icon, label, value, destructive = false }: MenuItem) {
    return (
      <TouchableOpacity
        style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 }}
        activeOpacity={0.7}
      >
        <View style={{ height: 32, width: 32, borderRadius: 8, backgroundColor: destructive ? `${t.destructive}1A` : t.muted, alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={16} color={destructive ? t.destructive : t.foreground} strokeWidth={2} style={{ opacity: destructive ? 1 : 0.7 }} />
        </View>
        <Text style={{ flex: 1, fontSize: 14.5, fontWeight: '500', color: destructive ? t.destructive : t.foreground }}>
          {label}
        </Text>
        {value ? <Text style={{ fontSize: 13, color: t.mutedForeground }}>{value}</Text> : null}
        <ChevronRight size={16} color={t.mutedForeground} style={{ opacity: 0.6 }} />
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.background }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8 }}>

        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 48, paddingBottom: 20 }}>
          <Text style={{ fontSize: 12, letterSpacing: 1.4, color: t.mutedForeground, fontWeight: '500', textTransform: 'uppercase' }}>
            Account
          </Text>
          <Text style={{ fontFamily: 'Georgia', fontSize: 34, lineHeight: 38, fontWeight: '600', color: t.foreground, marginTop: 4 }}>
            Profile
          </Text>
        </View>

        {/* Identity card */}
        <View style={{ paddingHorizontal: 20 }}>
          <View style={{ borderRadius: 16, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, padding: 20, alignItems: 'center' }}>
            <View style={{ height: 80, width: 80, borderRadius: 40, backgroundColor: t.primarySoft, borderWidth: 1, borderColor: t.primary + '26', alignItems: 'center', justifyContent: 'center' }}>
              <User size={36} color={t.primary} strokeWidth={1.6} />
            </View>
            <Text style={{ fontFamily: 'Georgia', fontSize: 20, fontWeight: '600', color: t.foreground, marginTop: 12 }}>
              Anonymous User
            </Text>
            <Text style={{ fontSize: 12.5, color: t.mutedForeground, marginTop: 2 }}>Member since March 2024</Text>

            <View style={{ marginTop: 20, flexDirection: 'row', width: '100%' }}>
              {[
                { Icon: MessageCircle, value: '12', label: 'Chats' },
                { Icon: Clock, value: '5h', label: 'Listened' },
                { Icon: Star, value: '4.2', label: 'Rating' },
              ].map(({ Icon, value, label }, i) => (
                <View key={label} style={[{ flex: 1, alignItems: 'center' }, i > 0 ? { borderLeftWidth: 1, borderLeftColor: t.border } : undefined]}>
                  <Icon size={14} color={t.primary} style={{ marginBottom: 6 }} />
                  <Text style={{ fontFamily: 'Georgia', fontSize: 20, fontWeight: '600', color: t.foreground, lineHeight: 22 }}>{value}</Text>
                  <Text style={{ marginTop: 4, fontSize: 11, color: t.mutedForeground }}>{label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Badge */}
        <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
          <TouchableOpacity
            style={{ borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: t.primary }}
            activeOpacity={0.85}
          >
            <View style={{ height: 44, width: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Award size={20} color={t.primaryForeground} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'Georgia', fontSize: 16, fontWeight: '600', color: t.primaryForeground, lineHeight: 20 }}>First Steps</Text>
              <Text style={{ fontSize: 12.5, color: t.primaryForeground, opacity: 0.75 }}>Completed 10+ sessions</Text>
            </View>
            <ChevronRight size={16} color={t.primaryForeground} style={{ opacity: 0.6 }} />
          </TouchableOpacity>
        </View>

        {/* Menu sections */}
        {MENU.map((section) => (
          <View key={section.section} style={{ paddingHorizontal: 20, marginTop: 28 }}>
            <Text style={{ fontSize: 11, fontWeight: '600', letterSpacing: 1.4, color: t.mutedForeground, textTransform: 'uppercase', marginBottom: 8, paddingHorizontal: 4 }}>
              {section.section}
            </Text>
            <View style={{ borderRadius: 12, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, overflow: 'hidden' }}>
              {section.items.map((item, i) => (
                <View key={item.label} style={i < section.items.length - 1 ? { borderBottomWidth: 1, borderBottomColor: t.border } : undefined}>
                  <Row {...item} />
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Sign out */}
        <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
          <View style={{ borderRadius: 12, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, overflow: 'hidden' }}>
            <Row icon={LogOut} label="Sign out" destructive />
          </View>
          <Text style={{ marginTop: 12, textAlign: 'center', fontSize: 11, color: t.mutedForeground }}>
            Talkd · v1.0.0
          </Text>
        </View>
      </ScrollView>

      <BottomNav active="Profile" />
    </SafeAreaView>
  );
}
