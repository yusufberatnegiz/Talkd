# Tech Stack & Setup - Talkd

## Expo Version Lock
**Expo 54.0.33 is locked. Do not run `expo upgrade`. Do not change the Expo version.**

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
| Auth | Apple + Email implemented; Phone OTP TODO |
| Moderation | OpenAI Moderation API |
| Push | Expo Notifications |
| Error tracking | Sentry planned |

NativeWind/Tailwind is intentionally not part of this project.

---

## Project Initialization

```bash
# Create project with exact Expo version
npx create-expo-app@latest talkd-mobile --template expo-template-blank-typescript
cd talkd-mobile
npm install expo@54.0.33

# Supabase
npm install @supabase/supabase-js
npx supabase init

# Auth (Apple Sign In)
npx expo install expo-apple-authentication

# Push Notifications
npx expo install expo-notifications expo-device

# Storage
npx expo install @react-native-async-storage/async-storage

# Moderation
npm install openai

# Error tracking
npm install @sentry/react-native
npx sentry-wizard -i reactNative

# Dev dependencies
npm install -D typescript @types/react eslint
```

Do not install `nativewind` or `tailwindcss` unless the project owner explicitly changes the styling decision.

---

## Supabase Setup

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

---

## Styling Pattern

Use React Native style objects and shared theme tokens from `lib/theme.ts`.

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

Do not use `className` styling. Do not add Tailwind config.

---

## Auth: Apple + Email + Phone OTP TODO

```typescript
// Sign in with Apple
import * as AppleAuthentication from 'expo-apple-authentication';

async function signInWithApple() {
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [AppleAuthentication.AppleAuthenticationScope.EMAIL],
  });
  return supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: credential.identityToken!,
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

## Supabase Realtime (Chat + Matching)

```typescript
// Match queue channel
const queueChannel = supabase.channel(`match-queue:${topic}:${role}`, {
  config: { broadcast: { self: false } }
});

// Chat session channel
const chatChannel = supabase.channel(`session:${sessionId}`, {
  config: { broadcast: { self: false } }
});

// Send chat message only after moderation passes
await chatChannel.send({
  type: 'broadcast',
  event: 'message',
  payload: { text, tempId, timestamp, senderId }
});

// Always unsubscribe/remove on session end
await supabase.removeChannel(chatChannel);
```

---

## OpenAI Moderation

```typescript
// lib/moderation.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export async function moderateMessage(text: string): Promise<{
  isSafe: boolean;
  isCrisis: boolean;
}> {
  const result = await openai.moderations.create({ input: text });
  const output = result.results[0];
  const isCrisis = Boolean(
    output.categories['self-harm'] ||
    output.categories['self-harm/intent'] ||
    output.categories['self-harm/instructions']
  );
  return { isSafe: !output.flagged, isCrisis };
}
```

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
export const MATCH_TIMEOUT_MS = 90_000;           // 90s -> async fallback
export const ESTIMATED_TIME_THRESHOLD_S = 60;
export const ASYNC_MESSAGE_EXPIRY_HOURS = 24;
export const REPORT_BAN_THRESHOLD = 3;
export const BAN_DURATION_HOURS = 24;
export const REENGAGEMENT_INACTIVE_HOURS = 48;
```

Do not change `MATCH_TIMEOUT_MS` unless explicitly instructed.

---

## Environment Variables

```bash
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
EXPO_PUBLIC_OPENAI_API_KEY=sk-...
EXPO_PUBLIC_SENTRY_DSN=https://...
```
