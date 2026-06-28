import { Ionicons } from '@expo/vector-icons';
import { Text } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';

import { COLORS } from '@/constants/AppTheme';
import { useNetworkState } from '@/hooks/useNetworkState';

export function OfflineBar() {
  const { isConnected } = useNetworkState();
  if (isConnected) return null;

  return (
    <Animated.View
      entering={FadeInDown.duration(300)}
      exiting={FadeOutUp.duration(300)}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 999,
        backgroundColor: COLORS.dusk,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 7,
        gap: 6,
      }}
    >
      <Ionicons name="wifi-outline" size={14} color={COLORS.cream} />
      <Text style={{ color: COLORS.cream, fontSize: 12, fontWeight: '700' }}>
        No connection — working offline
      </Text>
    </Animated.View>
  );
}
