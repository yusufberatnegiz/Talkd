import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Sentry } from '@/lib/sentry';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('React render error', error, info.componentStack);
    Sentry.captureException(error);
  }

  private retry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <View style={{ flex: 1, backgroundColor: '#0E0D0C', justifyContent: 'center', padding: 24 }}>
        <Text style={{ color: '#F5F1EA', fontSize: 24, fontWeight: '700' }}>
          Talkd could not open
        </Text>
        <Text style={{ color: '#B8B1A7', fontSize: 15, lineHeight: 22, marginTop: 10 }}>
          The error was recorded. Try opening the app again, or retry now.
        </Text>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={this.retry}
          style={{
            alignItems: 'center',
            alignSelf: 'flex-start',
            backgroundColor: '#E8B57A',
            borderRadius: 8,
            marginTop: 22,
            paddingHorizontal: 20,
            paddingVertical: 13,
          }}
        >
          <Text style={{ color: '#0E0D0C', fontSize: 15, fontWeight: '700' }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }
}
