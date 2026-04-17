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
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoveredRating] = useState(0);
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
    if (rating > 0 && wasPositive !== isPositive) {
      setSelectedLabels([]);
    }
    setRating(newRating);
  };

  if (submitted) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center px-6">
        <View
          className="w-20 h-20 rounded-full items-center justify-center mb-6"
          style={{ backgroundColor: 'rgba(99,102,241,0.2)' }}
        >
          <CheckCircle2 size={40} color="#6366f1" />
        </View>
        <Text className="text-xl font-semibold text-foreground mb-2 text-center">
          Thank you for your feedback!
        </Text>
        <Text className="text-muted-foreground text-sm text-center leading-relaxed">
          Your rating helps us improve the experience for everyone.
        </Text>
      </SafeAreaView>
    );
  }

  const labels = rating >= 3 ? POSITIVE_LABELS : NEGATIVE_LABELS;
  const displayRating = hoveredRating || rating;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingTop: 32, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Session complete banner */}
        <View
          className="rounded-2xl p-4 mb-8 items-center border"
          style={{
            backgroundColor: 'rgba(99,102,241,0.1)',
            borderColor: 'rgba(99,102,241,0.2)',
          }}
        >
          <View
            className="w-12 h-12 rounded-full items-center justify-center mb-3"
            style={{ backgroundColor: 'rgba(99,102,241,0.2)' }}
          >
            <CheckCircle2 size={24} color="#6366f1" />
          </View>
          <Text className="text-foreground font-medium">Session Complete</Text>
          <Text className="text-muted-foreground text-sm mt-1">Duration: 15 minutes</Text>
        </View>

        {/* Rating section */}
        <View className="items-center mb-6">
          <Text className="text-lg font-semibold text-foreground mb-2">
            How was your experience?
          </Text>
          <Text className="text-muted-foreground text-sm">
            Rate your conversation with your listener
          </Text>
        </View>

        {/* Stars */}
        <View className="flex-row items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => handleRatingChange(star)}
              className="p-1"
              activeOpacity={0.7}
            >
              <Star
                size={40}
                color={star <= displayRating ? '#6366f1' : 'rgba(152,152,170,0.4)'}
                fill={star <= displayRating ? '#6366f1' : 'transparent'}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Label chips */}
        {rating > 0 && (
          <View className="mb-6">
            <Text className="text-sm text-muted-foreground mb-3 text-center">
              {rating >= 3
                ? 'What made this session great?'
                : 'What went wrong with this session?'}
            </Text>
            <View className="flex-row flex-wrap gap-2 justify-center">
              {labels.map((label) => {
                const isSelected = selectedLabels.includes(label);
                return (
                  <TouchableOpacity
                    key={label}
                    onPress={() => toggleLabel(label)}
                    className="px-3 py-1.5 rounded-full"
                    style={
                      isSelected
                        ? {
                            backgroundColor:
                              rating >= 3 ? '#6366f1' : '#ef4444',
                          }
                        : {
                            backgroundColor: '#252538',
                            borderWidth: 1,
                            borderColor: 'rgba(58,58,85,0.5)',
                          }
                    }
                  >
                    <Text
                      className="text-xs font-medium"
                      style={{
                        color: isSelected ? '#ffffff' : '#9898aa',
                      }}
                    >
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
          className="w-full py-4 rounded-2xl items-center"
          style={{
            backgroundColor: rating > 0 ? '#6366f1' : '#2d2d45',
          }}
        >
          <Text
            className="font-medium"
            style={{ color: rating > 0 ? '#ffffff' : '#9898aa' }}
          >
            Submit Feedback
          </Text>
        </TouchableOpacity>

        {/* Skip */}
        <TouchableOpacity className="mt-3 items-center" onPress={() => router.back()}>
          <Text className="text-sm text-muted-foreground">Skip for now</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
