import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LandscapeHeader } from '@/components/LandscapeHeader';
import { PressableScale } from '@/components/PressableScale';
import { Reveal } from '@/components/Reveal';
import { SpeciesIcon, SpeciesKind } from '@/components/SpeciesIcon';
import { COLORS, softShadow } from '@/constants/AppTheme';
import { CATALOG, Region, getCategoryCount, getRegionForCoords, isActiveNow } from '@/constants/catalog';
import { useAuth } from '@/context/AuthContext';
import { useDisplayPrefs } from '@/context/DisplayPrefsContext';
import { useSightings } from '@/hooks/useSightings';

const CATS = [
  { name: 'Plants', kind: 'cactus' as SpeciesKind },
  { name: 'Birds', kind: 'bird' as SpeciesKind },
  { name: 'Mammals', kind: 'mammal' as SpeciesKind },
  { name: 'Lizards', kind: 'lizard' as SpeciesKind },
  { name: 'Snakes', kind: 'snake' as SpeciesKind },
  { name: 'Amphibians', kind: 'amphibian' as SpeciesKind },
  { name: 'Insects', kind: 'insect' as SpeciesKind },
  { name: 'Arachnids', kind: 'arachnid' as SpeciesKind },
  { name: 'Fungi', kind: 'fungus' as SpeciesKind },
  { name: 'Fish', kind: 'fish' as SpeciesKind },
];

