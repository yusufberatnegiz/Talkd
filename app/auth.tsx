import * as AppleAuthentication from 'expo-apple-authentication';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/hooks/useTheme';
import { Sentry } from '@/lib/sentry';

type Mode = 'signin' | 'signup';

const EMAIL_PATTERN = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const TURKISH_LETTER_PATTERN = /[çğıöşüÇĞİÖŞÜ]/;
const NON_ASCII_PATTERN = /[^\x20-\x7E]/;

function validateEmail(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return 'Enter your email address.';
  if (/\s/.test(trimmed)) return 'Email cannot contain spaces.';
  if (TURKISH_LETTER_PATTERN.test(trimmed)) {
    return 'Use an email with English letters only. Turkish characters like ç, ğ, ı, ö, ş, or ü are not supported for sign in.';
  }
  if (NON_ASCII_PATTERN.test(trimmed)) {
    return 'Use an email with standard English letters, numbers, and symbols only.';
  }
  if (!EMAIL_PATTERN.test(trimmed)) return 'Enter a valid email address, like name@example.com.';
  return null;
}

function validatePassword(value: string, mode: Mode): string | null {
  if (!value) return 'Enter your password.';
  if (mode === 'signup' && value.length < 6) return 'Password must be at least 6 characters.';
  return null;
}

function getAuthErrorMessage(message: string, mode: Mode): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) {
    return 'No account was found for that email, or the password is incorrect.';
  }
  if (m.includes('email not confirmed')) {
    return 'This email is registered but not confirmed yet. Open the confirmation email, then sign in.';
  }
  if (m.includes('already registered') || m.includes('already exists') || m.includes('user already registered')) {
    return 'This email already has a Talkd account. Switch to sign in instead.';
  }
  if (m.includes('password') && (m.includes('six') || m.includes('6') || m.includes('short'))) {
    return 'That password is too short. Use at least 6 characters.';
  }
  if (m.includes('invalid') && m.includes('email')) {
    return 'That email address does not look valid. Use something like name@example.com.';
  }
  if (m.includes('rate limit') || m.includes('too many')) {
    return 'Too many sign-in attempts. Wait a moment, then try again.';
  }
  if (m.includes('network') || m.includes('fetch')) {
    return 'Could not connect. Check your internet connection and try again.';
  }
  return mode === 'signup'
    ? 'Could not create the account. Check your email and password, then try again.'
    : 'Could not sign in. Check your email and password, then try again.';
}

function getErrorCode(error: unknown): string | null {
  if (typeof error !== 'object' || error === null || !('code' in error)) return null;
  const code = error.code;
  return typeof code === 'string' ? code : null;
}

function getErrorMessage(error: unknown): string | null {
  if (typeof error !== 'object' || error === null || !('message' in error)) return null;
  const message = error.message;
  return typeof message === 'string' ? message : null;
}

export default function AuthScreen() {
  const t = useTheme();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [appleAvailable, setAppleAvailable] = useState(false);
  const [error, setError] = useState('');
  const [checkEmail, setCheckEmail] = useState(false);

  const clearError = () => { if (error) setError(''); };

  useEffect(() => {
    let isMounted = true;

    AppleAuthentication.isAvailableAsync()
      .then(isAvailable => {
        if (isMounted) setAppleAvailable(isAvailable);
      })
      .catch((availabilityError: unknown) => {
        console.warn('Could not check Apple sign in availability', availabilityError);
        Sentry.captureException(availabilityError);
        if (isMounted) setAppleAvailable(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleApple() {
    if (appleLoading) return;
    setError('');
    setAppleLoading(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [AppleAuthentication.AppleAuthenticationScope.EMAIL],
      });
      if (!credential.identityToken) {
        setError('Apple did not return a sign-in token. Please try again.');
        return;
      }
      const { error: authError } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
      });
      if (authError) {
        console.warn('Apple sign in was rejected by Supabase', authError);
        Sentry.captureException(authError);
        setError(__DEV__
          ? `Apple sign in failed: ${authError.message}`
          : 'Apple sign in could not be completed. Please try again.');
      }
    } catch (e: unknown) {
      if (getErrorCode(e) !== 'ERR_REQUEST_CANCELED') {
        console.warn('Apple sign in failed before Supabase auth', e);
        Sentry.captureException(e);
        const message = getErrorMessage(e);
        setError(__DEV__ && message ? `Apple sign in failed: ${message}` : 'Apple sign in failed.');
      }
    } finally {
      setAppleLoading(false);
    }
  }

  async function handleEmail() {
    const cleanEmail = email.trim().toLowerCase();
    const emailError = validateEmail(email);
    if (emailError) { setError(emailError); return; }
    const passwordError = validatePassword(password, mode);
    if (passwordError) { setError(passwordError); return; }
    setLoading(true);
    setError('');
    try {
      const { data, error: authError } = mode === 'signup'
        ? await supabase.auth.signUp({ email: cleanEmail, password })
        : await supabase.auth.signInWithPassword({ email: cleanEmail, password });
      if (authError) { setError(getAuthErrorMessage(authError.message, mode)); return; }
      if (mode === 'signup' && !data.session) {
        setCheckEmail(true);
        return;
      }
      router.replace('/(tabs)');
    } catch {
      setError('Could not connect. Check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  if (checkEmail) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
        <View style={{ flex: 1, paddingHorizontal: 28, justifyContent: 'center' }}>
          <Text style={{ fontFamily: 'Georgia', fontStyle: 'italic', fontSize: 38, letterSpacing: -0.8, color: t.ink, marginBottom: 10 }}>
            Check your email.
          </Text>
          <Text style={{ fontSize: 14, color: t.ink3, marginBottom: 28, lineHeight: 21 }}>
            Confirm your account, then come back and sign in. You will still appear as Anonymous in Talkd.
          </Text>
          <TouchableOpacity
            onPress={() => {
              setCheckEmail(false);
              setMode('signin');
              setPassword('');
              setError('');
            }}
            style={{ paddingVertical: 16, borderRadius: 99, alignItems: 'center', backgroundColor: t.amber }}
            activeOpacity={0.85}
          >
            <Text style={{ fontSize: 15, fontWeight: '600', color: t.onAccent, letterSpacing: -0.1 }}>
              Back to sign in
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
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

          {appleAvailable && (
            <>
              {/* Apple Sign In */}
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
                cornerRadius={99}
                style={{ width: '100%', height: 52, marginBottom: 20, opacity: appleLoading ? 0.65 : 1 }}
                onPress={handleApple}
              />

              {/* Divider */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <View style={{ flex: 1, height: 0.5, backgroundColor: t.line }} />
                <Text style={{ fontSize: 11, letterSpacing: 1.5, color: t.ink4, textTransform: 'uppercase' }}>or</Text>
                <View style={{ flex: 1, height: 0.5, backgroundColor: t.line }} />
              </View>
            </>
          )}

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
              : <Text style={{ fontSize: 15, fontWeight: '600', color: t.onAccent, letterSpacing: -0.1 }}>
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
