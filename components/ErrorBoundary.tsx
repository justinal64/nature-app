import { Ionicons } from '@expo/vector-icons';
import { Component, ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { COLORS, glow } from '@/constants/AppTheme';

type Props = { children: ReactNode };
type State = { hasError: boolean; message: string };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message ?? 'Unknown error' };
  }

  reset = () => this.setState({ hasError: false, message: '' });

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.background,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 36,
        }}
      >
        <View
          style={[
            {
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: COLORS.clay,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
            },
            glow(COLORS.clay, 14),
          ]}
        >
          <Ionicons name="warning-outline" size={38} color={COLORS.cream} />
        </View>

        <Text
          style={{
            color: COLORS.ink,
            fontSize: 22,
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: 12,
          }}
        >
          Something went wrong
        </Text>
        <Text
          style={{
            color: COLORS.bark,
            fontSize: 14,
            textAlign: 'center',
            lineHeight: 21,
            marginBottom: 32,
          }}
        >
          WildLens ran into an unexpected problem. Your journal and sightings are safe — tap below to try again.
        </Text>

        <Pressable
          onPress={this.reset}
          accessibilityLabel="Try again"
          accessibilityRole="button"
          style={[
            {
              backgroundColor: COLORS.clay,
              borderRadius: 28,
              paddingVertical: 16,
              paddingHorizontal: 40,
              alignItems: 'center',
            },
            glow(COLORS.clay, 10),
          ]}
        >
          <Text style={{ color: COLORS.cream, fontWeight: '700', fontSize: 16 }}>Try again</Text>
        </Pressable>
      </View>
    );
  }
}
