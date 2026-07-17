import { Text, View } from 'react-native';

interface StartupConfigurationErrorProps {
  missing: string[];
}

export function StartupConfigurationError({ missing }: StartupConfigurationErrorProps) {
  return (
    <View style={{ flex: 1, backgroundColor: '#0E0D0C', justifyContent: 'center', padding: 24 }}>
      <Text style={{ color: '#F5F1EA', fontSize: 24, fontWeight: '700' }}>
        Talkd is not configured
      </Text>
      <Text style={{ color: '#B8B1A7', fontSize: 15, lineHeight: 22, marginTop: 10 }}>
        This build is missing required service configuration. Please install a newer build.
      </Text>
      <Text style={{ color: '#E89A8A', fontSize: 12, lineHeight: 18, marginTop: 18 }}>
        Missing: {missing.join(', ')}
      </Text>
    </View>
  );
}
