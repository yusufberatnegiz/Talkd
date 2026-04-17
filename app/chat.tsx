import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import { ArrowUp, ChevronLeft, Clock, MoreVertical, Shield } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Message {
  id: number;
  from: 'me' | 'them';
  text: string;
  time: string;
}

const INITIAL: Message[] = [
  { id: 1, from: 'them', text: "Hi there. I'm here to listen — whenever you're ready.", time: '2:30 PM' },
  { id: 2, from: 'me', text: "I've been feeling really overwhelmed lately with everything going on.", time: '2:31 PM' },
  { id: 3, from: 'them', text: "I hear you. Would you like to tell me more about what's been weighing on you?", time: '2:32 PM' },
];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function ChatScreen() {
  const t = useTheme();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [timeLeft, setTimeLeft] = useState(14 * 60 + 29);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<Message[]>(INITIAL);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft((p) => (p > 0 ? p - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, []);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    const time = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    setMessages((prev) => [...prev, { id: Date.now(), from: 'me', text, time }]);
    setDraft('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        {/* Header */}
        <View style={{ paddingHorizontal: 12, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: t.background, borderBottomWidth: 1, borderBottomColor: t.border }}>
          <TouchableOpacity onPress={() => router.back()} style={{ height: 36, width: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }}>
            <ChevronLeft size={24} color={t.foreground} strokeWidth={2} style={{ opacity: 0.7 }} />
          </TouchableOpacity>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ height: 36, width: 36, borderRadius: 18, backgroundColor: t.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={18} color={t.primary} strokeWidth={2} />
            </View>
            <View>
              <Text style={{ fontFamily: 'Georgia', fontSize: 16, fontWeight: '600', color: t.foreground, lineHeight: 20 }}>
                Anonymous Listener
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ height: 6, width: 6, borderRadius: 3, backgroundColor: t.success }} />
                <Text style={{ fontSize: 11.5, color: t.mutedForeground }}>Active now</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={{ height: 36, width: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }}>
            <MoreVertical size={20} color={t.foreground} style={{ opacity: 0.7 }} />
          </TouchableOpacity>
        </View>

        {/* Timer */}
        <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4, alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, backgroundColor: t.primarySoft, borderWidth: 1, borderColor: t.border }}>
            <Clock size={12} color={t.primary} />
            <Text style={{ fontSize: 11.5, fontWeight: '500', color: t.primary }}>{formatTime(timeLeft)} remaining</Text>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1, paddingHorizontal: 16, paddingTop: 12 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {messages.map((m, idx) => {
            const mine = m.from === 'me';
            const prev = messages[idx - 1];
            const grouped = prev && prev.from === m.from;
            return (
              <View key={m.id} style={[{ alignItems: mine ? 'flex-end' : 'flex-start' }, !grouped && { marginTop: 12 }]}>
                <View style={[
                  { maxWidth: '80%', paddingHorizontal: 14, paddingVertical: 10 },
                  mine
                    ? { backgroundColor: t.primary, borderRadius: 16, borderBottomRightRadius: 4 }
                    : { backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, borderRadius: 16, borderBottomLeftRadius: 4 },
                ]}>
                  <Text style={{ fontSize: 15, lineHeight: 22, color: mine ? t.primaryForeground : t.foreground }}>
                    {m.text}
                  </Text>
                </View>
                <Text style={{ marginTop: 4, paddingHorizontal: 4, fontSize: 10.5, color: t.mutedForeground }}>{m.time}</Text>
              </View>
            );
          })}
          <View style={{ height: 12 }} />
        </ScrollView>

        {/* Composer */}
        <View style={{ paddingHorizontal: 12, paddingTop: 8, paddingBottom: 20, borderTopWidth: 1, borderTopColor: t.border }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, backgroundColor: t.surface, borderColor: t.border }}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              onSubmitEditing={send}
              placeholder="Message…"
              placeholderTextColor={t.mutedForeground}
              returnKeyType="send"
              multiline
              style={{ flex: 1, fontSize: 15, color: t.foreground, paddingVertical: 6, maxHeight: 120 }}
            />
            <TouchableOpacity
              onPress={send}
              disabled={!draft.trim()}
              style={{ height: 32, width: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexShrink: 0, backgroundColor: draft.trim() ? t.primary : t.muted }}
            >
              <ArrowUp size={16} color={draft.trim() ? t.primaryForeground : t.mutedForeground} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
          <Text style={{ marginTop: 8, textAlign: 'center', fontSize: 10.5, color: t.mutedForeground }}>
            End-to-end encrypted · Anonymous
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
