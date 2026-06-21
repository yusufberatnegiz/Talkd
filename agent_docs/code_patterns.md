# Code Patterns - Talkd

## Naming Conventions

```text
Components:    PascalCase  -> MessageBubble.tsx
Hooks:         camelCase   -> useSession.ts
Routes:        kebab-case  -> role-select.tsx
Types/Enums:   PascalCase  -> Topic, Role, Intent
Constants:     SCREAMING   -> SESSION_DURATION_SECONDS
Theme tokens:  t.*         -> t.bg, t.ink, t.line
```

---

## Styling Pattern

Use React Native inline styles with `useTheme()`. NativeWind/Tailwind is not used.

```typescript
import { useTheme } from '@/hooks/useTheme';
import { Text, View } from 'react-native';

export function Panel({ title }: { title: string }) {
  const t = useTheme();

  return (
    <View
      style={{
        borderRadius: 16,
        backgroundColor: t.bg3,
        borderWidth: 0.5,
        borderColor: t.line,
        padding: 16,
      }}
    >
      <Text style={{ color: t.ink, fontSize: 16, fontWeight: '600' }}>
        {title}
      </Text>
    </View>
  );
}
```

Rules:

- Do not use `className`.
- Do not add NativeWind.
- Do not add Tailwind config.
- Prefer shared theme tokens over raw colors.

---

## Component Pattern

```typescript
// components/chat/MessageBubble.tsx
import { Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface MessageBubbleProps {
  text: string;
  isMine: boolean;
  timestamp: string;
  hue: string;
}

export function MessageBubble({ text, isMine, timestamp, hue }: MessageBubbleProps) {
  const t = useTheme();

  return (
    <View style={{ alignItems: isMine ? 'flex-end' : 'flex-start', marginBottom: 14 }}>
      <View
        style={{
          maxWidth: '78%',
          paddingHorizontal: 15,
          paddingVertical: 11,
          borderRadius: 20,
          borderBottomRightRadius: isMine ? 6 : 20,
          borderBottomLeftRadius: isMine ? 20 : 6,
          backgroundColor: isMine ? `${hue}28` : t.bg3,
          borderWidth: 0.5,
          borderColor: isMine ? `${hue}40` : t.line,
        }}
      >
        <Text style={{ fontSize: 15, lineHeight: 21, color: t.ink }}>
          {text}
        </Text>
      </View>
      <Text style={{ fontSize: 10, color: t.ink4, paddingHorizontal: 6, marginTop: 3 }}>
        {timestamp}
      </Text>
    </View>
  );
}
```

---

## Chat Header Pattern

Report + Exit must always be visible in chat.

```typescript
import { Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface ChatHeaderProps {
  secondsLeft: number;
  onReport: () => void;
  onExit: () => void;
}

export function ChatHeader({ secondsLeft, onReport, onExit }: ChatHeaderProps) {
  const t = useTheme();
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isWarning = secondsLeft <= 120;

  return (
    <View
      style={{
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: t.line,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <TouchableOpacity
        onPress={onReport}
        style={{
          minWidth: 44,
          height: 44,
          paddingHorizontal: 12,
          borderRadius: 12,
          backgroundColor: t.redDim,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 12.5, fontWeight: '500', color: t.red }}>
          Report
        </Text>
      </TouchableOpacity>

      <Text style={{ flex: 1, textAlign: 'center', color: isWarning ? t.red : t.ink }}>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </Text>

      <TouchableOpacity
        onPress={onExit}
        style={{
          minWidth: 44,
          height: 44,
          paddingHorizontal: 12,
          borderRadius: 12,
          backgroundColor: t.bg3,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 12.5, fontWeight: '500', color: t.ink }}>
          Exit
        </Text>
      </TouchableOpacity>
    </View>
  );
}
```

---

## Crisis Popup Pattern

Crisis popup must keep the 5-second lock.