export default function GuideScreen() {
  const { top } = useSafeAreaInsets();
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category?: string }>();
  const { user } = useAuth();
  const { preferScientific, displayName: spName } = useDisplayPrefs();
  const { sightings, loading: sightingsLoading, refresh: refreshSightings } = useSightings(user?.uid);
  const [search, setSearch] = useState('');
  const validCategory = CATS.some((c) => c.name === category) ? (category as string) : 'Plants';
  const [activeCategory, setActiveCategory] = useState(validCategory);
  const [activeRegion, setActiveRegion] = useState('ALL');
  const [visibleNow, setVisibleNow] = useState(false);
  const [nearMe, setNearMe] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [unseenOnly, setUnseenOnly] = useState(false);

  const activeKind = CATS.find((c) => c.name === activeCategory)?.kind ?? 'cactus';
  const seenIds = new Set(sightings.map((s) => s.speciesId));

  const filtered = CATALOG.filter((sp) => {
    const matchesSearch =
      !search.trim() ||
      sp.commonName.toLowerCase().includes(search.toLowerCase()) ||
      sp.latin.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = sp.kind === activeKind;
    const matchesRegion = activeRegion === 'ALL' || sp.region === activeRegion;
    const matchesSeason = !visibleNow || isActiveNow(sp.id);
    const matchesUnseen = !unseenOnly || !seenIds.has(sp.id);
    return matchesSearch && matchesCategory && matchesRegion && matchesSeason && matchesUnseen;
  });

  const seenCount = filtered.filter((sp) => seenIds.has(sp.id)).length;

  const regionLabel =
    activeRegion === 'ALL'
      ? 'All regions'
      : activeRegion.charAt(0) + activeRegion.slice(1).toLowerCase();

  const pickRegion = () => {
    setNearMe(false);
    Alert.alert('Filter by region', undefined, [
      { text: 'All regions', onPress: () => setActiveRegion('ALL') },
      { text: 'Sonoran', onPress: () => setActiveRegion('SONORAN') },
      { text: 'Mojave', onPress: () => setActiveRegion('MOJAVE') },
      { text: 'Chihuahuan', onPress: () => setActiveRegion('CHIHUAHUAN') },
      { text: 'Great Basin', onPress: () => setActiveRegion('GREAT_BASIN') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const toggleNearMe = async () => {
    if (nearMe) {
      setNearMe(false);
      setActiveRegion('ALL');
      return;
    }
    setLocLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location needed', 'Allow location access in Settings to filter by your region.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const region = getRegionForCoords(pos.coords.latitude, pos.coords.longitude);
      if (!region) {
        Alert.alert('Outside catalog range', 'Your current location isn\'t in our covered desert regions.');
        return;
      }
      setActiveRegion(region as Region);
      setNearMe(true);
    } catch {
      Alert.alert('Error', 'Could not get your location. Please try again.');
    } finally {
      setLocLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <LandscapeHeader height={210} />

      <ScrollView
        contentContainerStyle={{ paddingTop: top + 12, paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={sightingsLoading}
            onRefresh={refreshSightings}
            tintColor={COLORS.clay}
            colors={[COLORS.clay]}
          />
        }
      >
        <Reveal>
          <View style={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 14 }}>
            <Text
              style={{
                color: COLORS.bark,
                fontSize: 12,
                fontWeight: '700',
                letterSpacing: 0.6,
                textTransform: 'uppercase',
                marginBottom: 6,
              }}
            >
              Sonoran Desert · 454 species
            </Text>
            <Text style={{ color: COLORS.ink, fontSize: 30, fontWeight: '700' }}>Field Guide</Text>
          </View>
        </Reveal>

        <Reveal delay={70}>
          <View
            style={{
              marginHorizontal: 20,
              backgroundColor: COLORS.surface,
              borderRadius: 16,
              paddingHorizontal: 14,
              paddingVertical: 12,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              borderWidth: 1,
              borderColor: COLORS.sand,
            }}
          >
            <Ionicons name="search" size={16} color={COLORS.bark} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search species…"
              placeholderTextColor={COLORS.bark}
              returnKeyType="search"
              style={{ flex: 1, color: COLORS.ink, fontSize: 14 }}
            />
          </View>
        </Reveal>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 16, gap: 10 }}
        >
          {CATS.map((cat, i) => {
            const active = cat.name === activeCategory;
            return (
              <Animated.View key={cat.name} entering={FadeInRight.delay(120 + i * 60).springify().damping(15)}>
                <PressableScale
                  scaleTo={0.93}
                  onPress={() => setActiveCategory(cat.name)}
                  style={[
                    {
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      borderRadius: 22,
                      backgroundColor: active ? COLORS.clay : COLORS.surface,
                      borderWidth: 1,
                      borderColor: active ? COLORS.clay : COLORS.sand,
                      gap: 8,
                    },
                    active ? softShadow(0.1, 8, 3) : {},
                  ]}
                >
                  <SpeciesIcon kind={cat.kind} size={18} color={active ? COLORS.cream : COLORS.ink} />
                  <Text style={{ color: active ? COLORS.cream : COLORS.ink, fontWeight: '700', fontSize: 13 }}>
                    {cat.name}
                  </Text>
                  <Text style={{ color: active ? 'rgba(244, 236, 218, 0.7)' : COLORS.bark, fontWeight: '600', fontSize: 12 }}>
                    {getCategoryCount(cat.kind)}
                  </Text>
                </PressableScale>
              </Animated.View>
            );
          })}
        </ScrollView>

        <Reveal delay={160}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 24,
              marginTop: 6,
              marginBottom: 12,
            }}
          >
            <Text style={{ color: COLORS.ink, fontSize: 14, fontWeight: '600' }}>
              <Text style={{ fontWeight: '700' }}>{filtered.length}</Text> species ·{' '}
              <Text style={{ color: COLORS.clay, fontWeight: '700' }}>{seenCount} seen</Text>
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Pressable
                onPress={() => setUnseenOnly((v) => !v)}
                accessibilityLabel={unseenOnly ? 'Show all species' : 'Show unseen species only'}
                accessibilityRole="button"
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  backgroundColor: unseenOnly ? COLORS.gold : COLORS.surface,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: unseenOnly ? COLORS.gold : COLORS.sand,
                }}
              >
                <Ionicons name="eye-off-outline" size={12} color={unseenOnly ? COLORS.ink : COLORS.bark} />
                <Text style={{ color: unseenOnly ? COLORS.ink : COLORS.bark, fontWeight: '600', fontSize: 12 }}>
                  Unseen
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setVisibleNow((v) => !v)}
                accessibilityLabel={visibleNow ? 'Show all seasons' : 'Show species active now'}
                accessibilityRole="button"
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  backgroundColor: visibleNow ? COLORS.sage : COLORS.surface,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: visibleNow ? COLORS.sage : COLORS.sand,
                }}
              >
                <Text style={{ color: visibleNow ? COLORS.ink : COLORS.bark, fontWeight: '600', fontSize: 12 }}>
                  Now
                </Text>
              </Pressable>
              <Pressable
                onPress={toggleNearMe}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  backgroundColor: nearMe ? COLORS.dusk : COLORS.surface,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: nearMe ? COLORS.dusk : COLORS.sand,
                }}
              >
                <Ionicons
                  name={locLoading ? 'hourglass-outline' : 'location-outline'}
                  size={12}
                  color={nearMe ? COLORS.cream : COLORS.bark}
                />
                <Text style={{ color: nearMe ? COLORS.cream : COLORS.bark, fontWeight: '600', fontSize: 12 }}>
                  Near me
                </Text>
              </Pressable>
              <Pressable
                onPress={pickRegion}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  backgroundColor: activeRegion !== 'ALL' && !nearMe ? COLORS.clay : COLORS.surface,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: activeRegion !== 'ALL' && !nearMe ? COLORS.clay : COLORS.sand,
                }}
              >
                <Text style={{ color: activeRegion !== 'ALL' && !nearMe ? COLORS.cream : COLORS.bark, fontWeight: '600', fontSize: 12 }}>
                  {regionLabel}
                </Text>
                <Text style={{ color: activeRegion !== 'ALL' && !nearMe ? COLORS.cream : COLORS.bark, fontSize: 10 }}>▾</Text>
              </Pressable>
            </View>
          </View>
        </Reveal>

        <View style={{ paddingHorizontal: 20, gap: 10 }}>
          {filtered.length === 0 && (
            <View style={{ paddingVertical: 32, alignItems: 'center' }}>
              <Text style={{ color: COLORS.bark, fontSize: 14 }}>No species match &ldquo;{search}&rdquo;</Text>
            </View>
          )}
          {filtered.map((sp, i) => (
            <Animated.View
              key={sp.id}
              entering={FadeInDown.delay(200 + i * 55).springify().damping(15).stiffness(150)}
            >
              <PressableScale
                onPress={() => router.push(`/species/${sp.id}`)}
                scaleTo={0.98}
                accessibilityLabel={`${sp.commonName}, ${sp.latin}`}
                accessibilityRole="button"
                style={[
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: COLORS.surface,
                    borderRadius: 16,
                    padding: 14,
                    borderWidth: 1,
                    borderColor: COLORS.sand,
                    gap: 14,
                  },
                  softShadow(0.04, 6, 2),
                ]}
              >
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    backgroundColor: sightings.some((s) => s.speciesId === sp.id) ? COLORS.sage : COLORS.sand,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <SpeciesIcon kind={sp.kind} size={36} color={COLORS.cream} />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 16, fontStyle: preferScientific ? 'italic' : 'normal' }}>
                    {spName(sp)}
                  </Text>
                  <Text
                    style={{
                      color: COLORS.bark,
                      fontStyle: preferScientific ? 'normal' : 'italic',
                      fontSize: 13,
                      marginTop: 1,
                    }}
                  >
                    {preferScientific ? sp.commonName : sp.latin}
                  </Text>
                  <View
                    style={{
                      alignSelf: 'flex-start',
                      marginTop: 6,
                      backgroundColor: COLORS.cream,
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 6,
                    }}
                  >
                    <Text
                      style={{
                        color: COLORS.bark,
                        fontSize: 10,
                        fontWeight: '700',
                        letterSpacing: 0.6,
                      }}
                    >
                      {sp.region}
                    </Text>
                  </View>
                </View>

                {(() => {
                  const spCount = sightings.filter((s) => s.speciesId === sp.id).length;
                  return spCount > 0 ? (
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ color: COLORS.clay, fontSize: 18, fontWeight: '700' }}>
                        {spCount}
                        <Text style={{ color: COLORS.bark, fontSize: 11, fontWeight: '500' }}>
                          {' '}
                          seen
                        </Text>
                      </Text>
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color={COLORS.sage}
                        style={{ marginTop: 4 }}
                      />
                    </View>
                  ) : (
                    <Text style={{ color: COLORS.bark, fontSize: 11, fontStyle: 'italic' }}>
                      not seen
                    </Text>
                  );
                })()}
              </PressableScale>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
