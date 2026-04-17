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
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [timeLeft, setTimeLeft] = useState(14 * 60 + 29);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<Message[]>(INITIAL);

  useEffect(() => {
    const t = setInterval(() => setTimeLeft((p) => (p > 0 ? p - 1 : 0)), 1000);
    return () => clearInterval(t);
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
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View
          className="px-3 pb-3 pt-3 flex-row items-center gap-2 border-b border-border"
          style={{ backgroundColor: 'rgba(22,22,42,0.8)' }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            className="h-9 w-9 rounded-full items-center justify-center"
          >
            <ChevronLeft size={24} color="rgba(238,238,245,0.7)" strokeWidth={2} />
          </TouchableOpacity>

          <View className="flex-1 flex-row items-center gap-2.5">
            <View className="h-9 w-9 rounded-full bg-primary-soft items-center justify-center">
              <Shield size={18} color="#6366f1" strokeWidth={2} />
            </View>
            <View>
              <Text style={{ fontFamily: 'Georgia', fontSize: 16, fontWeight: '600', color: '#eeeef5', lineHeight: 20 }}>
                Anonymous Listener
              </Text>
              <View className="flex-row items-center gap-1.5">
                <View className="h-1.5 w-1.5 rounded-full bg-success" />
                <Text style={{ fontSize: 11.5, color: '#9090aa' }}>Active now</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity className="h-9 w-9 rounded-full items-center justify-center">
            <MoreVertical size={20} color="rgba(238,238,245,0.7)" />
          </TouchableOpacity>
        </View>

        {/* Timer */}
        <View className="px-4 pt-3 pb-1 items-center">
          <View
            className="flex-row items-center gap-1.5 px-3 py-1 rounded-full border"
            style={{ backgroundColor: 'rgba(99,102,241,0.08)', borderColor: 'rgba(99,102,241,0.1)' }}
          >
            <Clock size={12} color="#6366f1" />
            <Text style={{ fontSize: 11.5, fontWeight: '500', color: '#6366f1' }}>
              {formatTime(timeLeft)} remaining
            </Text>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          className="flex-1 px-4 py-3"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {messages.map((m, idx) => {
            const mine = m.from === 'me';
            const prev = messages[idx - 1];
            const grouped = prev && prev.from === m.from;
            return (
              <View
                key={m.id}
                style={[
                  { alignItems: mine ? 'flex-end' : 'flex-start' },
                  !grouped && { marginTop: 12 },
                ]}
              >
                <View
                  style={[
                    { maxWidth: '80%', paddingHorizontal: 14, paddingVertical: 10 },
                    mine
                      ? { backgroundColor: '#6366f1', borderRadius: 16, borderBottomRightRadius: 4 }
                      : { backgroundColor: '#1e1e36', borderWidth: 1, borderColor: '#2e2e4a', borderRadius: 16, borderBottomLeftRadius: 4 },
                  ]}
                >
                  <Text style={{ fontSize: 15, lineHeight: 22, color: mine ? '#fff' : '#eeeef5' }}>
                    {m.text}
                  </Text>
                </View>
                <Text style={{ marginTop: 4, paddingHorizontal: 4, fontSize: 10.5, color: '#9090aa' }}>
                  {m.time}
                </Text>
              </View>
            );
          })}
        </ScrollView>

        {/* Composer */}
        <View className="px-3 pt-2 pb-5 border-t border-border">
          <View
            className="flex-row items-end gap-2 rounded-2xl px-3 py-2 border"
            style={{ backgroundColor: '#1e1e36', borderColor: '#2e2e4a' }}
          >
            <TextInput
              value={draft}
              onChangeText={setDraft}
              onSubmitEditing={send}
              placeholder="Message…"
              placeholderTextColor="#9090aa"
              returnKeyType="send"
              multiline
              style={{
                flex: 1,
                fontSize: 15,
                color: '#eeeef5',
                paddingVertical: 6,
                maxHeight: 120,
              }}
            />
            <TouchableOpacity
              onPress={send}
              disabled={!draft.trim()}
              className="h-8 w-8 rounded-full items-center justify-center flex-shrink-0"
              style={{ backgroundColor: draft.trim() ? '#6366f1' : '#2d2d4a' }}
            >
              <ArrowUp size={16} color={draft.trim() ? '#fff' : '#9090aa'} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
          <Text style={{ marginTop: 8, textAlign: 'center', fontSize: 10.5, color: '#9090aa' }}>
            End-to-end encrypted · Anonymous
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
