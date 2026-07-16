import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkTheme, lightTheme, type Theme } from '@/lib/theme';
import { useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

export type AppearanceChoice = 'light' | 'dark' | 'system';
export type AccentChoice = 'classic' | 'sage' | 'violet' | 'ocean' | 'rose';

const APPEARANCE_KEY = 'talkd:appearance';
const ACCENT_KEY = 'talkd:accent';

export const APPEARANCE_LABEL: Record<AppearanceChoice, string> = {
  system: 'Auto',
  light: 'Light',
  dark: 'Dark',
};

export const ACCENT_LABEL: Record<AccentChoice, string> = {
  classic: 'Classic',
  sage: 'Sage',
  violet: 'Violet',
  ocean: 'Ocean',
  rose: 'Rose',
};

interface AccentPalette {
  key: AccentChoice;
  label: string;
  swatch: string;
  dark: {
    primary: string;
    secondary: string;
    onAccent: string;
  };
  light: {
    primary: string;
    secondary: string;
    onAccent: string;
  };
}

export const ACCENT_OPTIONS: AccentPalette[] = [
  {
    key: 'classic',
    label: ACCENT_LABEL.classic,
    swatch: darkTheme.amber,
    dark: { primary: darkTheme.amber, secondary: darkTheme.coral, onAccent: darkTheme.onAccent },
    light: { primary: lightTheme.amber, secondary: lightTheme.coral, onAccent: lightTheme.onAccent },
  },
  {
    key: 'sage',
    label: ACCENT_LABEL.sage,
    swatch: '#9AB39C',
    dark: { primary: '#9AB39C', secondary: '#E8B57A', onAccent: '#0E0D0C' },
    light: { primary: '#668B69', secondary: '#B9792E', onAccent: '#FFFFFF' },
  },
  {
    key: 'violet',
    label: ACCENT_LABEL.violet,
    swatch: '#B5A8D9',
    dark: { primary: '#B5A8D9', secondary: '#E89A8A', onAccent: '#0E0D0C' },
    light: { primary: '#7B63B7', secondary: '#C45E50', onAccent: '#FFFFFF' },
  },
  {
    key: 'ocean',
    label: ACCENT_LABEL.ocean,
    swatch: '#5F91C8',
    dark: { primary: '#7FA8D6', secondary: '#9AB39C', onAccent: '#0E0D0C' },
    light: { primary: '#3D72A9', secondary: '#668B69', onAccent: '#FFFFFF' },
  },
  {
    key: 'rose',
    label: ACCENT_LABEL.rose,
    swatch: '#E89A8A',
    dark: { primary: '#E89A8A', secondary: '#E8B57A', onAccent: '#0E0D0C' },
    light: { primary: '#C45E50', secondary: '#B9792E', onAccent: '#FFFFFF' },
  },
];

type Listener = (choice: AppearanceChoice) => void;
const listeners = new Set<Listener>();
let currentChoice: AppearanceChoice = 'system';

type AccentListener = (choice: AccentChoice) => void;
const accentListeners = new Set<AccentListener>();
let currentAccent: AccentChoice = 'classic';

function isAccentChoice(value: string | null): value is AccentChoice {
  return value === 'classic'
    || value === 'sage'
    || value === 'violet'
    || value === 'ocean'
    || value === 'rose';
}

function rgba(hex: string, alpha: number) {
  const normalized = hex.replace('#', '');
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function applyAccent(base: Theme, choice: AccentChoice, mode: 'light' | 'dark'): Theme {
  const option = ACCENT_OPTIONS.find(item => item.key === choice) ?? ACCENT_OPTIONS[0];
  const palette = option[mode];

  return {
    ...base,
    amber: palette.primary,
    amberDim: rgba(palette.primary, mode === 'light' ? 0.14 : 0.18),
    amberSoft: rgba(palette.primary, 0.10),
    coral: palette.secondary,
    coralDim: rgba(palette.secondary, mode === 'light' ? 0.14 : 0.18),
    coralSoft: rgba(palette.secondary, 0.10),
    onAccent: palette.onAccent,
  };
}

export async function setAppearance(choice: AppearanceChoice) {
  await AsyncStorage.setItem(APPEARANCE_KEY, choice);
  currentChoice = choice;
  listeners.forEach(fn => fn(choice));
}

export async function setAccentChoice(choice: AccentChoice) {
  await AsyncStorage.setItem(ACCENT_KEY, choice);
  currentAccent = choice;
  accentListeners.forEach(fn => fn(choice));
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

export function useAccentPreference() {
  const [preference, setPreference] = useState<AccentChoice>(currentAccent);

  useEffect(() => {
    AsyncStorage.getItem(ACCENT_KEY).then(val => {
      if (isAccentChoice(val)) {
        currentAccent = val;
        setPreference(val);
      }
    });
    accentListeners.add(setPreference);
    return () => { accentListeners.delete(setPreference); };
  }, []);

  return {
    preference,
    label: ACCENT_LABEL[preference],
  };
}

export function useTheme() {
  const { resolved } = useAppearance();
  const { preference: accent } = useAccentPreference();

  return useMemo(() => {
    const mode = resolved === 'light' ? 'light' : 'dark';
    const base = mode === 'light' ? lightTheme : darkTheme;
    return applyAccent(base, accent, mode);
  }, [accent, resolved]);
}
