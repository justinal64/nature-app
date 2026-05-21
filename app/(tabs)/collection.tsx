import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS } from '@/constants/AppTheme';

export default function CollectionScreen() {
  const { top } = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background items-center justify-center" style={{ paddingTop: top }}>
      <Ionicons name="leaf" size={72} color={COLORS.border} style={{ marginBottom: 20 }} />
      <Text className="text-2xl font-bold text-text mb-3">No Finds Yet</Text>
      <Text className="text-base text-textDim text-center px-10">
        Go explore and identify nature around you. Your discoveries will appear here.
      </Text>
    </View>
  );
}
