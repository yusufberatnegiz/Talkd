import { BottomNav } from '@/components/BottomNav';
import {
  Award,
  Bell,
  ChevronRight,
  Clock,
  HelpCircle,
  LogOut,
  MessageSquare,
  Moon,
  MessageCircle,
  Shield,
  Star,
  User,
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

function Row({ icon: Icon, label, value, destructive = false }: MenuItem) {
  return (
    <TouchableOpacity className="flex-row items-center gap-3 px-4 py-3.5" activeOpacity={0.7}>
      <View
        className="h-8 w-8 rounded-lg items-center justify-center"
        style={{ backgroundColor: destructive ? 'rgba(239,68,68,0.1)' : '#2d2d4a' }}
      >
        <Icon size={16} color={destructive ? '#ef4444' : 'rgba(238,238,245,0.7)'} strokeWidth={2} />
      </View>
      <Text
        className="flex-1 text-left"
        style={{ fontSize: 14.5, fontWeight: '500', color: destructive ? '#ef4444' : '#eeeef5' }}
      >
        {label}
      </Text>
      {value ? <Text style={{ fontSize: 13, color: '#9090aa' }}>{value}</Text> : null}
      <ChevronRight size={16} color="rgba(144,144,170,0.6)" />
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8 }}>

        {/* Header */}
        <View className="px-5 pt-12 pb-5">
          <Text style={{ fontSize: 12, letterSpacing: 1.4, color: '#9090aa', fontWeight: '500', textTransform: 'uppercase' }}>
            Account
          </Text>
          <Text style={{ fontFamily: 'Georgia', fontSize: 34, lineHeight: 38, fontWeight: '600', color: '#eeeef5', marginTop: 4 }}>
            Profile
          </Text>
        </View>

        {/* Identity card */}
        <View className="px-5">
          <View className="rounded-2xl bg-surface border border-border p-5 items-center">
            <View
              className="h-20 w-20 rounded-full items-center justify-center"
              style={{ backgroundColor: '#21213e', borderWidth: 1, borderColor: 'rgba(99,102,241,0.15)' }}
            >
              <User size={36} color="#6366f1" strokeWidth={1.6} />
            </View>
            <Text style={{ fontFamily: 'Georgia', fontSize: 20, fontWeight: '600', color: '#eeeef5', marginTop: 12 }}>
              Anonymous User
            </Text>
            <Text style={{ fontSize: 12.5, color: '#9090aa', marginTop: 2 }}>Member since March 2024</Text>

            <View className="mt-5 flex-row w-full">
              {[
                { Icon: MessageCircle, value: '12', label: 'Chats' },
                { Icon: Clock, value: '5h', label: 'Listened' },
                { Icon: Star, value: '4.2', label: 'Rating' },
              ].map(({ Icon, value, label }, i) => (
                <View
                  key={label}
                  className="flex-1 items-center"
                  style={i > 0 ? { borderLeftWidth: 1, borderLeftColor: '#2e2e4a' } : undefined}
                >
                  <Icon size={14} color="#6366f1" style={{ marginBottom: 6 }} />
                  <Text style={{ fontFamily: 'Georgia', fontSize: 20, fontWeight: '600', color: '#eeeef5', lineHeight: 22 }}>
                    {value}
                  </Text>
                  <Text style={{ marginTop: 4, fontSize: 11, color: '#9090aa' }}>{label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Badge */}
        <View className="px-5 mt-4">
          <TouchableOpacity
            className="rounded-xl p-4 flex-row items-center gap-3"
            style={{ backgroundColor: '#6366f1' }}
            activeOpacity={0.85}
          >
            <View
              className="h-11 w-11 rounded-xl items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
            >
              <Award size={20} color="#fff" />
            </View>
            <View className="flex-1">
              <Text style={{ fontFamily: 'Georgia', fontSize: 16, fontWeight: '600', color: '#fff', lineHeight: 20 }}>
                First Steps
              </Text>
              <Text style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.75)' }}>Completed 10+ sessions</Text>
            </View>
            <ChevronRight size={16} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
        </View>

        {/* Menu sections */}
        {MENU.map((section) => (
          <View key={section.section} className="px-5 mt-7">
            <Text style={{ fontSize: 11, fontWeight: '600', letterSpacing: 1.4, color: '#9090aa', textTransform: 'uppercase', marginBottom: 8, paddingHorizontal: 4 }}>
              {section.section}
            </Text>
            <View className="rounded-xl bg-surface border border-border overflow-hidden">
              {section.items.map((item, i) => (
                <View
                  key={item.label}
                  style={i < section.items.length - 1 ? { borderBottomWidth: 1, borderBottomColor: '#2e2e4a' } : undefined}
                >
                  <Row {...item} />
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Sign out */}
        <View className="px-5 mt-5">
          <View className="rounded-xl bg-surface border border-border overflow-hidden">
            <Row icon={LogOut} label="Sign out" destructive />
          </View>
          <Text style={{ marginTop: 12, textAlign: 'center', fontSize: 11, color: '#9090aa' }}>
            Talkd · v1.0.0
          </Text>
        </View>
      </ScrollView>

      <BottomNav active="Profile" />
    </SafeAreaView>
  );
}
