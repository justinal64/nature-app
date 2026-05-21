import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS, glow, textGlow } from '@/constants/AppTheme';

export default function IdentifyScreen() {
  const { top } = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background items-center justify-center" style={{ paddingTop: top }}>
      <TouchableOpacity
        className="w-40 h-40 rounded-full items-center justify-center border-4 mb-8"
        style={[{ borderColor: COLORS.primary, backgroundColor: `${COLORS.primary}18` }, glow(COLORS.primary, 20)]}
      >
        <Ionicons name="camera" size={64} color={COLORS.primary} />
      </TouchableOpacity>

      <Text
        className="text-3xl font-bold text-primary mb-3 tracking-wide"
        style={textGlow(COLORS.primary, 8)}
      >
        Identify
      </Text>
      <Text className="text-base text-textDim text-center px-10">
        Take a photo or choose from your library to identify plants, animals, and more.
      </Text>
    </View>
  );
}
