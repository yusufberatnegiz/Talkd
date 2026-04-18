import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="intent" />
        <Stack.Screen name="match" />
        <Stack.Screen name="chat" />
        <Stack.Screen name="listener" />
        <Stack.Screen name="rating" />
      </Stack>
    </>
  );
}
