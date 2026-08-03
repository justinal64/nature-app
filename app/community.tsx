import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS, softShadow } from '@/constants/AppTheme';

const FEATURES = [
  {
    slug: 'follow',
    icon: 'people-outline' as const,
    title: 'Follow other naturalists',
    blurb: 'See a feed of observations from people you follow.',
  },
  {
    slug: 'notifications',
    icon: 'notifications-outline' as const,
    title: 'Community activity notifications',
    blurb: 'Get notified when someone identifies or comments on your sightings.',
  },
  {
    slug: 'identify-mode',
    icon: 'search-outline' as const,
    title: '"Identify" mode',
    blurb: "Browse and help ID other users' unidentified observations.",
  },
];

export default function CommunityScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View
        style={{
          paddingTop: top + 14,
          paddingBottom: 14,
          paddingHorizontal: 20,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.granite,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityLabel="Back"
          accessibilityRole="button"
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: COLORS.surface,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: COLORS.granite,
          }}
        >
          <Ionicons name="chevron-back" size={20} color={COLORS.ink} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 18 }}>Community</Text>
          <Text style={{ color: COLORS.granite, fontSize: 12, marginTop: 1 }}>Not available yet — see why</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: bottom + 24 }}>
        {FEATURES.map((f) => (
          <Pressable
            key={f.slug}
            onPress={() => router.push(`/community/${f.slug}` as never)}
            accessibilityLabel={`${f.title} — coming soon`}
            accessibilityRole="button"
            style={[
              {
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: COLORS.surface,
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: COLORS.granite,
                gap: 12,
              },
              softShadow(0.04, 5, 1),
            ]}
          >
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                backgroundColor: COLORS.background,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name={f.icon} size={20} color={COLORS.granite} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 14 }}>{f.title}</Text>
              <Text style={{ color: COLORS.granite, fontSize: 12, marginTop: 2, lineHeight: 16 }}>{f.blurb}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.granite} />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
