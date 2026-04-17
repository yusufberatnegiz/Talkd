# Code Patterns — Talkd

## Naming Conventions
```
Components:    PascalCase  → MessageBubble.tsx
Hooks:         camelCase   → useSession.ts
Routes:        kebab-case  → role-select.tsx
Types/Enums:   PascalCase  → Topic, Role, Intent
Constants:     SCREAMING   → SESSION_DURATION_SECONDS
Stores:        useXxxStore → useMatchStore
```

---

## Component Pattern

```typescript
// components/chat/MessageBubble.tsx
import { View, Text } from 'react-native';

interface MessageBubbleProps {
  text: string;
  isMine: boolean;
  timestamp: string;
}

export function MessageBubble({ text, isMine, timestamp }: MessageBubbleProps) {
  return (
    <View className={`max-w-xs px-4 py-3 rounded-2xl mb-2 ${
      isMine
        ? 'self-end bg-indigo-600'
        : 'self-start bg-gray-200 dark:bg-gray-800'
    }`}>
      <Text className="text-white text-base leading-relaxed">{text}</Text>
      <Text className={`text-xs mt-1 ${
        isMine ? 'text-indigo-200 text-right' : 'text-gray-400'
      }`}>
        {timestamp}
      </Text>
    </View>
  );
}
```

---

## Chat Header (Report + Exit Always Visible)

```typescript
// components/chat/ChatHeader.tsx
// RULE: Report and Exit must ALWAYS be visible. Never hidden. Never in a menu.

import { View, Text, TouchableOpacity } from 'react-native';

interface ChatHeaderProps {
  secondsLeft: number;
  onReport: () => void;
  onExit: () => void;
}

export function ChatHeader({ secondsLeft, onReport, onExit }: ChatHeaderProps) {
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isWarning = secondsLeft <= 120;

  return (
    <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
      <TouchableOpacity onPress={onReport} className="px-3 py-2">
        <Text className="text-red-500 text-sm font-medium">Report</Text>
      </TouchableOpacity>

      <Text className={`text-base font-bold tabular-nums ${
        isWarning ? 'text-red-500' : 'text-gray-900 dark:text-white'
      }`}>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </Text>

      <TouchableOpacity onPress={onExit} className="px-3 py-2">
        <Text className="text-gray-500 text-sm font-medium">Exit</Text>
      </TouchableOpacity>
    </View>
  );
}
```

---

## Crisis Popup (5-Second Lock)

```typescript
// components/modals/CrisisPopup.tsx
import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Linking, Modal } from 'react-native';
import { CRISIS_RESOURCES } from '@/constants/crisis';

interface CrisisPopupProps {
  visible: boolean;
  onContinue: () => void;
  onEndSession: () => void;
}

export function CrisisPopup({ visible, onContinue, onEndSession }: CrisisPopupProps) {
  const [canDismiss, setCanDismiss] = useState(false);

  useEffect(() => {
    if (visible) {
      setCanDismiss(false);
      // 5-second lock — hard requirement
      const timer = setTimeout(() => setCanDismiss(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/60 justify-center px-6">
        <View className="bg-white dark:bg-gray-900 rounded-3xl p-6">
          <Text className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            You don't have to go through this alone.
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 mb-6">
            Real support is available right now.
          </Text>

          {CRISIS_RESOURCES.map((r) => (
            <TouchableOpacity
              key={r.name}
              onPress={() => Linking.openURL(`tel:${r.number}`)}
              className="bg-indigo-50 dark:bg-indigo-950 rounded-xl px-4 py-3 mb-3"
            >
              <Text className="font-semibold text-indigo-700 dark:text-indigo-300">{r.name}</Text>
              <Text className="text-indigo-500 text-sm">{r.available}</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            onPress={onEndSession}
            className="py-3 mb-2"
          >
            <Text className="text-center text-red-500 font-medium">End Session</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onContinue}
            disabled={!canDismiss}
            className={`py-3 rounded-xl ${canDismiss ? 'bg-gray-100 dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900 opacity-40'}`}
          >
            <Text className="text-center text-gray-600 dark:text-gray-400">
              {canDismiss ? 'Continue Conversation' : 'Please wait...'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
```

