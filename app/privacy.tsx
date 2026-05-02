import { supabase } from '@/lib/supabase';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PrivacyScreen() {
  const t = useTheme();
  const router = useRouter();
  const [exportMessage, setExportMessage] = useState(false);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace('/auth');
  }

  function handleExport() {
    setExportMessage(true);
    setTimeout(() => setExportMessage(false), 2000);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      {/* Back */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 4, flexDirection: 'row', alignItems: 'center', gap: 6 }}
      >
        <Text style={{ fontSize: 18, color: t.ink3 }}>←</Text>
        <Text style={{ fontSize: 13, color: t.ink3 }}>Back</Text>
      </TouchableOpacity>

      {/* Header */}
      <View style={{ paddingHorizontal: 28, paddingTop: 28, paddingBottom: 28 }}>
        <Text style={{ fontSize: 11, letterSpacing: 2.2, color: t.ink4, textTransform: 'uppercase', marginBottom: 14 }}>
          Account
        </Text>
        <Text style={{ fontFamily: 'Georgia', fontSize: 40, lineHeight: 44, letterSpacing: -0.8, color: t.ink }}>
          Privacy & data
        </Text>
      </View>

      {/* Items */}
      <View style={{ paddingHorizontal: 20, gap: 10 }}>

        {/* Export */}
        <View style={{ borderRadius: 16, backgroundColor: t.bg3, borderWidth: 0.5, borderColor: t.line, overflow: 'hidden' }}>
          <TouchableOpacity
            onPress={handleExport}
            style={{ paddingHorizontal: 20, paddingVertical: 18 }}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 15, fontWeight: '500', color: t.ink }}>Export my data</Text>
            <Text style={{ fontSize: 12.5, color: t.ink3, marginTop: 3 }}>
              Download a copy of your session activity and ratings.
            </Text>
          </TouchableOpacity>
          {exportMessage && (
            <View style={{ paddingHorizontal: 20, paddingBottom: 14 }}>
              <Text style={{ fontSize: 12, color: t.amber, letterSpacing: 0.2 }}>Coming soon.</Text>
            </View>
          )}
        </View>

        {/* Sign out */}
        <View style={{ borderRadius: 16, backgroundColor: t.bg3, borderWidth: 0.5, borderColor: t.red + '40', overflow: 'hidden' }}>
          <TouchableOpacity
            onPress={handleSignOut}
            style={{ paddingHorizontal: 20, paddingVertical: 18 }}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 15, fontWeight: '500', color: t.red }}>Sign out</Text>
            <Text style={{ fontSize: 12.5, color: t.ink3, marginTop: 3 }}>
              Signs you out on this device. Your account remains active.
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}
