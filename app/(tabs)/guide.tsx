import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LandscapeHeader } from '@/components/LandscapeHeader';
import { PressableScale } from '@/components/PressableScale';
import { Reveal } from '@/components/Reveal';
import { SpeciesIcon, SpeciesKind } from '@/components/SpeciesIcon';
import { COLORS, softShadow } from '@/constants/AppTheme';
import { useAuth } from '@/context/AuthContext';
import { useSightings } from '@/hooks/useSightings';

const CATS = [
  { name: 'Trees', count: 64, kind: 'cactus' as SpeciesKind },
  { name: 'Birds', count: 142, kind: 'bird' as SpeciesKind },
  { name: 'Insects', count: 217, kind: 'insect' as SpeciesKind },
  { name: 'Snakes', count: 31, kind: 'snake' as SpeciesKind },
];

const SPECIES = [
  { id: 'saguaro', name: 'Saguaro', latin: 'Carnegiea gigantea', region: 'SONORAN', seen: 4, kind: 'cactus' as SpeciesKind },
  { id: 'joshua-tree', name: 'Joshua Tree', latin: 'Yucca brevifolia', region: 'MOJAVE', seen: 2, kind: 'cactus' as SpeciesKind },
  { id: 'palo-verde', name: 'Palo Verde', latin: 'Parkinsonia florida', region: 'SONORAN', seen: 1, kind: 'cactus' as SpeciesKind },
  { id: 'mesquite', name: 'Mesquite', latin: 'Prosopis velutina', region: 'SONORAN', seen: 6, kind: 'cactus' as SpeciesKind },
  { id: 'desert-willow', name: 'Desert Willow', latin: 'Chilopsis linearis', region: 'CHIHUAHUAN', seen: 0, kind: 'cactus' as SpeciesKind },
  { id: 'ocotillo', name: 'Ocotillo', latin: 'Fouquieria splendens', region: 'SONORAN', seen: 1, kind: 'cactus' as SpeciesKind },
  { id: 'ironwood', name: 'Ironwood', latin: 'Olneya tesota', region: 'SONORAN', seen: 0, kind: 'cactus' as SpeciesKind },
];

export default function GuideScreen() {
  const { top } = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { sightings } = useSightings(user?.uid);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Trees');
  const [activeRegion, setActiveRegion] = useState('ALL');

  const activeKind = CATS.find((c) => c.name === activeCategory)?.kind ?? 'cactus';

  const filtered = SPECIES.filter((sp) => {
    const matchesSearch =
      !search.trim() ||
      sp.name.toLowerCase().includes(search.toLowerCase()) ||
      sp.latin.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = sp.kind === activeKind;
    const matchesRegion = activeRegion === 'ALL' || sp.region === activeRegion;
    return matchesSearch && matchesCategory && matchesRegion;
  });

  const seenCount = filtered.filter((sp) =>
    sightings.some((s) => s.speciesId === sp.id),
  ).length;

  const regionLabel =
    activeRegion === 'ALL'
      ? 'All regions'
      : activeRegion.charAt(0) + activeRegion.slice(1).toLowerCase();

  const pickRegion = () =>
    Alert.alert('Filter by region', undefined, [
      { text: 'All regions', onPress: () => setActiveRegion('ALL') },
      { text: 'Sonoran', onPress: () => setActiveRegion('SONORAN') },
      { text: 'Mojave', onPress: () => setActiveRegion('MOJAVE') },
      { text: 'Chihuahuan', onPress: () => setActiveRegion('CHIHUAHUAN') },
      { text: 'Cancel', style: 'cancel' },
    ]);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <LandscapeHeader height={210} />

      <ScrollView
        contentContainerStyle={{ paddingTop: top + 12, paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
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
                    {cat.count}
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
            <Pressable
              onPress={pickRegion}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                backgroundColor: activeRegion !== 'ALL' ? COLORS.clay : COLORS.surface,
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: activeRegion !== 'ALL' ? COLORS.clay : COLORS.sand,
              }}
            >
              <Text style={{ color: activeRegion !== 'ALL' ? COLORS.cream : COLORS.bark, fontWeight: '600', fontSize: 12 }}>
                {regionLabel}
              </Text>
              <Text style={{ color: activeRegion !== 'ALL' ? COLORS.cream : COLORS.bark, fontSize: 10 }}>▾</Text>
            </Pressable>
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
                  <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 16 }}>
                    {sp.name}
                  </Text>
                  <Text
                    style={{
                      color: COLORS.bark,
                      fontStyle: 'italic',
                      fontSize: 13,
                      marginTop: 1,
                    }}
                  >
                    {sp.latin}
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
