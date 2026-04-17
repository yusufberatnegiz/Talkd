import { ChatHeader } from '@/components/chat/ChatHeader';
import { useTheme } from '@/hooks/useTheme';
import { SESSION_DURATION_SECONDS, SESSION_WARNING_SECONDS } from '@/constants/config';
import { useRouter } from 'expo-router';
import { ArrowUp, Clock } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
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
  const [timeLeft, setTimeLeft] = useState(SESSION_DURATION_SECONDS);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [reportVisible, setReportVisible] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<Message[]>(INITIAL);

  const isWarning = timeLeft <= SESSION_WARNING_SECONDS && timeLeft > 0;
  const isExpired = timeLeft === 0;

  useEffect(() => {
    if (sessionEnded) return;
    const timer = setInterval(() => {
      setTimeLeft((p) => {
        if (p <= 1) { clearInterval(timer); return 0; }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionEnded]);

  const handleSessionEnd = () => {
    setSessionEnded(true);
    router.push('/rating' as never);
  };

  const handleExit = () => {
    Alert.alert(
      'End session?',
      'The conversation will close and messages will be deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'End Session', style: 'destructive', onPress: handleSessionEnd },
      ]
    );
  };

  const handleReport = () => setReportVisible(true);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    const time = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    setMessages((prev) => [...prev, { id: Date.now(), from: 'me', text, time }]);
    setDraft('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const timerColor = isWarning || isExpired ? t.destructive : t.primary;
  const timerBg = isWarning || isExpired
    ? `${t.destructive}18`
    : t.primarySoft;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        <ChatHeader onExit={handleExit} onReport={handleReport} />

        {/* Timer pill */}
        <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4, alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, backgroundColor: timerBg, borderWidth: 1, borderColor: timerColor + '33' }}>
            <Clock size={12} color={timerColor} />
            <Text style={{ fontSize: 11.5, fontWeight: '500', color: timerColor }}>
              {isExpired ? 'Session time is up' : `${formatTime(timeLeft)} remaining`}
            </Text>
          </View>
        </View>

        {/* Soft-end banner */}
        {isExpired && (
          <View style={{ marginHorizontal: 16, marginTop: 8, borderRadius: 12, backgroundColor: t.elevated, borderWidth: 1, borderColor: t.border, padding: 14, alignItems: 'center', gap: 12 }}>
            <Text style={{ fontFamily: 'Georgia', fontSize: 14, color: t.foreground, textAlign: 'center', lineHeight: 20 }}>
              Your session time is up. You can keep talking or wrap up.
            </Text>
            <TouchableOpacity
              onPress={handleSessionEnd}
              style={{ paddingHorizontal: 24, paddingVertical: 10, borderRadius: 999, backgroundColor: t.destructive }}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>End Session</Text>
            </TouchableOpacity>
          </View>
        )}

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

      {/* Report modal */}
      <Modal visible={reportVisible} transparent animationType="fade" onRequestClose={() => setReportVisible(false)}>
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
          activeOpacity={1}
          onPress={() => setReportVisible(false)}
        >
          <View style={{ backgroundColor: t.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 36, gap: 12 }}>
            <Text style={{ fontFamily: 'Georgia', fontSize: 16, fontWeight: '600', color: t.foreground, textAlign: 'center', marginBottom: 4 }}>
              Report this user?
            </Text>
            <TouchableOpacity
              onPress={() => {
                setReportVisible(false);
                Alert.alert('Reported', 'Thank you. Our team will review this session.');
              }}
              style={{ paddingVertical: 16, borderRadius: 12, backgroundColor: `${t.destructive}18`, alignItems: 'center' }}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', color: t.destructive }}>Report User</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setReportVisible(false)}
              style={{ paddingVertical: 16, borderRadius: 12, backgroundColor: t.muted, alignItems: 'center' }}
            >
              <Text style={{ fontSize: 16, fontWeight: '500', color: t.foreground }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
