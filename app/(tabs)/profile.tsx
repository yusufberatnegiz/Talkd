import { BottomNav } from '@/components/BottomNav';
import {
  Award,
  Bell,
  ChevronRight,
  Clock,
  HelpCircle,
  LogOut,
  MessageCircle,
  Moon,
  Settings,
  Shield,
  Star,
  User,
} from 'lucide-react-native';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type MenuItem = {
  icon: typeof Bell;
  label: string;
  value?: string;
  danger?: boolean;
};

type MenuSection = {
  section: string;
  items: MenuItem[];
};

const MENU_ITEMS: MenuSection[] = [
  {
    section: 'Preferences',
    items: [
      { icon: Bell, label: 'Notifications', value: 'On' },
      { icon: Moon, label: 'Dark Mode', value: 'On' },
      { icon: Shield, label: 'Privacy' },
    ],
  },
  {
    section: 'Support',
    items: [
      { icon: HelpCircle, label: 'Help Center' },
      { icon: MessageCircle, label: 'Become a Listener' },
    ],
  },
  {
    section: 'Account',
    items: [
      { icon: Settings, label: 'Account Settings' },
      { icon: LogOut, label: 'Sign Out', danger: true },
    ],
  },
];

export default function ProfileScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 8 }}
      >
        {/* Header */}
        <View className="px-5 pt-4 pb-6">
          <Text className="text-2xl font-semibold text-foreground mb-6">Profile</Text>

          {/* Profile card */}
          <View className="bg-card rounded-2xl p-5 border border-border">
            <View className="flex-row items-center gap-4 mb-5">
              <View
                className="w-16 h-16 rounded-full items-center justify-center"
                style={{
                  backgroundColor: 'rgba(99,102,241,0.15)',
                  borderWidth: 2,
                  borderColor: 'rgba(99,102,241,0.3)',
                }}
              >
                <User size={32} color="#6366f1" />
              </View>
              <View>
                <Text className="text-lg font-semibold text-foreground">Anonymous User</Text>
                <Text className="text-sm text-muted-foreground">Member since March 2024</Text>
              </View>
            </View>

            {/* Stats */}
            <View className="flex-row gap-3">
              {[
                { Icon: MessageCircle, iconColor: '#6366f1', value: '12', label: 'Chats' },
                { Icon: Clock, iconColor: '#4f4f7a', value: '5h', label: 'Time' },
                { Icon: Star, iconColor: '#38b2ac', value: '4.2', label: 'Rating' },
              ].map(({ Icon, iconColor, value, label }) => (
                <View
                  key={label}
                  className="flex-1 rounded-xl p-3 items-center"
                  style={{ backgroundColor: 'rgba(45,45,69,0.5)' }}
                >
                  <View className="flex-row items-center gap-1 mb-1">
                    <Icon size={16} color={iconColor} />
                    <Text className="text-lg font-semibold text-foreground">{value}</Text>
                  </View>
                  <Text className="text-xs text-muted-foreground">{label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Achievement badge */}
          <View
            className="mt-4 rounded-2xl p-4 border"
            style={{
              backgroundColor: 'rgba(99,102,241,0.12)',
              borderColor: 'rgba(99,102,241,0.2)',
            }}
          >
            <View className="flex-row items-center gap-3">
              <View
                className="w-10 h-10 rounded-xl items-center justify-center"
                style={{ backgroundColor: 'rgba(99,102,241,0.2)' }}
              >
                <Award size={20} color="#6366f1" />
              </View>
              <View>
                <Text className="text-foreground font-medium text-sm">First Steps Badge</Text>
                <Text className="text-muted-foreground text-xs">Completed 10+ sessions</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Menu sections */}
        <View className="px-5 pb-4">
          {MENU_ITEMS.map((section) => (
            <View key={section.section} className="mb-4">
              <Text className="text-xs text-muted-foreground uppercase mb-2 px-1" style={{ letterSpacing: 1 }}>
                {section.section}
              </Text>
              <View className="bg-card rounded-2xl border border-border overflow-hidden">
                {section.items.map((item, index) => (
                  <TouchableOpacity
                    key={item.label}
                    className="flex-row items-center justify-between p-4"
                    style={
                      index !== section.items.length - 1
                        ? { borderBottomWidth: 1, borderBottomColor: 'rgba(58,58,85,0.3)' }
                        : undefined
                    }
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center gap-3">
                      <item.icon size={20} color={item.danger ? '#ef4444' : '#9898aa'} />
                      <Text
                        className="text-sm"
                        style={{ color: item.danger ? '#ef4444' : '#f2f2f5' }}
                      >
                        {item.label}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                      {item.value ? (
                        <Text className="text-xs text-muted-foreground">{item.value}</Text>
                      ) : null}
                      <ChevronRight size={16} color="#9898aa" />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <BottomNav active="Profile" />
    </SafeAreaView>
  );
}
