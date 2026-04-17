import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import { CheckCircle2, Star } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const POSITIVE_LABELS = [
  'Great listener',
  'Empathetic',
  'Helpful advice',
  'Non-judgmental',
  'Made me feel better',
  'Patient',
  'Understanding',
  'Supportive',
] as const;

const NEGATIVE_LABELS = [
  'Unresponsive',
  'Rude or dismissive',
  'Unhelpful advice',
  'Judgmental',
  'Made me feel worse',
  'Impatient',
  "Didn't understand",
  'Disconnected early',
] as const;

export default function RatingScreen() {
  const t = useTheme();
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const toggleLabel = (label: string) => {
    setSelectedLabels((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const handleRatingChange = (newRating: number) => {
    const wasPositive = rating >= 3;
    const isPositive = newRating >= 3;
    if (rating > 0 && wasPositive !== isPositive) setSelectedLabels([]);
    setRating(newRating);
  };

  if (submitted) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: t.background, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: t.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
          <CheckCircle2 size={40} color={t.primary} />
        </View>
        <Text style={{ fontFamily: 'Georgia', fontSize: 22, fontWeight: '600', color: t.foreground, textAlign: 'center', marginBottom: 8 }}>
          Thank you
        </Text>
        <Text style={{ fontSize: 14, color: t.mutedForeground, textAlign: 'center', lineHeight: 22 }}>
          Your feedback helps us improve the experience for everyone.
        </Text>
      </SafeAreaView>
    );
  }

  const labels = rating >= 3 ? POSITIVE_LABELS : NEGATIVE_LABELS;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.background }}>
      <ScrollView
        style={{ flex: 1, paddingHorizontal: 20 }}
        contentContainerStyle={{ paddingTop: 32, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Session complete banner */}
        <View style={{ borderRadius: 16, padding: 20, marginBottom: 32, alignItems: 'center', backgroundColor: t.elevated, borderWidth: 1, borderColor: t.border }}>
          <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: t.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <CheckCircle2 size={24} color={t.primary} />
          </View>
          <Text style={{ fontFamily: 'Georgia', fontSize: 17, fontWeight: '600', color: t.foreground }}>Session Complete</Text>
          <Text style={{ fontSize: 13, color: t.mutedForeground, marginTop: 4 }}>Duration: 15 minutes</Text>
        </View>

        {/* Prompt */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <Text style={{ fontFamily: 'Georgia', fontSize: 20, fontWeight: '600', color: t.foreground, marginBottom: 6 }}>
            How was your experience?
          </Text>
          <Text style={{ fontSize: 13.5, color: t.mutedForeground }}>
            Rate your conversation with your listener
          </Text>
        </View>

        {/* Stars */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => handleRatingChange(star)} style={{ padding: 4 }} activeOpacity={0.7}>
              <Star
                size={40}
                color={star <= rating ? t.primary : t.border}
                fill={star <= rating ? t.primary : 'transparent'}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Label chips */}
        {rating > 0 && (
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 13, color: t.mutedForeground, marginBottom: 12, textAlign: 'center' }}>
              {rating >= 3 ? 'What made this session great?' : 'What went wrong with this session?'}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {labels.map((label) => {
                const isSelected = selectedLabels.includes(label);
                const selectedBg = rating >= 3 ? t.primary : t.destructive;
                return (
                  <TouchableOpacity
                    key={label}
                    onPress={() => toggleLabel(label)}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: 999,
                      backgroundColor: isSelected ? selectedBg : t.muted,
                      borderWidth: 1,
                      borderColor: isSelected ? selectedBg : t.border,
                    }}
                  >
                    <Text style={{ fontSize: 12.5, fontWeight: '500', color: isSelected ? '#fff' : t.mutedForeground }}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Submit */}
        <TouchableOpacity
          onPress={() => setSubmitted(true)}
          disabled={rating === 0}
          style={{ paddingVertical: 16, borderRadius: 14, alignItems: 'center', backgroundColor: rating > 0 ? t.primary : t.muted }}
        >
          <Text style={{ fontSize: 15, fontWeight: '600', color: rating > 0 ? t.primaryForeground : t.mutedForeground }}>
            Submit Feedback
          </Text>
        </TouchableOpacity>

        {/* Skip */}
        <TouchableOpacity style={{ marginTop: 12, alignItems: 'center' }} onPress={() => router.back()}>
          <Text style={{ fontSize: 13.5, color: t.mutedForeground }}>Skip for now</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
