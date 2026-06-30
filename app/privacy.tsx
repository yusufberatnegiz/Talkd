import { deleteOwnAccount } from '@/lib/accountDeletion';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Modal, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PrivacyScreen() {
  const t = useTheme();
  const router = useRouter();
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace('/auth');
  }

  async function handleDeleteAccount() {
    setDeleteError('');
    setDeleting(true);
    try {
      await deleteOwnAccount();
      setConfirmDeleteOpen(false);
      router.replace('/auth');
    } catch {
      setDeleteError('Account could not be deleted. Check your connection and try again.');
    } finally {
      setDeleting(false);
    }
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
        {/* Account deletion */}
        <View style={{ borderRadius: 16, backgroundColor: t.bg3, borderWidth: 0.5, borderColor: t.line, overflow: 'hidden' }}>
          <TouchableOpacity
            onPress={() => {
              setDeleteError('');
              setConfirmDeleteOpen(true);
            }}
            style={{ paddingHorizontal: 20, paddingVertical: 18 }}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 15, fontWeight: '500', color: t.red }}>Delete account</Text>
            <Text style={{ fontSize: 12.5, color: t.ink3, marginTop: 3, lineHeight: 18 }}>
              Deletes your sign-in account. Session metadata, reports, and ratings may remain for safety with account identifiers removed where possible.
            </Text>
          </TouchableOpacity>
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

      <Modal
        visible={confirmDeleteOpen}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!deleting) setConfirmDeleteOpen(false);
        }}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.62)', justifyContent: 'center', padding: 24 }}>
          <View style={{ borderRadius: 16, backgroundColor: t.bg2, borderWidth: 0.5, borderColor: t.line, padding: 20 }}>
            <Text style={{ fontFamily: 'Georgia', fontSize: 28, lineHeight: 32, color: t.ink }}>
              Delete account?
            </Text>
            <Text style={{ fontSize: 13.5, color: t.ink3, lineHeight: 20, marginTop: 10 }}>
              You will be signed out and this sign-in account will be deleted. Some safety and session metadata may remain without your account identity.
            </Text>
            {!!deleteError && (
              <Text style={{ fontSize: 12.5, color: t.red, lineHeight: 18, marginTop: 12 }}>
                {deleteError}
              </Text>
            )}

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
              <TouchableOpacity
                onPress={() => setConfirmDeleteOpen(false)}
                disabled={deleting}
                style={{
                  flex: 1,
                  borderRadius: 99,
                  paddingVertical: 14,
                  alignItems: 'center',
                  borderWidth: 0.5,
                  borderColor: t.lineStrong,
                }}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: t.ink2 }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { void handleDeleteAccount(); }}
                disabled={deleting}
                style={{
                  flex: 1,
                  borderRadius: 99,
                  paddingVertical: 14,
                  alignItems: 'center',
                  backgroundColor: deleting ? t.bg4 : t.red,
                }}
                activeOpacity={0.8}
              >
                {deleting
                  ? <ActivityIndicator color={t.ink4} />
                  : <Text style={{ fontSize: 14, fontWeight: '700', color: t.onAccent }}>Delete</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
