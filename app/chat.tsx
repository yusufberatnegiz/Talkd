import { SESSION_DURATION_SECONDS, SESSION_WARNING_SECONDS } from '@/constants/config';
import { getTopic } from '@/constants/topics';
import { useTheme } from '@/hooks/useTheme';
import { supabase } from '@/lib/supabase';
import { moderateMessage } from '@/lib/moderation';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
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

function Sheet({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  const t = useTheme();
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' }}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity activeOpacity={1} onPress={e => e.stopPropagation()}>
          <View style={{
            backgroundColor: t.bg2, borderTopLeftRadius: 28, borderTopRightRadius: 28,
            padding: 20, paddingBottom: 36, borderTopWidth: 0.5, borderColor: t.line,
          }}>
            <View style={{ width: 36, height: 4, borderRadius: 99, backgroundColor: t.ink5, alignSelf: 'center', marginBottom: 18 }} />
            {children}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const REASON_MAP: Record<string, string> = {
  'Harassment or abuse':       'harassment_or_abuse',
  'Sexual content':            'sexual_content',
  'Hate or discrimination':    'hate_or_discrimination',
  'Self-harm encouragement':   'self_harm_encouragement',
  'Spam or selling':           'spam_or_selling',
  'Something else':            'something_else',
};

function CrisisSheet({ onClose }: { onClose: () => void }) {
  const t = useTheme();
  const [secsLeft, setSecsLeft] = useState(5);

  useEffect(() => {
    if (secsLeft <= 0) return;
    const id = setTimeout(() => setSecsLeft(s => s - 1), 1000);
    return () => clearTimeout(id);
  }, [secsLeft]);

  const canDismiss = secsLeft <= 0;

  return (
    <Modal visible transparent animationType="slide">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' }}>
        <View style={{
          backgroundColor: t.bg2, borderTopLeftRadius: 28, borderTopRightRadius: 28,
          padding: 24, paddingBottom: 40, borderTopWidth: 0.5, borderColor: t.line,
        }}>
          <View style={{ width: 36, height: 4, borderRadius: 99, backgroundColor: t.ink5, alignSelf: 'center', marginBottom: 20 }} />
          <Text style={{ fontFamily: 'Georgia', fontStyle: 'italic', fontSize: 26, color: t.ink, marginBottom: 8 }}>
            You're not alone.
          </Text>
          <Text style={{ fontSize: 13.5, color: t.ink3, lineHeight: 20, marginBottom: 20 }}>
            If you're in crisis, please reach out to someone trained to help right now.
          </Text>
          <View style={{ gap: 10, marginBottom: 24 }}>
            {([
              { name: 'Crisis Text Line', detail: 'Text HOME to 741741' },
              { name: 'National Suicide & Crisis Lifeline', detail: 'Call or text 988' },
              { name: 'International Association for Suicide Prevention', detail: 'iasp.info/resources/Crisis_Centres' },
            ] as const).map(({ name, detail }) => (
              <View key={name} style={{
                padding: 14, borderRadius: 14, backgroundColor: t.bg3,
                borderWidth: 0.5, borderColor: t.line,
              }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: t.ink }}>{name}</Text>
                <Text style={{ fontSize: 12.5, color: t.ink3, marginTop: 3 }}>{detail}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity
            disabled={!canDismiss}
            onPress={onClose}
            style={{
              paddingVertical: 14, borderRadius: 14, alignItems: 'center',
              backgroundColor: canDismiss ? t.amber : t.bg3,
            }}
          >
            <Text style={{ fontSize: 14.5, fontWeight: '600', color: canDismiss ? t.bg : t.ink4 }}>
              {canDismiss ? 'Continue talking' : `Please read… ${secsLeft}s`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function ReportSheet({
  onClose, onConfirm, sessionId, reporterId, reportedUserId,
}: {
  onClose: () => void;
  onConfirm: () => void;
  sessionId: string;
  reporterId: string;
  reportedUserId: string;
}) {
  const t = useTheme();
  const [picked, setPicked] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const reasons = Object.keys(REASON_MAP);

  async function handleSubmit() {
    if (!picked) return;
    if (!sessionId || !reporterId || !reportedUserId) {
      setError('Report could not be sent because this session is missing details.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const { error: reportError } = await supabase.from('reports').insert({
        session_id: sessionId,
        reporter_id: reporterId,
        reported_user_id: reportedUserId,
        reason: REASON_MAP[picked],
      });
      if (reportError) {
        setError('Report could not be sent. Check your connection and try again.');
        return;
      }
      onConfirm();
    } catch {
      setError('Report could not be sent. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Sheet onClose={onClose}>
      <Text style={{ fontFamily: 'Georgia', fontStyle: 'italic', fontSize: 26, color: t.ink, letterSpacing: -0.3, marginBottom: 4 }}>
        Report this person
      </Text>
      <Text style={{ fontSize: 13, color: t.ink3, marginBottom: 18, lineHeight: 18 }}>
        We'll end this conversation and review the session. You stay anonymous.
      </Text>
      <View style={{ gap: 6, marginBottom: 16 }}>
        {reasons.map(r => (
          <TouchableOpacity
            key={r}
            onPress={() => { setPicked(r); if (error) setError(''); }}
            style={{
              padding: 13, borderRadius: 12,
              backgroundColor: picked === r ? t.red + '20' : t.bg3,
              borderWidth: picked === r ? 1 : 0.5,
              borderColor: picked === r ? t.red + '60' : t.line,
            }}
          >
            <Text style={{ fontSize: 14, color: picked === r ? t.red : t.ink }}>{r}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        disabled={!picked || submitting}
        onPress={() => void handleSubmit()}
        style={{
          paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginBottom: 8,
          backgroundColor: picked && !submitting ? t.red : t.bg3,
        }}
      >
        <Text style={{ fontSize: 14.5, fontWeight: '600', color: picked && !submitting ? '#fff' : t.ink4 }}>
          {submitting ? 'Sending report...' : 'Submit report & end'}
        </Text>
      </TouchableOpacity>
      {!!error && (
        <Text style={{ fontSize: 12.5, color: t.red, lineHeight: 18, marginBottom: 8 }}>
          {error}
        </Text>
      )}
      <TouchableOpacity onPress={onClose} style={{ paddingVertical: 14, alignItems: 'center' }}>
        <Text style={{ fontSize: 14, color: t.ink3 }}>Cancel</Text>
      </TouchableOpacity>
    </Sheet>
  );
}

function ExitSheet({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  const t = useTheme();
  return (
    <Sheet onClose={onClose}>
      <Text style={{ fontFamily: 'Georgia', fontStyle: 'italic', fontSize: 26, color: t.ink, letterSpacing: -0.3, marginBottom: 4 }}>
        End this conversation?
      </Text>
      <Text style={{ fontSize: 13, color: t.ink3, marginBottom: 20, lineHeight: 18 }}>
        You can't come back to this one. We'll ask both of you for a quick rating.
      </Text>
      <TouchableOpacity
        onPress={onConfirm}
        style={{ paddingVertical: 14, borderRadius: 14, alignItems: 'center', backgroundColor: t.amber, marginBottom: 8 }}
      >
        <Text style={{ fontSize: 14.5, fontWeight: '600', color: t.bg }}>End & rate</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onClose} style={{ paddingVertical: 14, alignItems: 'center' }}>
        <Text style={{ fontSize: 14, color: t.ink3 }}>Keep talking</Text>
      </TouchableOpacity>
    </Sheet>
  );
}

function ContinueSheet({ youAgreed, theyAgreed, onAgree, onDecline }: {
  youAgreed: boolean; theyAgreed: boolean; onAgree: () => void; onDecline: () => void;
}) {
  const t = useTheme();
  const both = youAgreed && theyAgreed;
  return (
    <Modal visible transparent animationType="slide">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' }}>
        <View style={{
          backgroundColor: t.bg2, borderTopLeftRadius: 28, borderTopRightRadius: 28,
          padding: 20, paddingBottom: 36, borderTopWidth: 0.5, borderColor: t.line,
        }}>
          <View style={{ width: 36, height: 4, borderRadius: 99, backgroundColor: t.ink5, alignSelf: 'center', marginBottom: 18 }} />
          <Text style={{ fontFamily: 'Georgia', fontStyle: 'italic', fontSize: 26, color: t.ink, letterSpacing: -0.3, marginBottom: 4 }}>
            {both ? 'No timer now.' : "Time's up."}
          </Text>
          <Text style={{ fontSize: 13, color: t.ink3, marginBottom: 20, lineHeight: 18 }}>
            {both
              ? 'You both chose to keep going. Stay as long as you need.'
              : 'If you both want, you can keep talking without a timer. Either of you can leave any time.'}
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
            {(['You', 'Them'] as const).map((label, i) => {
              const agreed = i === 0 ? youAgreed : theyAgreed;
              return (
                <View key={label} style={{
                  flex: 1, padding: 14, borderRadius: 14, alignItems: 'center',
                  backgroundColor: agreed ? t.amber + '18' : t.bg3,
                  borderWidth: agreed ? 1 : 0.5, borderColor: agreed ? t.amber + '60' : t.line,
                }}>
                  <Text style={{ fontSize: 11, color: t.ink3, letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 6 }}>{label}</Text>
                  <Text style={{ fontFamily: 'Georgia', fontStyle: 'italic', fontSize: 15, color: agreed ? t.amber : t.ink4 }}>
                    {agreed ? '✓ Agreed' : 'Deciding…'}
                  </Text>
                </View>
              );
            })}
          </View>
          {!both && (
            <>
              <TouchableOpacity
                disabled={youAgreed}
                onPress={onAgree}
                style={{
                  paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginBottom: 8,
                  backgroundColor: youAgreed ? t.bg3 : t.amber,
                }}
              >
                <Text style={{ fontSize: 14.5, fontWeight: '600', color: youAgreed ? t.ink3 : t.bg }}>
                  {youAgreed ? 'Waiting for them…' : 'Keep talking (no timer)'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onDecline} style={{ paddingVertical: 14, alignItems: 'center' }}>
                <Text style={{ fontSize: 14, color: t.ink3 }}>End here</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

export default function ChatScreen() {
  const t = useTheme();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const typingIdleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    topic: topicParam, specific, specific_from,
    session_id: sessionId, other_user_id: otherUserId,
  } = useLocalSearchParams<{
    topic: string; specific: string; specific_from: string;
    session_id: string; other_user_id: string;
  }>();
  const tp = getTopic(topicParam ?? 'any');
  const hue = tp.hue;

  const [userId, setUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [timeLeft, setTimeLeft] = useState(SESSION_DURATION_SECONDS);
  const [timerActive, setTimerActive] = useState(true);
  const [untimed, setUntimed] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);
  const [continueOpen, setContinueOpen] = useState(false);
  const [youAgreed, setYouAgreed] = useState(false);
  const [theyAgreed, setTheyAgreed] = useState(false);
  const [crisisOpen, setCrisisOpen] = useState(false);
  const [typing, setTyping] = useState(false);
  const [sendError, setSendError] = useState('');

  function formatClock() {
    const d = new Date();
    const h = d.getHours() % 12 || 12;
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }

  function formatTime(s: number) {
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }

  // Load user ID
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  // Channel subscription
  useEffect(() => {
    if (!sessionId || !userId) return;

    const channel = supabase.channel(`session:${sessionId}`, {
      config: { broadcast: { self: false } },
    });

    channel
      .on('broadcast', { event: 'message' }, ({ payload }: { payload: { text: string; ts: string } }) => {
        setMessages(prev => [...prev, { id: Date.now(), from: 'them', text: payload.text, time: payload.ts }]);
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
      })
      .on('broadcast', { event: 'continue_agree' }, () => {
        setTheyAgreed(true);
      })
      .on('broadcast', { event: 'typing' }, ({ payload }: { payload: { isTyping: boolean } }) => {
        setTyping(payload.isTyping);
      })
      .on('broadcast', { event: 'session_end' }, () => {
        if (channelRef.current) {
          void supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }
        setMessages([]);
        setTimeout(() => {
          router.replace({
            pathname: '/rating',
            params: { topic: tp.key, session_id: sessionId, other_user_id: otherUserId ?? '' },
          } as never);
        }, 700);
      })
      .subscribe();

    channelRef.current = channel;
    return () => {
      if (typingIdleTimeoutRef.current) clearTimeout(typingIdleTimeoutRef.current);
      void supabase.removeChannel(channel);
      channelRef.current = null;
      setMessages([]);
    };
  }, [sessionId, userId]);

  // Timer countdown
  useEffect(() => {
    if (!timerActive || untimed) return;
    if (timeLeft <= 0) {
      setTimerActive(false);
      setContinueOpen(true);
      return;
    }
    const id = setTimeout(() => setTimeLeft(n => n - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, timerActive, untimed]);

  // Both agreed to continue
  useEffect(() => {
    if (youAgreed && theyAgreed && continueOpen) {
      const id = setTimeout(() => { setContinueOpen(false); setUntimed(true); }, 900);
      return () => clearTimeout(id);
    }
  }, [youAgreed, theyAgreed, continueOpen]);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: false });
  }, [messages, typing]);

  async function goToRating() {
    if (sessionId) {
      await supabase
        .from('sessions')
        .update({ status: 'ended', ended_at: new Date().toISOString() })
        .eq('id', sessionId);
    }

    if (channelRef.current) {
      await channelRef.current.send({ type: 'broadcast', event: 'session_end', payload: {} });
      await supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    setMessages([]);
    router.replace({
      pathname: '/rating',
      params: { topic: tp.key, session_id: sessionId ?? '', other_user_id: otherUserId ?? '' },
    } as never);
  }

  function handleDraftChange(text: string) {
    setDraft(text);
    if (sendError) setSendError('');
    if (!channelRef.current) return;
    void channelRef.current.send({ type: 'broadcast', event: 'typing', payload: { isTyping: true } });
    if (typingIdleTimeoutRef.current) clearTimeout(typingIdleTimeoutRef.current);
    typingIdleTimeoutRef.current = setTimeout(() => {
      void channelRef.current?.send({ type: 'broadcast', event: 'typing', payload: { isTyping: false } });
    }, 2000);
  }

  async function send() {
    const text = draft.trim();
    if (!text) return;
    if (typingIdleTimeoutRef.current) clearTimeout(typingIdleTimeoutRef.current);
    void channelRef.current?.send({ type: 'broadcast', event: 'typing', payload: { isTyping: false } });
    setSendError('');
    try {
      const { isSafe, isCrisis } = await moderateMessage(text);
      if (isCrisis) { setCrisisOpen(true); return; }
      if (!isSafe) {
        setSendError('That message cannot be sent. Try rephrasing it kindly and safely.');
        return;
      }
      if (!channelRef.current) {
        setSendError('You are not connected to the conversation. Try again in a moment.');
        return;
      }
      const sentAt = formatClock();
      await channelRef.current.send({ type: 'broadcast', event: 'message', payload: { text, ts: sentAt } });
      setDraft('');
      setMessages(prev => [...prev, { id: Date.now(), from: 'me', text, time: sentAt }]);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    } catch {
      setSendError('Message could not be sent. Check your connection and try again.');
    }
  }

  async function handleContinueAgree() {
    setYouAgreed(true);
    await channelRef.current?.send({ type: 'broadcast', event: 'continue_agree', payload: {} });
  }

  const isWarning = timeLeft <= SESSION_WARNING_SECONDS && timeLeft > 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        {/* Header */}
        <View style={{
          paddingHorizontal: 12, paddingVertical: 12,
          borderBottomWidth: 0.5, borderBottomColor: t.line,
          flexDirection: 'row', alignItems: 'center', gap: 8,
        }}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 4 }}>
            <View style={{
              width: 32, height: 32, borderRadius: 16,
              backgroundColor: hue + '22', borderWidth: 0.5, borderColor: hue + '40',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: hue }} />
            </View>
            <View>
              <Text style={{ fontFamily: 'Georgia', fontStyle: 'italic', fontSize: 15.5, color: t.ink, lineHeight: 18 }}>
                Someone listening
              </Text>
              <Text style={{ fontSize: 10.5, color: t.ink3, marginTop: 1, letterSpacing: 0.3 }}>
                {tp.label} · {untimed ? 'No timer' : formatTime(timeLeft)}
              </Text>
            </View>
          </View>

          {/* Report button */}
          <TouchableOpacity
            onPress={() => setReportOpen(true)}
            style={{
              minWidth: 44, height: 44, paddingHorizontal: 12, borderRadius: 12,
              backgroundColor: t.redDim, borderWidth: 0.5, borderColor: t.red + '40',
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
            }}
          >
            <Text style={{ fontSize: 12.5, fontWeight: '500', color: t.red }}>Report</Text>
          </TouchableOpacity>

          {/* Exit button */}
          <TouchableOpacity
            onPress={() => setExitOpen(true)}
            style={{
              minWidth: 44, height: 44, paddingHorizontal: 12, borderRadius: 12,
              backgroundColor: t.bg3, borderWidth: 0.5, borderColor: t.line,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
            }}
          >
            <Text style={{ fontSize: 12.5, fontWeight: '500', color: t.ink }}>Exit</Text>
          </TouchableOpacity>
        </View>

        {/* Progress bar */}
        {!untimed && (
          <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ flex: 1, height: 2, borderRadius: 99, backgroundColor: t.bg3, overflow: 'hidden' }}>
              <View style={{
                height: '100%',
                width: `${(timeLeft / SESSION_DURATION_SECONDS) * 100}%`,
                backgroundColor: isWarning ? t.red : hue,
              }} />
            </View>
            <Text style={{ fontFamily: 'Georgia', fontStyle: 'italic', fontSize: 10.5, color: t.ink4 }}>
              {isWarning ? 'ending soon' : 'session time'}
            </Text>
          </View>
        )}

        {untimed && (
          <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: hue }} />
            <Text style={{ fontFamily: 'Georgia', fontStyle: 'italic', fontSize: 11, color: t.ink3, letterSpacing: 0.1 }}>
              Both of you chose to keep talking — no timer
            </Text>
          </View>
        )}

        {/* Context note */}
        {!!specific && (
          <View style={{ paddingHorizontal: 20, paddingBottom: 8 }}>
            <View style={{ padding: 10, backgroundColor: t.bg2, borderRadius: 14, borderWidth: 0.5, borderColor: t.line }}>
              <Text style={{ fontFamily: 'Georgia', fontStyle: 'italic', fontSize: 12, color: t.ink3 }}>
                {specific_from === 'them' ? 'They wrote' : 'You wrote'}: "{specific}"
              </Text>
            </View>
          </View>
        )}

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1, paddingHorizontal: 16, paddingTop: 8 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {messages.map((m) => {
            const mine = m.from === 'me';
            return (
              <View key={m.id} style={{ alignItems: mine ? 'flex-end' : 'flex-start', marginBottom: 14 }}>
                <View style={{
                  maxWidth: '78%', paddingHorizontal: 15, paddingVertical: 11,
                  borderRadius: 20,
                  borderBottomRightRadius: mine ? 6 : 20,
                  borderBottomLeftRadius: mine ? 20 : 6,
                  backgroundColor: mine ? hue + '28' : t.bg3,
                  borderWidth: 0.5, borderColor: mine ? hue + '40' : t.line,
                }}>
                  <Text style={{ fontSize: 15, lineHeight: 21, color: t.ink, letterSpacing: -0.1 }}>{m.text}</Text>
                </View>
                <Text style={{ fontSize: 10, color: t.ink4, paddingHorizontal: 6, marginTop: 3, letterSpacing: 0.2 }}>{m.time}</Text>
              </View>
            );
          })}

          {typing && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingLeft: 4, marginBottom: 14 }}>
              {[0, 1, 2].map(i => (
                <View key={i} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: t.ink3, opacity: 0.6 }} />
              ))}
              <Text style={{ fontFamily: 'Georgia', fontStyle: 'italic', fontSize: 11, color: t.ink4, marginLeft: 4 }}>
                They're thinking
              </Text>
            </View>
          )}
          <View style={{ height: 12 }} />
        </ScrollView>

        {/* Composer */}
        <View style={{ paddingHorizontal: 14, paddingTop: 12, paddingBottom: 20, borderTopWidth: 0.5, borderTopColor: t.line }}>
          <View style={{
            flexDirection: 'row', alignItems: 'flex-end', gap: 8,
            backgroundColor: t.bg3, borderRadius: 22, paddingLeft: 16,
            paddingRight: 6, paddingVertical: 6, borderWidth: 0.5, borderColor: t.line,
          }}>
            <TextInput
              value={draft}
              onChangeText={handleDraftChange}
              onSubmitEditing={() => void send()}
              placeholder="Say anything…"
              placeholderTextColor={t.ink4}
              returnKeyType="send"
              multiline
              style={{ flex: 1, fontSize: 15, color: t.ink, paddingVertical: 8, maxHeight: 100, letterSpacing: -0.1 }}
            />
            <TouchableOpacity
              onPress={() => void send()}
              disabled={!draft.trim()}
              style={{
                width: 34, height: 34, borderRadius: 17,
                backgroundColor: draft.trim() ? hue : t.bg4,
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 16, color: draft.trim() ? t.bg : t.ink4 }}>↑</Text>
            </TouchableOpacity>
          </View>
          {!!sendError && (
            <Text style={{ marginTop: 8, textAlign: 'center', fontSize: 11.5, color: t.red, lineHeight: 16 }}>
              {sendError}
            </Text>
          )}
          <Text style={{ marginTop: 10, textAlign: 'center', fontSize: 10, color: t.ink5, letterSpacing: 0.5 }}>
            REAL-TIME ANONYMOUS CHAT
          </Text>
          <Text style={{ marginTop: 4, textAlign: 'center', fontSize: 10, color: t.ink5, letterSpacing: 0.2 }}>
            Messages are not saved after the session
          </Text>
        </View>
      </KeyboardAvoidingView>

      {reportOpen && userId && (
        <ReportSheet
          onClose={() => setReportOpen(false)}
          onConfirm={() => void goToRating()}
          sessionId={sessionId ?? ''}
          reporterId={userId}
          reportedUserId={otherUserId ?? ''}
        />
      )}
      {exitOpen && (
        <ExitSheet
          onClose={() => setExitOpen(false)}
          onConfirm={() => void goToRating()}
        />
      )}
      {continueOpen && (
        <ContinueSheet
          youAgreed={youAgreed}
          theyAgreed={theyAgreed}
          onAgree={() => void handleContinueAgree()}
          onDecline={() => void goToRating()}
        />
      )}
      {crisisOpen && <CrisisSheet onClose={() => setCrisisOpen(false)} />}
    </SafeAreaView>
  );
}
