import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS, softShadow } from '@/constants/AppTheme';

// #35 (follow), #36 (community notifications), #39 (identify mode) all need
// the same thing: a real shared backend where other users' content is
// visible to you (a proper observations DB, cross-user data-visibility
// rules, moderation). That's a fundamental pivot away from this app's
// documented offline-first, single-user architecture (CLAUDE.md), not a
// coding task to bolt on quietly. Rather than fake it with mock data,
// this is an honest "not built, here's why" screen for each.
const COPY: Record<string, { icon: keyof typeof Ionicons.glyphMap; title: string; body: string }> = {
  follow: {
    icon: 'people-outline',
    title: 'Follow other naturalists',
    body:
      "WildLens stores everything locally on your device — there's no account of other people's sightings for you to follow yet. Following a feed of other users' observations needs a real shared backend (a proper multi-user database, not just auth), which is a bigger architecture change than this app has made so far.",
  },
  notifications: {
    icon: 'notifications-outline',
    title: 'Community activity notifications',
    body:
      "Notifications about someone else identifying or commenting on your sighting only make sense once other people's activity actually exists in the app. That depends on the same shared backend that following and community IDs need — not built yet.",
  },
  'identify-mode': {
    icon: 'search-outline',
    title: '"Identify" mode',
    body:
      "Browsing other users' unidentified observations to help ID them requires their observations to exist somewhere visible to you first. Same underlying blocker as the other Community features — a shared multi-user backend this offline-first app doesn't have.",
  },
};

export default function CommunityFeatureScreen() {
  const { feature } = useLocalSearchParams<{ feature: string }>();
  const { top } = useSafeAreaInsets();
  const router = useRouter();
  const copy = COPY[feature ?? ''] ?? COPY.follow;

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
      </View>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
        <View
          style={[
            {
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: COLORS.surface,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: COLORS.granite,
              marginBottom: 20,
            },
            softShadow(0.05, 8, 2),
          ]}
        >
          <Ionicons name={copy.icon} size={32} color={COLORS.granite} />
        </View>
        <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 19, textAlign: 'center' }}>
          {copy.title}
        </Text>
        <View
          style={{
            backgroundColor: COLORS.lichen,
            borderRadius: 10,
            paddingHorizontal: 10,
            paddingVertical: 4,
            marginTop: 10,
          }}
        >
          <Text style={{ color: COLORS.bone, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>
            Coming soon
          </Text>
        </View>
        <Text style={{ color: COLORS.granite, fontSize: 14, textAlign: 'center', marginTop: 16, lineHeight: 21 }}>
          {copy.body}
        </Text>
      </View>
    </View>
  );
}
