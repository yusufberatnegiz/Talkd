# Talkd — Technical Design Document (TDD)
**Version:** 1.1 | **Status:** Final | **Date:** April 2026
**Expo Version:** 54.0.33 (locked — do not upgrade without explicit instruction)

---

## 1. System Overview

Talkd is a real-time anonymous peer-to-peer chat app built in React Native (Expo 54.0.33) for iOS.
Two users match by topic + role, chat for 15 minutes, then the session closes and messages are permanently deleted.

### Core Technical Constraints
- Messages must NOT persist after session ends
- Every outbound message passes AI moderation before delivery
- Match must occur in < 30 seconds or async fallback activates
- Anonymous display: all users shown as "Anonymous" to each other
- Expo version 54.0.33 is locked — do not change

---

## 2. Tech Stack

| Layer | Technology | Version | Notes |
|---|---|---|---|
| Mobile | React Native + Expo | **54.0.33 LOCKED** | Do not upgrade |
| Routing | Expo Router | v3 (included in 54) | File-based routing |
| Language | TypeScript | 5.x | Strict mode, zero `any` |
| Styling | NativeWind | v4 | Tailwind for RN |
| Theme | System default | - | useColorScheme() hook |
| State | Zustand | Latest stable | |
| Real-time | Supabase Realtime | v2 | Channels for chat + matching |
| Auth | Supabase Auth | v2 | Email + Phone + Apple |
| Database | Supabase (PostgreSQL) | v2 | Built-in Postgres |
| Push | Expo Notifications | 54-compatible | iOS APNs |
| Moderation | OpenAI Moderation API | Latest | Free, per-message |
| Analytics | Supabase Analytics + custom | - | Session + user events |
| Errors | Sentry | Latest 54-compatible | Crash reporting |

### Why Supabase All-in-One
- Replaces: Firebase Auth + PostgreSQL + Railway + Redis (for basic ops)
- Single dashboard, single bill, single SDK
- Supabase Realtime handles match queue broadcast + chat relay
- Free tier covers MVP comfortably

---

## 3. Project Structure

### Mobile (talkd-mobile)
```
talkd-mobile/
├── app/
│   ├── _layout.tsx               # Root layout + auth guard + theme provider
│   ├── index.tsx                 # Redirect logic
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   └── onboarding.tsx        # 3-step onboarding
│   └── (app)/
│       ├── _layout.tsx           # Authenticated layout
│       ├── home.tsx              # Category selection
│       ├── role-select.tsx       # Talker / Listener + intent
│       ├── matching.tsx          # Waiting screen + estimated time
│       ├── chat.tsx              # Active chat
│       ├── rating.tsx            # Post-session 1-5 stars + labels
│       ├── async-fallback.tsx    # Leave a message
│       └── settings.tsx          # Minimal settings
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── StarRating.tsx        # 1-5 star rating component
│   ├── chat/
│   │   ├── MessageBubble.tsx
│   │   ├── TypingIndicator.tsx
│   │   ├── SessionTimer.tsx      # 15 min countdown
│   │   └── ChatHeader.tsx        # Report + Exit always visible
│   ├── matching/
│   │   ├── CategoryCard.tsx
│   │   ├── RoleSelector.tsx
│   │   └── WaitingScreen.tsx     # Shows estimated time if < 60s
│   └── modals/
│       ├── CrisisPopup.tsx       # 5s lock, crisis resources
│       └── ReportConfirm.tsx
├── lib/
│   ├── supabase.ts               # Supabase client singleton
│   ├── moderation.ts             # OpenAI Moderation API
│   ├── notifications.ts          # Expo push notifications
│   └── storage.ts                # AsyncStorage helpers
├── hooks/
│   ├── useAuth.ts                # Supabase auth state
│   ├── useRealtime.ts            # Supabase Realtime channels
│   ├── useMatch.ts               # Match state machine
│   ├── useSession.ts             # Session timer + lifecycle
│   └── useTheme.ts               # System color scheme
├── store/
│   ├── authStore.ts
│   ├── matchStore.ts
│   └── settingsStore.ts
├── types/
│   ├── user.ts
│   ├── session.ts
│   ├── message.ts
│   └── realtime-events.ts        # Typed Supabase channel events
├── constants/
│   ├── categories.ts
│   ├── config.ts                 # SESSION_DURATION_SECONDS = 900
│   ├── ratingLabels.ts           # Post-session label options
│   └── crisis.ts                 # Hotline numbers
├── app.json                      # Expo 54.0.33 config
├── tsconfig.json                 # strict: true
└── package.json
```

---

## 4. Database Schema (Supabase PostgreSQL)

