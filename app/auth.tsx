import * as AppleAuthentication from 'expo-apple-authentication';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/hooks/useTheme';

type Mode = 'signin' | 'signup';

export default function AuthScreen() {
  const t = useTheme();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const clearError = () => { if (error) setError(''); };

  async function handleApple() {
    setError('');
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [AppleAuthentication.AppleAuthenticationScope.EMAIL],
      });
      const { error: authError } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken!,
      });
      if (authError) setError(authError.message);
    } catch (e: unknown) {
      const err = e as { code?: string };
      if (err.code !== 'ERR_REQUEST_CANCELED') setError('Apple sign in failed.');
    }
  }

  async function handleEmail() {
    if (!email.trim() || !password) { setError('Enter your email and password.'); return; }
    setLoading(true);
    setError('');
    const { error: authError } = mode === 'signup'
      ? await supabase.auth.signUp({ email: email.trim(), password })
      : await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (authError) { setError(authError.message); return; }
    router.replace('/(tabs)');
  }

  const inputStyle = {
    backgroundColor: t.bg3, borderWidth: 0.5, borderColor: t.line,
    borderRadius: 14, padding: 16, color: t.ink, fontSize: 15,
    marginBottom: 10,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={{ flex: 1, paddingHorizontal: 28, justifyContent: 'center' }}>

          {/* Heading */}
          <Text style={{ fontFamily: 'Georgia', fontStyle: 'italic', fontSize: 38, letterSpacing: -0.8, color: t.ink, marginBottom: 8 }}>
            {mode === 'signin' ? 'Welcome back.' : 'Join talkd.'}
          </Text>
          <Text style={{ fontSize: 14, color: t.ink3, marginBottom: 40, lineHeight: 20 }}>
            {mode === 'signin'
              ? 'Sign in to continue your anonymous conversations.'
              : 'Create an account — you\'ll always appear as Anonymous.'}
          </Text>

          {/* Apple Sign In */}
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
            cornerRadius={99}
            style={{ width: '100%', height: 52, marginBottom: 20 }}
            onPress={handleApple}
          />

          {/* Divider */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <View style={{ flex: 1, height: 0.5, backgroundColor: t.line }} />
            <Text style={{ fontSize: 11, letterSpacing: 1.5, color: t.ink4, textTransform: 'uppercase' }}>or</Text>
            <View style={{ flex: 1, height: 0.5, backgroundColor: t.line }} />
          </View>

          {/* Email + Password */}
          <TextInput
            value={email}
            onChangeText={v => { setEmail(v); clearError(); }}
            placeholder="Email"
            placeholderTextColor={t.ink4}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            style={inputStyle}
          />
          <TextInput
            value={password}
            onChangeText={v => { setPassword(v); clearError(); }}
            placeholder="Password"
            placeholderTextColor={t.ink4}
            secureTextEntry
            style={inputStyle}
          />

          {/* Error */}
          {error ? (
            <Text style={{ fontSize: 12.5, color: t.red, marginBottom: 12, lineHeight: 18 }}>{error}</Text>
          ) : null}

          {/* CTA */}
          <TouchableOpacity
            onPress={handleEmail}
            disabled={loading}
            style={{ paddingVertical: 16, borderRadius: 99, alignItems: 'center', backgroundColor: t.amber, marginTop: 4 }}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color={t.bg} />
              : <Text style={{ fontSize: 15, fontWeight: '600', color: t.bg, letterSpacing: -0.1 }}>
                  {mode === 'signin' ? 'Sign in' : 'Create account'}
                </Text>
            }
          </TouchableOpacity>

          {/* Mode toggle */}
          <TouchableOpacity
            onPress={() => { setMode(m => m === 'signin' ? 'signup' : 'signin'); setError(''); }}
            style={{ alignItems: 'center', marginTop: 20 }}
          >
            <Text style={{ fontSize: 13, color: t.ink3 }}>
              {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
              <Text style={{ color: t.amber }}>
                {mode === 'signin' ? 'Sign up' : 'Sign in'}
              </Text>
            </Text>
          </TouchableOpacity>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