```typescript
import { useEffect, useState } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface CrisisPopupProps {
  visible: boolean;
  onContinue: () => void;
}

export function CrisisPopup({ visible, onContinue }: CrisisPopupProps) {
  const t = useTheme();
  const [canDismiss, setCanDismiss] = useState(false);

  useEffect(() => {
    if (!visible) return;

    setCanDismiss(false);
    const timer = setTimeout(() => setCanDismiss(true), 5000);

    return () => clearTimeout(timer);
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: t.bg2, padding: 24, paddingBottom: 40 }}>
          <Text style={{ fontFamily: 'Georgia', fontStyle: 'italic', fontSize: 26, color: t.ink }}>
            You're not alone.
          </Text>
          <Text style={{ fontSize: 13.5, color: t.ink3, lineHeight: 20, marginTop: 8 }}>
            If you're in crisis, please reach out to someone trained to help right now.
          </Text>
          <TouchableOpacity
            disabled={!canDismiss}
            onPress={onContinue}
            style={{
              marginTop: 24,
              paddingVertical: 14,
              borderRadius: 14,
              alignItems: 'center',
              backgroundColor: canDismiss ? t.amber : t.bg3,
            }}
          >
            <Text style={{ fontSize: 14.5, fontWeight: '600', color: canDismiss ? t.bg : t.ink4 }}>
              {canDismiss ? 'Continue talking' : 'Please read...'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
```

---

## Message Send Flow

Messages must be moderated before broadcast. Messages must not be inserted into the database.

Do not clear the draft until moderation and realtime broadcast both succeed.

```typescript
async function handleSend(text: string) {
  const trimmed = text.trim();

  if (!trimmed || !chatChannel || !sessionId || !userId) {
    return;
  }

  setSending(true);
  setSendError(null);

  try {
    const { isSafe, isCrisis } = await moderateMessage(trimmed);

    if (isCrisis) {
      setCrisisVisible(true);
      return;
    }

    if (!isSafe) {
      setSendError('That message could not be sent.');
      return;
    }

    const tempId = createTempId();
    const timestamp = new Date().toISOString();

    const result = await chatChannel.send({
      type: 'broadcast',
      event: 'message',
      payload: {
        text: trimmed,
        tempId,
        timestamp,
        senderId: userId,
      },
    });

    if (result !== 'ok') {
      setSendError('Message could not be sent. Please try again.');
      return;
    }

    addMessage({
      id: tempId,
      text: trimmed,
      isMine: true,
      timestamp,
    });

    setDraft('');
  } catch (error: unknown) {
    console.error(error);
    setSendError('Message could not be sent. Please try again.');
  } finally {
    setSending(false);
  }
}
```

Recommended temp ID helper:

```typescript
export function createTempId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
```

---

## Session End Pattern

Always remove/unsubscribe from the realtime channel and wipe local messages on session end.

```typescript
async function handleSessionEnd() {
  if (chatChannel) {
    await supabase.removeChannel(chatChannel);
  }

  setMessages([]);
  router.replace('/rating');
}
```

Rules:

- Do not leave the user in the session channel after exit.
- Do not keep messages in local state after session end.
- Do not store messages in Supabase tables.

---

## Report Pattern

Reports must be submitted only by authenticated users and only for sessions the user participated in.

```typescript
async function submitReport(reason: ReportReason) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !sessionId || !reportedUserId) {
    return;
  }

  const { error } = await supabase.from('reports').insert({
    session_id: sessionId,
    reporter_id: user.id,
    reported_user_id: reportedUserId,
    reason,
  });

  if (error) {
    console.error(error);
    setReportError('Report could not be submitted.');
    return;
  }

  setReportSubmitted(true);
}
```

Database RLS/functions must enforce that reporter and reported user are valid participants.

---

## Rating Pattern

Ratings are anonymous to users. Never expose who rated whom.

```typescript
async function submitRating(input: {
  sessionId: string;
  ratedUserId: string;
  stars: number | null;
  badge: string | null;
  privateNote: string | null;
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  const { error } = await supabase.from('session_ratings').insert({
    session_id: input.sessionId,
    rater_id: user.id,
    rated_user_id: input.ratedUserId,
    stars: input.stars,
    badge: input.badge,
    private_note: input.privateNote,
  });

  if (error) {
    console.error(error);
    return;
  }
}
```

Private notes must not appear in public views.

---

## Error Handling

```typescript
try {
  await doSomething();
} catch (error: unknown) {
  // Capture with Sentry once configured.
  console.error(error);
}
```

Rules:

- Use `unknown`, not `any`.
- Show user-friendly errors.
- Do not expose raw API/secrets/errors to the user.
- Capture with Sentry once configured.

---

## Copy Pattern

Do not write:

```text
End-to-end encrypted
No records
Nothing is stored
Permanently deletes account
```

unless those statements are technically true.

Preferred wording:

```text
Real-time anonymous chat
Messages are not saved after the session
Session metadata, reports, and ratings may be stored for safety and quality
```