```sql
-- Users (managed by Supabase Auth + this table)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  -- No display name stored — all users shown as "Anonymous"
  is_banned BOOLEAN DEFAULT FALSE,
  ban_expires_at TIMESTAMPTZ,
  report_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions (metadata only — NO message content ever)
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic TEXT NOT NULL CHECK (topic IN ('MENTAL_HEALTH', 'RELATIONSHIPS', 'GENERAL_ADVICE')),
  user1_id UUID REFERENCES public.profiles(id),
  user2_id UUID REFERENCES public.profiles(id),
  user1_role TEXT NOT NULL CHECK (user1_role IN ('TALKER', 'LISTENER')),
  user2_role TEXT NOT NULL CHECK (user2_role IN ('TALKER', 'LISTENER')),
  user1_intent TEXT CHECK (user1_intent IN ('WANT_ADVICE', 'WANT_TO_BE_HEARD')),
  user2_intent TEXT CHECK (user2_intent IN ('WANT_ADVICE', 'WANT_TO_BE_HEARD')),
  status TEXT DEFAULT 'ACTIVE',
  duration_seconds INT DEFAULT 900,    -- 15 minutes
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  flagged_for_review BOOLEAN DEFAULT FALSE,  -- Crisis flag (no message content)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Post-session ratings (anonymous — no link to which user rated which)
CREATE TABLE public.session_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.sessions(id),
  stars INT NOT NULL CHECK (stars BETWEEN 1 AND 5),
  labels TEXT[],                       -- e.g. ["Felt heard", "Great listener"]
  created_at TIMESTAMPTZ DEFAULT NOW()
  -- NOTE: No user_id here — ratings are fully anonymous
);

-- Async messages (expire after 24 hours)
CREATE TABLE public.async_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES public.profiles(id),
  topic TEXT NOT NULL,
  sender_role TEXT NOT NULL,
  sender_intent TEXT,
  message_text TEXT NOT NULL,
  is_answered BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL,     -- NOW() + INTERVAL '24 hours'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reports
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES public.profiles(id),
  reported_user_id UUID REFERENCES public.profiles(id),
  session_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sessions_status ON public.sessions(status);
CREATE INDEX idx_async_messages_topic ON public.async_messages(topic, is_answered);
CREATE INDEX idx_async_messages_expires ON public.async_messages(expires_at);
CREATE INDEX idx_reports_reported ON public.reports(reported_user_id);
```

---

## 5. Supabase Realtime Architecture

Supabase Realtime replaces Socket.io. Uses broadcast channels.

```typescript
// Channel naming convention
`match-queue:${topic}:${role}`     // e.g. match-queue:MENTAL_HEALTH:TALKER
`session:${sessionId}`             // Active chat channel

// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);
```

### Match Queue Flow
```typescript
// hooks/useMatch.ts

// 1. Join queue — subscribe to match channel
const channel = supabase.channel(`match-queue:${topic}:${oppositeRole}`)
  .on('broadcast', { event: 'match_found' }, (payload) => {
    if (payload.payload.targetUserId === currentUserId) {
      // Navigate to chat
      router.push('/chat');
    }
  })
  .subscribe();

// 2. Broadcast presence to queue
await supabase.channel(`match-queue:${topic}:${role}`)
  .send({
    type: 'broadcast',
    event: 'user_waiting',
    payload: { userId, intent, joinedAt: Date.now() }
  });

// 3. After 30s with no match → async fallback
const timeout = setTimeout(() => {
  router.push('/async-fallback');
}, 30_000);
```

### Chat Channel Flow
```typescript
// In chat.tsx — messages relay via Supabase Realtime
const chatChannel = supabase.channel(`session:${sessionId}`)
  .on('broadcast', { event: 'message' }, (payload) => {
    // Message received from other user
    // NOTE: Not saved to DB — state only
    addMessage(payload.payload);
  })
  .on('broadcast', { event: 'typing' }, (payload) => {
    setIsTyping(payload.payload.isTyping);
  })
  .subscribe();

// Send message (ALWAYS moderate first)
async function sendMessage(text: string) {
  const { isSafe, isCrisis } = await moderateMessage(text);

  if (isCrisis) {
    showCrisisPopup();
    return;
  }
  if (!isSafe) return; // Drop silently

  // Safe — broadcast to channel (NOT saved to DB)
  await chatChannel.send({
    type: 'broadcast',
    event: 'message',
    payload: {
      text,
      tempId: generateId(),
      timestamp: new Date().toISOString(),
      senderId: currentUserId,
    }
  });

  // Add to local state only
  addMessage({ text, isMine: true, ... });
}
```

---

## 6. Realtime Event Types

```typescript
// types/realtime-events.ts

export interface MatchFoundPayload {
  targetUserId: string;
  sessionId: string;
  topic: Topic;
  matchedUserIntent: Intent;
  durationSeconds: number;        // 900 (15 min)
}

export interface ChatMessagePayload {
  text: string;
  tempId: string;
  timestamp: string;
  senderId: string;               // Used to determine isMine
}

export interface TypingPayload {
  isTyping: boolean;
  userId: string;
}

export interface SessionEndPayload {
  sessionId: string;
  reason: 'timer_expired' | 'user_exit' | 'other_user_exit' | 'crisis';
}

export interface CrisisPayload {
  sessionId: string;
  forUser: 'sender' | 'listener';
  crisisResources?: CrisisResource[];
  listenerGuidance?: string[];
}
```

