# Tech Stack & Setup - Talkd

## Expo Version Lock

**Expo 54.0.33 is locked. Do not run `expo upgrade`. Do not change the Expo version.**

Talkd is iOS-first for MVP.

---

## Current Stack

| Area | Choice |
|---|---|
| Mobile | React Native + Expo 54.0.33 |
| Routing | Expo Router |
| Language | TypeScript strict |
| Styling | React Native inline styles + shared theme tokens |
| Theme | `useTheme()` and `useAppearance()` |
| Backend/Auth/Realtime | Supabase v2 |
| Database | Supabase Postgres |
| Auth | Apple + Email implemented; Phone OTP TODO |
| Moderation | OpenAI Moderation API through Supabase Edge Function |
| Push | Expo Notifications |
| Error tracking | Sentry planned |

NativeWind/Tailwind is intentionally not part of this project.

---

## Locked Decisions

- Expo must remain **54.0.33**.
- Do not run `expo upgrade`.
- Do not change the Expo version in `package.json`.
- Do not add NativeWind or Tailwind.
- Do not use `className` styling.
- Do not add Socket.io.
- Do not replace Supabase.
- Do not install new dependencies without explaining why first.
- Do not expose server-side secrets in the Expo client.

---

## Project Initialization Reference

This section is reference only. Do not use it to upgrade the project.

```bash
# Create project with exact Expo version
npx create-expo-app@latest talkd-mobile --template expo-template-blank-typescript
cd talkd-mobile
npm install expo@54.0.33

# Supabase
npm install @supabase/supabase-js
npx supabase init

# Auth - Apple Sign In
npx expo install expo-apple-authentication

# Push Notifications
npx expo install expo-notifications expo-device

# Storage
npx expo install @react-native-async-storage/async-storage

# Error tracking
npm install @sentry/react-native
npx sentry-wizard -i reactNative

# Dev dependencies
npm install -D typescript @types/react eslint
```

Do not install `nativewind` or `tailwindcss` unless the project owner explicitly changes the styling decision.

---

## Supabase Client Setup

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
```

Allowed public Expo variables:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
EXPO_PUBLIC_SENTRY_DSN=https://...
```

Never expose:

```bash
EXPO_PUBLIC_OPENAI_API_KEY
EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
SERVICE_ROLE_KEY
OPENAI_API_KEY
```

`OPENAI_API_KEY` and service-role keys must only exist as Supabase Edge Function secrets or server-side environment variables.

---

## Styling Pattern

Use React Native style objects and shared theme tokens.

```typescript
import { useTheme } from '@/hooks/useTheme';
import { Text, View } from 'react-native';

export function Example() {
  const t = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: t.bg, padding: 20 }}>
      <Text style={{ color: t.ink, fontSize: 18, fontWeight: '600' }}>
        Hello
      </Text>
    </View>
  );
}
```

Do not use `className`. Do not add Tailwind config.

---

## Auth: Apple + Email + Phone OTP TODO

```typescript
// Sign in with Apple
import * as AppleAuthentication from 'expo-apple-authentication';

async function signInWithApple() {
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [AppleAuthentication.AppleAuthenticationScope.EMAIL],
  });

  if (!credential.identityToken) {
    throw new Error('Apple identity token was not returned.');
  }

  return supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: credential.identityToken,
  });
}

// Email
async function signUpWithEmail(email: string, password: string) {
  return supabase.auth.signUp({ email, password });
}

async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

// Phone OTP - TODO
async function signInWithPhone(phone: string) {
  return supabase.auth.signInWithOtp({ phone });
}

async function verifyOtp(phone: string, token: string) {
  return supabase.auth.verifyOtp({ phone, token, type: 'sms' });
}
```

Email signup must handle the case where email verification is required and no session is returned.

---

## Current Topics

Keep the current 6 topics unless explicitly instructed otherwise:

- Mental Health
- Relationships
- Career & Decisions
- Late-Night
- General Advice
- Anything

Source of truth: `constants/topics.ts`.

---

## Realtime Usage

Supabase Realtime can be used for:

- ephemeral chat messages
- typing indicators
- presence
- non-sensitive session signals

Supabase Realtime must not be the only source of truth for:

- final production matchmaking decisions
- reports
- ratings
- bans
- account deletion
- abuse enforcement

Preferred architecture:

```text
Matchmaking decision: database RPC or Edge Function
Live message relay: Supabase Realtime
Safety records: database with RLS
Moderation: Supabase Edge Function
```

---

## Chat Realtime Pattern

```typescript
const chatChannel = supabase.channel(`session:${sessionId}`, {
  config: { broadcast: { self: false } },
});

// Send chat message only after moderation passes.
await chatChannel.send({
  type: 'broadcast',
  event: 'message',
  payload: { text, tempId, timestamp, senderId },
});

// Always unsubscribe/remove on session end.
await supabase.removeChannel(chatChannel);
```

Messages must not be inserted into the database.

---

## Moderation

Moderation must run before every outbound chat message.

The mobile app must not create an OpenAI client.  
The mobile app must not contain an OpenAI API key.

Correct client pattern:

```typescript
export async function moderateMessage(text: string): Promise<{
  isSafe: boolean;
  isCrisis: boolean;
}> {
  const { data, error } = await supabase.functions.invoke('moderate-message', {
    body: { text },
  });

  if (error) {
    throw new Error('Moderation failed. Please try again.');
  }

  return {
    isSafe: Boolean(data?.isSafe),
    isCrisis: Boolean(data?.isCrisis),
  };
}
```

The Supabase Edge Function uses the private `OPENAI_API_KEY` secret.

Never create an OpenAI client in the mobile app. Never use public Expo variables for OpenAI keys. Never enable browser-style OpenAI client usage in Expo.

---

## Supabase Edge Function Secrets

Set the private `OPENAI_API_KEY` as a Supabase Edge Function secret through the Supabase dashboard or CLI. Do not put the value in source files, Expo public variables, or committed docs.

Deploy function:

```bash
npx.cmd supabase functions deploy moderate-message
```

Do not commit `.env` files containing secrets.

---

## TypeScript Config

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

`any` is forbidden. Use `unknown` with type guards.

---

## Session Constants

```typescript
// constants/config.ts
export const SESSION_DURATION_SECONDS = 900;      // 15 minutes
export const SESSION_WARNING_SECONDS = 120;       // Warning at 2:00
export const MATCH_TIMEOUT_MS = 90_000;           // 90s -> no-match fallback
export const ESTIMATED_TIME_THRESHOLD_S = 60;
export const ASYNC_MESSAGE_EXPIRY_HOURS = 24;
export const REPORT_BAN_THRESHOLD = 3;
export const BAN_DURATION_HOURS = 24;
export const REENGAGEMENT_INACTIVE_HOURS = 48;
```

Do not change `MATCH_TIMEOUT_MS` unless explicitly instructed.
