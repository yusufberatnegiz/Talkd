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

## Chat Header (Report + Exit Always Visible)

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

## Crisis Popup (5-Second Lock)

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

```typescript
async function handleSend(text: string) {
  if (!text.trim() || !chatChannel || !sessionId) return;

  const { isSafe, isCrisis } = await moderateMessage(text);

  if (isCrisis) {
    setCrisisVisible(true);
    return;
  }

  if (!isSafe) return;

  const timestamp = new Date().toISOString();
  addMessage({ text, isMine: true, timestamp });

  await chatChannel.send({
    type: 'broadcast',
    event: 'message',
    payload: { text, timestamp, senderId: userId },
  });
}
```

Chat text must be moderated before broadcast. Messages are not inserted into the database.

---

## Session End

```typescript
async function handleSessionEnd() {
  if (chatChannel) {
    await supabase.removeChannel(chatChannel);
  }

  setMessages([]);
  router.replace('/rating');
}
```

Always remove/unsubscribe the realtime channel and wipe local messages on session end.

---

## Error Handling

```typescript
try {
  await doSomething();
} catch (error) {
  // Capture with Sentry once configured.
  console.error(error);
}
```
