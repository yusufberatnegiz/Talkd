# Tech Stack & Setup — Talkd

## ⚠️ Expo Version Lock
**Expo 54.0.33 is locked. Do not run `expo upgrade`. Do not change the expo version.**

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

# NativeWind v4
npm install nativewind@^4.0.0 tailwindcss
npx tailwindcss init

# Zustand
npm install zustand

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
npm install -D typescript @types/react @types/react-native eslint
```

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

## NativeWind v4 Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Talkd brand colors
        primary: '#6366F1',       // Indigo
        'primary-dark': '#4F46E5',
      },
    },
  },
};
```

```typescript
// babel.config.js — Add NativeWind plugin
module.exports = {
  presets: ['babel-preset-expo'],
  plugins: ['nativewind/babel'],
};
```

Usage:
```typescript
// Dark mode works automatically with system theme
<View className="flex-1 bg-white dark:bg-gray-950">
  <Text className="text-gray-900 dark:text-white text-xl font-bold">
    Hello
  </Text>
</View>
```

---

## Auth: Apple + Email + Phone

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

// Phone OTP
async function signInWithPhone(phone: string) {
  return supabase.auth.signInWithOtp({ phone });
}
async function verifyOtp(phone: string, token: string) {
  return supabase.auth.verifyOtp({ phone, token, type: 'sms' });
}
```

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

// Send message (after moderation passes)
await chatChannel.send({
  type: 'broadcast',
  event: 'message',
  payload: { text, tempId, timestamp, senderId }
});

// Always unsubscribe on session end
await chatChannel.unsubscribe();
```

---

## OpenAI Moderation

```typescript
// lib/moderation.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,  // Required for Expo
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

## Zustand Store Pattern

```typescript
// store/matchStore.ts
import { create } from 'zustand';

interface MatchStore {
  selectedTopic: string | null;
  selectedRole: 'TALKER' | 'LISTENER' | null;
  selectedIntent: 'WANT_ADVICE' | 'WANT_TO_BE_HEARD' | null;
  sessionId: string | null;
  messages: Message[];           // NEVER persisted
  isOtherTyping: boolean;
  setTopic: (t: string) => void;
  setRole: (r: 'TALKER' | 'LISTENER') => void;
  setIntent: (i: 'WANT_ADVICE' | 'WANT_TO_BE_HEARD') => void;
  setSession: (id: string) => void;
  addMessage: (m: Message) => void;
  setTyping: (t: boolean) => void;
  clearSession: () => void;      // ALWAYS call on session end
}

export const useMatchStore = create<MatchStore>((set) => ({
  selectedTopic: null,
  selectedRole: null,
  selectedIntent: null,
  sessionId: null,
  messages: [],
  isOtherTyping: false,
  setTopic: (selectedTopic) => set({ selectedTopic }),
  setRole: (selectedRole) => set({ selectedRole }),
  setIntent: (selectedIntent) => set({ selectedIntent }),
  setSession: (sessionId) => set({ sessionId }),
  addMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
  setTyping: (isOtherTyping) => set({ isOtherTyping }),
  clearSession: () => set({
    sessionId: null,
    messages: [],          // Wipe all messages
    isOtherTyping: false,
  }),
}));
```

---

## TypeScript Config

```json
// tsconfig.json
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
export const SESSION_WARNING_SECONDS = 120;        // Warning at 2:00
export const MATCH_TIMEOUT_MS = 30_000;            // 30s → async fallback
export const ESTIMATED_TIME_THRESHOLD_S = 60;      // Only show estimate if < 60s
export const ASYNC_MESSAGE_EXPIRY_HOURS = 24;
export const REPORT_BAN_THRESHOLD = 3;
export const BAN_DURATION_HOURS = 24;
export const REENGAGEMENT_INACTIVE_HOURS = 48;
```

---

## Rating Labels

```typescript
// constants/ratingLabels.ts
export const RATING_LABELS = [
  'Felt heard',
  'Great listener',
  'Helpful advice',
  'Very supportive',
  'Awkward',
  'Left too early',
  'Not helpful',
];
```

---

## Environment Variables

```bash
# .env
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
EXPO_PUBLIC_OPENAI_API_KEY=sk-...
EXPO_PUBLIC_SENTRY_DSN=https://...
```