---

## 7. Auth: Sign in with Apple + Email + Phone

```typescript
// lib/supabase.ts — Auth methods

// Sign in with Apple (required by App Store guidelines)
async function signInWithApple() {
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: credential.identityToken!,
  });
  return { data, error };
}

// Email
async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

// Phone (OTP)
async function signInWithPhone(phone: string) {
  return supabase.auth.signInWithOtp({ phone });
}
```

---

## 8. Theme (System Default)

```typescript
// hooks/useTheme.ts
import { useColorScheme } from 'react-native';

export function useTheme() {
  const scheme = useColorScheme(); // 'light' | 'dark' | null
  return scheme === 'dark' ? darkTheme : lightTheme;
}

// NativeWind handles dark mode automatically via:
// className="bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
```

---

## 9. Post-Session Rating

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

// rating.tsx — shown after every session end
// Stars: 1-5 (tap to select)
// Labels: multi-select chips (tap to toggle)
// Submit: POST to sessions_ratings table
// Skip: allowed (button always present)

// DB insert — NO user_id, fully anonymous
await supabase.from('session_ratings').insert({
  session_id: sessionId,
  stars: selectedStars,
  labels: selectedLabels,
});
```

---

## 10. Session Configuration

```typescript
// constants/config.ts
export const SESSION_DURATION_SECONDS = 900;  // 15 minutes — DO NOT CHANGE without PRD update
export const SESSION_WARNING_SECONDS = 120;   // Warning at 2:00
export const MATCH_TIMEOUT_MS = 30_000;       // 30 seconds
export const ESTIMATED_TIME_THRESHOLD = 60;   // Only show estimate if < 60s
export const ASYNC_MESSAGE_EXPIRY_HOURS = 24;
export const REPORT_BAN_THRESHOLD = 3;        // Reports before auto-ban
export const BAN_DURATION_HOURS = 24;
export const REENGAGEMENT_INACTIVE_HOURS = 48; // Push after 48h inactivity
```

---

## 11. Environment Variables

```bash
# .env (mobile)
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
EXPO_PUBLIC_OPENAI_API_KEY=sk-...
EXPO_PUBLIC_SENTRY_DSN=https://...
```

---

## 12. Non-Negotiable Implementation Rules

1. **Messages never stored.** No DB insert for message content. Relay via Supabase Realtime channel only.
2. **Moderation before every send.** `moderateMessage()` must be called before `channel.send()`. No exceptions.
3. **All users display as "Anonymous".** Never show email, phone, or any identifier to other users.
4. **Session timer is 900 seconds.** Do not hardcode any other value. Use `SESSION_DURATION_SECONDS` constant.
5. **Expo version is 54.0.33.** Do not run `expo upgrade`. Do not change `expo` in package.json.
6. **Report + Exit always visible** in `ChatHeader.tsx`. Never in a menu.
7. **Crisis popup: 5-second lock.** `setTimeout(5000)` before enabling dismiss. Hard requirement.
8. **`clearSession()` on every session end.** Messages wiped from Zustand state immediately.
9. **TypeScript strict mode.** `any` forbidden. Use `unknown` with type guards.
10. **Rating is anonymous.** No `user_id` in `session_ratings` table.
11. **Re-engagement push after 48h inactivity.** Use `REENGAGEMENT_INACTIVE_HOURS` constant.
12. **Async messages expire in 24h.** Set `expires_at = NOW() + INTERVAL '24 hours'` on insert.

---

## 13. Key Commands

```bash
# Install with locked Expo version
npx create-expo-app talkd-mobile --template expo-template-blank-typescript
cd talkd-mobile
npm install expo@54.0.33  # Lock to exact version

# Dev
npx expo start
npx expo start --ios

# Type check
npx tsc --noEmit

# Lint
npx eslint . --ext .ts,.tsx

# Supabase
npx supabase init
npx supabase db push
npx supabase gen types typescript --local > types/supabase.ts
```

---

## 14. MVP Completion Checklist

- [ ] F01: Auth (Apple + Email + Phone) + "Anonymous" display
- [ ] F02: Topic selection + Supabase Realtime match queue
- [ ] F03: Role + intent selection
- [ ] F04: Real-time chat via Supabase Realtime (no DB storage)
- [ ] F05: 15-min session timer + warning at 2:00
- [ ] F05b: Post-session 1-5 star rating + labels
- [ ] F06: Async fallback + push notification on reply
- [ ] F07: AI moderation + crisis popup (5s lock)
- [ ] F08: Report (always visible) + exit
- [ ] F09: Re-engagement push after 48h inactivity
- [ ] System theme (light/dark follows iPhone)
- [ ] Sentry active on crashes
- [ ] TypeScript strict — zero `any`
- [ ] Messages confirmed NOT in database after session
- [ ] TestFlight beta with 10 users

---

*TDD v1.1 — Ready for implementation*
*Expo: 54.0.33 | Backend: Supabase | Real-time: Supabase Realtime*