---

## Message Send Flow (CRITICAL — Follow Exactly)

```typescript
// In chat.tsx — this is the ONLY correct way to send a message

async function handleSend(text: string) {
  if (!text.trim() || !chatChannel || !sessionId) return;

  // Step 1: Moderate BEFORE sending — no exceptions
  const { isSafe, isCrisis } = await moderateMessage(text);

  if (isCrisis) {
    // Show crisis popup — do NOT send the message
    setCrisisVisible(true);
    return;
  }

  if (!isSafe) {
    // Drop silently — do NOT send
    return;
  }

  // Step 2: Add to local state (optimistic UI)
  const tempId = Math.random().toString(36).slice(2);
  addMessage({ text, isMine: true, tempId, timestamp: new Date().toISOString() });

  // Step 3: Broadcast via Supabase Realtime (NOT saved to DB)
  await chatChannel.send({
    type: 'broadcast',
    event: 'message',
    payload: { text, tempId, timestamp: new Date().toISOString(), senderId: userId },
  });
}
```

---

## Session End (Always Call clearSession)

```typescript
// Called from: timer expiry, user exit, other user exit, crisis
function handleSessionEnd(reason: string) {
  // 1. Unsubscribe from Supabase channel
  chatChannel?.unsubscribe();

  // 2. Wipe messages from state — ALWAYS
  clearSession();

  // 3. Navigate based on reason
  if (reason === 'timer_expired' || reason === 'other_user_exit') {
    router.replace('/rating');  // Show rating screen
  } else {
    router.replace('/home');
  }
}
```

---

## Post-Session Rating

```typescript
// app/(app)/rating.tsx
import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { RATING_LABELS } from '@/constants/ratingLabels';
import { supabase } from '@/lib/supabase';

export default function RatingScreen() {
  const [stars, setStars] = useState(0);
  const [labels, setLabels] = useState<string[]>([]);
  const sessionId = useMatchStore((s) => s.sessionId);

  async function handleSubmit() {
    // NOTE: No user_id — rating is fully anonymous
    await supabase.from('session_ratings').insert({
      session_id: sessionId,
      stars,
      labels,
    });
    router.replace('/home');
  }

  return (
    <View className="flex-1 bg-white dark:bg-gray-950 px-6 py-8">
      <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        How was your conversation?
      </Text>

      {/* Stars */}
      <View className="flex-row justify-center gap-3 my-6">
        {[1, 2, 3, 4, 5].map((n) => (
          <TouchableOpacity key={n} onPress={() => setStars(n)}>
            <Text className={`text-4xl ${n <= stars ? 'opacity-100' : 'opacity-30'}`}>⭐</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Labels */}
      <View className="flex-row flex-wrap gap-2 mb-8">
        {RATING_LABELS.map((label) => (
          <TouchableOpacity
            key={label}
            onPress={() => setLabels((prev) =>
              prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
            )}
            className={`px-4 py-2 rounded-full border ${
              labels.includes(label)
                ? 'bg-indigo-600 border-indigo-600'
                : 'bg-transparent border-gray-300 dark:border-gray-700'
            }`}
          >
            <Text className={labels.includes(label) ? 'text-white' : 'text-gray-600 dark:text-gray-400'}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={stars === 0}
        className={`py-4 rounded-2xl ${stars > 0 ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-800'}`}
      >
        <Text className="text-white text-center font-semibold text-lg">Done</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.replace('/home')} className="py-3 mt-2">
        <Text className="text-center text-gray-400">Skip</Text>
      </TouchableOpacity>
    </View>
  );
}
```

---

## Error Handling

```typescript
// Always capture errors — never swallow them
try {
  await doSomething();
} catch (error) {
  Sentry.captureException(error);
  // Show user-friendly message if needed
  Alert.alert('Something went wrong', 'Please try again.');
}
```
