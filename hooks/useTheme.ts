import { light, dark } from '@/lib/theme';
import { useColorScheme } from 'react-native';

export function useTheme() {
  const scheme = useColorScheme();
  return scheme === 'dark' ? dark : light;
}
