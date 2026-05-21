import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS, glow } from '@/constants/AppTheme';

const CATEGORIES = [
  { name: 'Flowers', icon: 'flower-outline' as const, color: '#E91E8C' },
  { name: 'Trees', icon: 'leaf-outline' as const, color: '#56AB2F' },
  { name: 'Birds', icon: 'golf-outline' as const, color: '#2196F3' },
  { name: 'Snakes', icon: 'shuffle-outline' as const, color: '#FF6F00' },
  { name: 'Insects', icon: 'bug-outline' as const, color: '#9C27B0' },
  { name: 'Fungi', icon: 'partly-sunny-outline' as const, color: '#795548' },
  { name: 'Mammals', icon: 'paw-outline' as const, color: '#607D8B' },
  { name: 'Reptiles', icon: 'globe-outline' as const, color: '#4CAF50' },
];

export default function ExploreScreen() {
  const { top } = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 20, paddingTop: top + 16, paddingBottom: 40 }}
    >
      <Text className="text-3xl font-bold text-text mb-2">Explore Nature</Text>
      <Text className="text-base text-textDim mb-8">What will you discover today?</Text>

      <View className="flex-row flex-wrap gap-4">
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.name}
            className="rounded-2xl p-5 items-center justify-center"
            style={[
              { width: '46%', backgroundColor: `${cat.color}18`, borderWidth: 1, borderColor: `${cat.color}40` },
              glow(`${cat.color}40`, 6),
            ]}
          >
            <Ionicons name={cat.icon} size={36} color={cat.color} style={{ marginBottom: 10 }} />
            <Text className="text-text font-bold text-base">{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
