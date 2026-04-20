import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '@/lib/theme';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

export type AppearanceChoice = 'light' | 'dark' | 'system';

const APPEARANCE_KEY = 'talkd:appearance';

export const APPEARANCE_LABEL: Record<AppearanceChoice, string> = {
  system: 'Auto',
  light: 'Light',
  dark: 'Dark',
};

type Listener = (choice: AppearanceChoice) => void;
const listeners = new Set<Listener>();
let currentChoice: AppearanceChoice = 'system';

export async function setAppearance(choice: AppearanceChoice) {
  await AsyncStorage.setItem(APPEARANCE_KEY, choice);
  currentChoice = choice;
  listeners.forEach(fn => fn(choice));
}

export function useAppearance() {
  const [preference, setPreference] = useState<AppearanceChoice>(currentChoice);
  const colorScheme = useColorScheme();

  useEffect(() => {
    AsyncStorage.getItem(APPEARANCE_KEY).then(val => {
      if (val === 'light' || val === 'dark' || val === 'system') {
        currentChoice = val;
        setPreference(val);
      }
    });
    listeners.add(setPreference);
    return () => { listeners.delete(setPreference); };
  }, []);

  return {
    preference,
    resolved: preference === 'system' ? (colorScheme ?? 'dark') : preference,
    label: APPEARANCE_LABEL[preference],
  };
}

// TODO Phase 5: implement light theme tokens
export function useTheme() {
  return theme;
}
