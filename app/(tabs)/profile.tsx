import { BottomNav } from '@/components/BottomNav';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/hooks/useTheme';
import { useUserStats } from '@/hooks/useUserStats';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import {
  Bell, ChevronRight, HelpCircle,
  LogOut, MessageSquare, Moon, Shield,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Linking, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type AppearanceChoice = 'light' | 'dark' | 'system';
const APPEARANCE_KEY = 'talkd:appearance';
const APPEARANCE_LABEL: Record<AppearanceChoice, string> = {
  system: 'Auto',
  light: 'Light',
  dark: 'Dark',
};

function AppearanceSheet({ current, onSelect, onClose }: {
  current: AppearanceChoice;
  onSelect: (c: AppearanceChoice) => void;
  onClose: () => void;
}) {
  const t = useTheme();
  const options: { key: AppearanceChoice; label: string }[] = [
    { key: 'system', label: 'System default' },
    { key: 'light',  label: 'Light' },
    { key: 'dark',   label: 'Dark' },
  ];
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' }}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity activeOpacity={1} onPress={e => e.stopPropagation()}>
          <View style={{
            backgroundColor: t.bg2, borderTopLeftRadius: 28, borderTopRightRadius: 28,
            padding: 20, paddingBottom: 36, borderTopWidth: 0.5, borderColor: t.line,
          }}>
            <View style={{ width: 36, height: 4, borderRadius: 99, backgroundColor: t.ink5, alignSelf: 'center', marginBottom: 18 }} />
            <Text style={{ fontFamily: 'Georgia', fontStyle: 'italic', fontSize: 26, color: t.ink, letterSpacing: -0.3, marginBottom: 16 }}>
              Appearance
            </Text>
            <View style={{ gap: 6 }}>
              {options.map(o => {
                const active = current === o.key;
                return (
                  <TouchableOpacity
                    key={o.key}
                    onPress={() => { onSelect(o.key); onClose(); }}
                    style={{
                      padding: 14, borderRadius: 14,
                      backgroundColor: active ? t.amberSoft : t.bg3,
                      borderWidth: active ? 1 : 0.5,
                      borderColor: active ? t.amber + '60' : t.line,
                      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={{ fontSize: 15, color: active ? t.amber : t.ink }}>{o.label}</Text>
                    {active && <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: t.amber }} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

type MenuItem = { icon: LucideIcon; label: string; value?: string; destructive?: boolean; onPress?: () => void };
type MenuSection = { section: string; items: MenuItem[] };

export default function ProfileScreen() {
  const t = useTheme();
  const router = useRouter();
  const [appearance, setAppearanceState] = useState<AppearanceChoice>('system');
  const [appearanceOpen, setAppearanceOpen] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(APPEARANCE_KEY).then(val => {
      if (val === 'light' || val === 'dark' || val === 'system') setAppearanceState(val);
    });
  }, []);

  async function handleAppearanceSelect(choice: AppearanceChoice) {
    await AsyncStorage.setItem(APPEARANCE_KEY, choice);
    setAppearanceState(choice);
  }

  const MENU: MenuSection[] = [
    {
      section: 'Preferences',
      items: [
        { icon: Bell, label: 'Notifications', value: 'On', onPress: () => Linking.openSettings() },
        { icon: Moon, label: 'Appearance', value: APPEARANCE_LABEL[appearance], onPress: () => setAppearanceOpen(true) },
        { icon: Shield, label: 'Privacy & data', onPress: () => router.push('/privacy' as never) },
      ],
    },
    {
      section: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help center' },
        { icon: MessageSquare, label: 'Become a listener', onPress: () => router.push('/listener' as never) },
      ],
    },
  ];
  const { stats, loading } = useUserStats();

  const dash = '—';
  function fmtTime(m: number) {
    if (m < 60) return `${m}m`;
    const h = m / 60;
    return Number.isInteger(h) ? `${h}h` : `${h.toFixed(1)}h`;
  }
  const profileStats = [
    { v: loading ? dash : String(stats.sessions), l: 'Chats' },
    { v: loading ? dash : fmtTime(stats.totalMinutes), l: 'Time' },
    { v: loading ? dash : stats.avgRating !== null ? String(stats.avgRating) : dash, l: 'Rating' },
  ];

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace('/auth');
  }

  function Row({ icon: Icon, label, value, destructive = false, onPress }: MenuItem) {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 }}
        activeOpacity={0.7}
      >
        <View style={{
          height: 32, width: 32, borderRadius: 8,
          backgroundColor: destructive ? t.red + '1A' : t.bg4,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={16} color={destructive ? t.red : t.ink3} strokeWidth={2} />
        </View>
        <Text style={{ flex: 1, fontSize: 14.5, fontWeight: '500', color: destructive ? t.red : t.ink }}>
          {label}
        </Text>
        {value ? <Text style={{ fontSize: 13, color: t.ink4 }}>{value}</Text> : null}
        <ChevronRight size={16} color={t.ink4} style={{ opacity: 0.6 }} />
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8 }}>

        {/* Header */}
        <View style={{ paddingHorizontal: 28, paddingTop: 48, paddingBottom: 20 }}>
          <Text style={{ fontSize: 11, letterSpacing: 2.2, color: t.ink4, textTransform: 'uppercase', marginBottom: 14 }}>
            Account
          </Text>
          <Text style={{ fontFamily: 'Georgia', fontSize: 40, lineHeight: 44, letterSpacing: -0.8, color: t.ink }}>
            You
          </Text>
        </View>

        {/* Listen tonight — promoted to top */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <TouchableOpacity
            onPress={() => router.push('/listener' as never)}
            style={{
              borderRadius: 16, padding: 18,
              backgroundColor: t.bg3, borderWidth: 0.5, borderColor: t.coral + '50',
              flexDirection: 'row', alignItems: 'center', gap: 14,
            }}
            activeOpacity={0.85}
          >
            <View style={{
              width: 44, height: 44, borderRadius: 12,
              backgroundColor: t.coral + '18', borderWidth: 0.5, borderColor: t.coral + '44',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: t.coral }} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '500', color: t.coral }}>Listen to someone tonight</Text>
              <Text style={{ fontSize: 12.5, color: t.ink3, marginTop: 2 }}>Help out · 10–15 min each</Text>
            </View>
            <ChevronRight size={16} color={t.ink4} style={{ opacity: 0.6 }} />
          </TouchableOpacity>
        </View>

        {/* Identity card */}
        <View style={{ paddingHorizontal: 20 }}>
          <View style={{
            borderRadius: 16, backgroundColor: t.bg3, borderWidth: 0.5, borderColor: t.line,
            padding: 20, alignItems: 'center',
          }}>
            <View style={{
              height: 72, width: 72, borderRadius: 36,
              backgroundColor: t.bg4, borderWidth: 0.5, borderColor: t.lineStrong,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Text style={{ fontFamily: 'Georgia', fontStyle: 'italic', fontSize: 24, color: t.ink3 }}>A</Text>
            </View>
            <Text style={{ fontFamily: 'Georgia', fontSize: 20, fontWeight: '600', color: t.ink, marginTop: 12 }}>
              Anonymous User
            </Text>
            <View style={{ marginTop: 20, flexDirection: 'row', width: '100%' }}>
              {profileStats.map(({ v, l }, i) => (
                <View key={l} style={[
                  { flex: 1, alignItems: 'center' },
                  i > 0 ? { borderLeftWidth: 0.5, borderLeftColor: t.line } : undefined,
                ]}>
                  <Text style={{ fontFamily: 'Georgia', fontSize: 20, fontWeight: '600', color: t.ink, lineHeight: 22 }}>{v}</Text>
                  <Text style={{ marginTop: 4, fontSize: 11, color: t.ink4 }}>{l}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Menu sections */}
        {MENU.map((section) => (
          <View key={section.section} style={{ paddingHorizontal: 20, marginTop: 28 }}>
            <Text style={{ fontSize: 11, fontWeight: '600', letterSpacing: 1.4, color: t.ink4, textTransform: 'uppercase', marginBottom: 8, paddingLeft: 4 }}>
              {section.section}
            </Text>
            <View style={{ borderRadius: 12, backgroundColor: t.bg3, borderWidth: 0.5, borderColor: t.line, overflow: 'hidden' }}>
              {section.items.map((item, i) => (
                <View key={item.label} style={i < section.items.length - 1 ? { borderBottomWidth: 0.5, borderBottomColor: t.line } : undefined}>
                  <Row {...item} />
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Sign out */}
        <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
          <View style={{ borderRadius: 12, backgroundColor: t.bg3, borderWidth: 0.5, borderColor: t.line, overflow: 'hidden' }}>
            <Row icon={LogOut} label="Sign out" destructive onPress={handleSignOut} />
          </View>
          <Text style={{ marginTop: 12, textAlign: 'center', fontSize: 11, color: t.ink4 }}>
            Talkd · v1.0.0
          </Text>
        </View>
      </ScrollView>

      <BottomNav active="You" />
      {appearanceOpen && (
        <AppearanceSheet
          current={appearance}
          onSelect={handleAppearanceSelect}
          onClose={() => setAppearanceOpen(false)}
        />
      )}
    </SafeAreaView>
  );
}
