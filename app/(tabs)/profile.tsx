import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS, glow } from '@/constants/AppTheme';
import { useAuth } from '@/context/AuthContext';

export default function ProfileScreen() {
  const { top } = useSafeAreaInsets();
  const { user, signOut } = useAuth();

  const initials = user?.displayName
    ? user.displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 24, paddingTop: top + 16, paddingBottom: 60 }}
    >
      <View className="items-center mb-10">
        <View
          className="w-28 h-28 rounded-full items-center justify-center border-2 mb-4"
          style={[
            { backgroundColor: `${COLORS.primary}22`, borderColor: COLORS.primary },
            glow(`${COLORS.primary}60`, 16),
          ]}
        >
          <Text className="text-4xl font-bold" style={{ color: COLORS.primary }}>
            {initials}
          </Text>
        </View>

        <Text className="text-2xl font-bold text-text mb-1">
          {user?.displayName || 'Naturalist'}
        </Text>
        <Text className="text-base text-textDim">{user?.email}</Text>
      </View>

      <View className="gap-4">
        <Pressable
          className="flex-row border border-white/20 p-4 rounded-3xl items-center justify-center"
          onPress={signOut}
        >
          <Text className="text-text text-base font-bold tracking-widest mr-2">SIGN OUT</Text>
          <Ionicons name="log-out-outline" size={20} color={COLORS.text} style={{ opacity: 0.7 }} />
        </Pressable>
      </View>
    </ScrollView>
  );
}
