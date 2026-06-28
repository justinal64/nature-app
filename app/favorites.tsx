import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/PressableScale';
import { SpeciesIcon, SpeciesKind } from '@/components/SpeciesIcon';
import { COLORS, softShadow } from '@/constants/AppTheme';
import { getSpeciesById } from '@/constants/catalog';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/hooks/useFavorites';

export default function FavoritesScreen() {
  const { top } = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { favoriteIds, loading, refresh } = useFavorites(user?.uid);

  const favorites = favoriteIds
    .map((id) => getSpeciesById(id))
    .filter(Boolean) as NonNullable<ReturnType<typeof getSpeciesById>>[];

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Header */}
      <View
        style={{
          paddingTop: top + 14,
          paddingBottom: 14,
          paddingHorizontal: 20,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.sand,
          backgroundColor: COLORS.background,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: COLORS.surface,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: COLORS.sand,
          }}
        >
          <Ionicons name="chevron-back" size={20} color={COLORS.ink} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 18 }}>Favorites</Text>
          {!loading && (
            <Text style={{ color: COLORS.bark, fontSize: 12, marginTop: 1 }}>
              {favorites.length} species saved
            </Text>
          )}
        </View>
        <Ionicons name="heart" size={20} color={COLORS.clay} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor={COLORS.clay}
            colors={[COLORS.clay]}
          />
        }
      >
        {!loading && favorites.length === 0 && (
          <View style={{ paddingTop: 80, alignItems: 'center', gap: 12 }}>
            <Ionicons name="heart-outline" size={52} color={COLORS.sand} />
            <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 18 }}>No favorites yet</Text>
            <Text
              style={{
                color: COLORS.bark,
                fontSize: 14,
                textAlign: 'center',
                lineHeight: 21,
                paddingHorizontal: 32,
              }}
            >
              Tap the heart on any species detail page to save it here.
            </Text>
            <PressableScale
              onPress={() => router.push('/(tabs)/guide' as never)}
              scaleTo={0.97}
              accessibilityLabel="Browse the guide"
              accessibilityRole="button"
              style={{
                marginTop: 8,
                backgroundColor: COLORS.clay,
                borderRadius: 24,
                paddingVertical: 14,
                paddingHorizontal: 28,
              }}
            >
              <Text style={{ color: COLORS.cream, fontWeight: '700', fontSize: 15 }}>Browse the guide</Text>
            </PressableScale>
          </View>
        )}

        {favorites.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {favorites.map((sp, i) => (
              <Animated.View
                key={sp.id}
                entering={FadeInDown.delay(i * 50).springify().damping(16)}
                style={{ width: '47%' }}
              >
                <PressableScale
                  onPress={() => router.push(`/species/${sp.id}` as never)}
                  scaleTo={0.97}
                  accessibilityLabel={`View ${sp.commonName}`}
                  accessibilityRole="button"
                  style={[
                    {
                      borderRadius: 18,
                      backgroundColor: COLORS.surface,
                      padding: 14,
                      borderWidth: 1,
                      borderColor: COLORS.sand,
                      alignItems: 'center',
                      gap: 10,
                    },
                    softShadow(0.05, 8, 2),
                  ]}
                >
                  <View
                    style={{
                      width: 68,
                      height: 68,
                      borderRadius: 16,
                      backgroundColor: COLORS.cream,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <SpeciesIcon kind={sp.kind as SpeciesKind} size={44} color={COLORS.ink} />
                  </View>
                  <Text
                    numberOfLines={2}
                    style={{
                      color: COLORS.ink,
                      fontWeight: '700',
                      fontSize: 13,
                      textAlign: 'center',
                      lineHeight: 17,
                    }}
                  >
                    {sp.commonName}
                  </Text>
                  <Text
                    style={{
                      color: COLORS.bark,
                      fontStyle: 'italic',
                      fontSize: 11,
                      textAlign: 'center',
                    }}
                    numberOfLines={1}
                  >
                    {sp.latin}
                  </Text>
                </PressableScale>
              </Animated.View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
