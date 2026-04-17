import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Clock,
  MoreVertical,
  Send,
  Shield,
} from 'lucide-react-native';
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
  text: string;
  sender: 'user' | 'listener';
  time: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 1,
    text: "Hi there! I'm here to listen. What's on your mind today?",
    sender: 'listener',
    time: '2:30 PM',
  },
  {
    id: 2,
    text: "I've been feeling really overwhelmed lately with everything going on.",
    sender: 'user',
    time: '2:31 PM',
  },
  {
    id: 3,
    text: "I understand that feeling. Would you like to tell me more about what's been overwhelming you?",
    sender: 'listener',
    time: '2:32 PM',
  },
];

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function ChatScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [timeLeft, setTimeLeft] = useState(14 * 60 + 32);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSend = () => {
    if (!message.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [
      ...prev,
      { id: prev.length + 1, text: message.trim(), sender: 'user', time: now },
    ]);
    setMessage('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View className="px-4 py-3 border-b border-border">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <TouchableOpacity
                className="w-8 h-8 rounded-full bg-secondary items-center justify-center"
                onPress={() => router.back()}
              >
                <ArrowLeft size={16} color="#f2f2f5" />
              </TouchableOpacity>
              <View className="flex-row items-center gap-2">
                <View
                  className="w-9 h-9 rounded-full items-center justify-center"
                  style={{ backgroundColor: 'rgba(99,102,241,0.2)' }}
                >
                  <Shield size={16} color="#6366f1" />
                </View>
                <View>
                  <Text className="text-sm font-medium text-foreground">Anonymous Listener</Text>
                  <View className="flex-row items-center gap-1">
                    <View className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <Text className="text-xs text-muted-foreground">Active now</Text>
                  </View>
                </View>
              </View>
            </View>
            <TouchableOpacity className="w-8 h-8 rounded-full bg-secondary items-center justify-center">
              <MoreVertical size={16} color="#9898aa" />
            </TouchableOpacity>
          </View>

          {/* Timer */}
          <View className="mt-3 items-center">
            <View
              className="flex-row items-center gap-2 px-4 py-2 rounded-full border"
              style={{
                backgroundColor: 'rgba(99,102,241,0.1)',
                borderColor: 'rgba(99,102,241,0.2)',
              }}
            >
              <Clock size={16} color="#6366f1" />
              <Text className="text-sm font-medium text-primary">
                {formatTime(timeLeft)} remaining
              </Text>
            </View>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          className="flex-1 px-4 py-4"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          <View className="gap-3">
            {messages.map((msg) => (
              <View
                key={msg.id}
                className={`flex-row ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <View
                  className="max-w-[80%] px-4 py-3"
                  style={{
                    borderRadius: 16,
                    ...(msg.sender === 'user'
                      ? { backgroundColor: '#6366f1', borderBottomRightRadius: 4 }
                      : {
                          backgroundColor: '#252538',
                          borderWidth: 1,
                          borderColor: 'rgba(58,58,85,0.5)',
                          borderBottomLeftRadius: 4,
                        }),
                  }}
                >
                  <Text
                    className="text-sm leading-relaxed"
                    style={{
                      color: msg.sender === 'user' ? '#ffffff' : '#f2f2f5',
                    }}
                  >
                    {msg.text}
                  </Text>
                  <Text
                    className="text-[10px] mt-1.5"
                    style={{
                      color: msg.sender === 'user' ? 'rgba(255,255,255,0.7)' : '#9898aa',
                    }}
                  >
                    {msg.time}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Input */}
        <View className="px-4 pb-4 pt-2">
          <View className="flex-row items-center gap-2">
            <View className="flex-1 bg-card rounded-2xl border border-border px-4 py-3">
              <TextInput
                placeholder="Type a message..."
                placeholderTextColor="#9898aa"
                value={message}
                onChangeText={setMessage}
                onSubmitEditing={handleSend}
                returnKeyType="send"
                className="text-sm text-foreground"
                style={{ color: '#f2f2f5' }}
                multiline={false}
              />
            </View>
            <TouchableOpacity
              onPress={handleSend}
              className="w-12 h-12 rounded-2xl bg-primary items-center justify-center"
            >
              <Send size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
