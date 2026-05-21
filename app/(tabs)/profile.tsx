import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS, glow } from '@/constants/AppTheme';

export default function ProfileScreen() {
  const { top } = useSafeAreaInsets();

  return (
    <View
      className="flex-1 bg-background items-center justify-center"
      style={{ paddingTop: top }}
    >
      <View
        className="w-28 h-28 rounded-full items-center justify-center border-2 mb-4"
        style={[
          { backgroundColor: `${COLORS.primary}22`, borderColor: COLORS.primary },
          glow(`${COLORS.primary}60`, 16),
        ]}
      >
        <Text className="text-4xl font-bold" style={{ color: COLORS.primary }}>
          ?
        </Text>
      </View>
      <Text className="text-2xl font-bold text-text mb-2">Naturalist</Text>
      <Text className="text-base text-textDim">Profile coming soon</Text>
    </View>
  );
}
