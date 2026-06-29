import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/PressableScale';
import { SpeciesIcon, SpeciesKind } from '@/components/SpeciesIcon';
import { COLORS, softShadow } from '@/constants/AppTheme';
import { CATALOG, type Species } from '@/constants/catalog';
import { useAuth } from '@/context/AuthContext';
import { useSightings } from '@/hooks/useSightings';

const KIND_LABEL: Record<Species['kind'], string> = {
  cactus: 'Plant',
  bird: 'Bird',
  insect: 'Insect',
  snake: 'Reptile',
  mammal: 'Mammal',
  lizard: 'Reptile',
};

const KIND_COLOR: Record<Species['kind'], string> = {
  cactus: COLORS.sage,
  bird: COLORS.clay,
  insect: COLORS.gold,
  snake: COLORS.dusk,
  mammal: COLORS.bark,
  lizard: COLORS.dusk,
};

const REGION_LABEL: Record<string, string> = {
  SONORAN: 'Sonoran',
  MOJAVE: 'Mojave',
  CHIHUAHUAN: 'Chihuahuan',
  GREAT_BASIN: 'Great Basin',
};

// Shown before the user types anything
const QUICK_CATEGORIES = [
  { label: 'Plants', kind: 'cactus' as SpeciesKind },
  { label: 'Birds', kind: 'bird' as SpeciesKind },
  { label: 'Insects', kind: 'insect' as SpeciesKind },
  { label: 'Reptiles', kind: 'snake' as SpeciesKind },
];

export default function SearchScreen() {
  const { top } = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { sightings } = useSightings(user?.uid);
  const seenIds = new Set(sightings.map((s) => s.speciesId));

  const [query, setQuery] = useState('');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    // Auto-focus the search field when screen mounts
    const t = setTimeout(() => inputRef.current?.focus(), 120);
    return () => clearTimeout(t);
  }, []);

  const q = query.trim().toLowerCase();
  const results: Species[] = q
    ? CATALOG.filter(
        (sp) =>
          sp.commonName.toLowerCase().includes(q) ||
          sp.latin.toLowerCase().includes(q) ||
          sp.family.toLowerCase().includes(q) ||
          sp.region.toLowerCase().includes(q),
      )
    : [];

  function openSpecies(id: string) {
    Keyboard.dismiss();
    router.push(`/species/${id}` as never);
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Search bar */}
      <Animated.View
        entering={FadeIn.duration(200)}
        style={{
          paddingTop: top + 12,
          paddingBottom: 12,
          paddingHorizontal: 16,
          backgroundColor: COLORS.background,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.sand,
        }}
      >
        <View
          style={[
            {
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: COLORS.surface,
              borderRadius: 22,
              borderWidth: 1,
              borderColor: COLORS.sand,
              paddingHorizontal: 14,
              height: 44,
              gap: 8,
            },
            softShadow(0.04, 4, 1),
          ]}
        >
          <Ionicons name="search" size={18} color={COLORS.bark} />
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            placeholder="Search 90 species…"
            placeholderTextColor={COLORS.bark}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            style={{ flex: 1, color: COLORS.ink, fontSize: 15 }}
            accessibilityLabel="Search species"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} accessibilityLabel="Clear search" accessibilityRole="button">
              <Ionicons name="close-circle" size={18} color={COLORS.bark} />
            </Pressable>
          )}
        </View>
        <Pressable
          onPress={() => { Keyboard.dismiss(); router.back(); }}
          accessibilityLabel="Cancel search"
          accessibilityRole="button"
        >
          <Text style={{ color: COLORS.clay, fontSize: 15, fontWeight: '600' }}>Cancel</Text>
        </Pressable>
      </Animated.View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* No query — show quick-browse categories */}
        {!q && (
          <Animated.View entering={FadeInDown.delay(80).duration(300)} style={{ padding: 20 }}>
            <Text
              style={{
                color: COLORS.bark,
                fontSize: 12,
                fontWeight: '700',
                letterSpacing: 0.5,
                textTransform: 'uppercase',
                marginBottom: 14,
              }}
            >
              Browse by type
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {QUICK_CATEGORIES.map((cat) => {
                const count = CATALOG.filter((s) => s.kind === cat.kind).length;
                const seen = CATALOG.filter((s) => s.kind === cat.kind && seenIds.has(s.id)).length;
                return (
                  <PressableScale
                    key={cat.kind}
                    onPress={() => router.push(`/(tabs)/guide?category=${cat.label}` as never)}
                    scaleTo={0.97}
                    accessibilityLabel={`Browse ${cat.label}`}
                    accessibilityRole="button"
                    style={[
                      {
                        width: '47%',
                        borderRadius: 18,
                        backgroundColor: COLORS.surface,
                        padding: 16,
                        borderWidth: 1,
                        borderColor: COLORS.sand,
                        alignItems: 'center',
                        gap: 8,
                      },
                      softShadow(0.04, 6, 2),
                    ]}
                  >
                    <View
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 14,
                        backgroundColor: KIND_COLOR[cat.kind],
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <SpeciesIcon kind={cat.kind} size={32} color={COLORS.cream} />
                    </View>
                    <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 14 }}>{cat.label}</Text>
                    <Text style={{ color: COLORS.bark, fontSize: 12 }}>
                      <Text style={{ color: COLORS.clay, fontWeight: '700' }}>{seen}</Text>/{count} seen
                    </Text>
                  </PressableScale>
                );
              })}
            </View>

            <Text
              style={{
                color: COLORS.bark,
                fontSize: 12,
                fontWeight: '700',
                letterSpacing: 0.5,
                textTransform: 'uppercase',
                marginTop: 28,
                marginBottom: 14,
              }}
            >
              Browse by desert
            </Text>
            {(['SONORAN', 'MOJAVE', 'CHIHUAHUAN', 'GREAT_BASIN'] as const).map((region) => {
              const count = CATALOG.filter((s) => s.region === region).length;
              return (
                <PressableScale
                  key={region}
                  onPress={() => router.push(`/(tabs)/guide?region=${region}` as never)}
                  scaleTo={0.98}
                  accessibilityLabel={`Browse ${REGION_LABEL[region]} Desert`}
                  accessibilityRole="button"
                  style={[
                    {
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: COLORS.surface,
                      borderRadius: 16,
                      padding: 14,
                      marginBottom: 10,
                      borderWidth: 1,
                      borderColor: COLORS.sand,
                      gap: 14,
                    },
                    softShadow(0.04, 5, 1),
                  ]}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      backgroundColor: COLORS.cream,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name="map-outline" size={20} color={COLORS.clay} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 15 }}>
                      {REGION_LABEL[region]} Desert
                    </Text>
                    <Text style={{ color: COLORS.bark, fontSize: 12, marginTop: 1 }}>
                      {count} species
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.bark} />
                </PressableScale>
              );
            })}
          </Animated.View>
        )}

        {/* Results */}
        {q && results.length === 0 && (
          <Animated.View
            entering={FadeInDown.duration(250)}
            style={{ paddingTop: 60, alignItems: 'center', gap: 8 }}
          >
            <Ionicons name="search-outline" size={40} color={COLORS.sand} />
            <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 17, marginTop: 8 }}>
              No matches
            </Text>
            <Text style={{ color: COLORS.bark, fontSize: 14, textAlign: 'center', paddingHorizontal: 40 }}>
              Try the common name, Latin name, or family — e.g. &quot;saguaro&quot;, &quot;carnegiea&quot;, or &quot;cactaceae&quot;.
            </Text>
          </Animated.View>
        )}

        {q && results.length > 0 && (
          <View style={{ paddingHorizontal: 16, paddingTop: 14 }}>
            <Text
              style={{
                color: COLORS.bark,
                fontSize: 12,
                fontWeight: '700',
                letterSpacing: 0.5,
                textTransform: 'uppercase',
                marginBottom: 12,
              }}
            >
              {results.length} result{results.length !== 1 ? 's' : ''}
            </Text>
            {results.map((sp, i) => {
              const seen = seenIds.has(sp.id);
              return (
                <Animated.View
                  key={sp.id}
                  entering={FadeInDown.delay(i * 40).duration(220)}
                >
                  <PressableScale
                    onPress={() => openSpecies(sp.id)}
                    scaleTo={0.98}
                    accessibilityLabel={`${sp.commonName}, ${KIND_LABEL[sp.kind]}`}
                    accessibilityRole="button"
                    style={[
                      {
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: COLORS.surface,
                        borderRadius: 16,
                        padding: 14,
                        marginBottom: 10,
                        borderWidth: 1,
                        borderColor: seen ? COLORS.sage : COLORS.sand,
                        gap: 14,
                      },
                      softShadow(0.04, 6, 2),
                    ]}
                  >
                    <View
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 14,
                        backgroundColor: seen ? COLORS.sage : COLORS.cream,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <SpeciesIcon kind={sp.kind as SpeciesKind} size={32} color={seen ? COLORS.cream : COLORS.ink} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 15 }}>
                        {sp.commonName}
                      </Text>
                      <Text style={{ color: COLORS.bark, fontStyle: 'italic', fontSize: 13, marginTop: 1 }}>
                        {sp.latin}
                      </Text>
                      <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                        <View
                          style={{
                            backgroundColor: KIND_COLOR[sp.kind],
                            borderRadius: 10,
                            paddingHorizontal: 7,
                            paddingVertical: 2,
                          }}
                        >
                          <Text style={{ color: COLORS.cream, fontSize: 10, fontWeight: '700' }}>
                            {KIND_LABEL[sp.kind]}
                          </Text>
                        </View>
                        <View
                          style={{
                            backgroundColor: COLORS.cream,
                            borderRadius: 10,
                            paddingHorizontal: 7,
                            paddingVertical: 2,
                            borderWidth: 1,
                            borderColor: COLORS.sand,
                          }}
                        >
                          <Text style={{ color: COLORS.bark, fontSize: 10, fontWeight: '600' }}>
                            {REGION_LABEL[sp.region]}
                          </Text>
                        </View>
                        {seen && (
                          <View
                            style={{
                              backgroundColor: COLORS.sage,
                              borderRadius: 10,
                              paddingHorizontal: 7,
                              paddingVertical: 2,
                            }}
                          >
                            <Text style={{ color: COLORS.cream, fontSize: 10, fontWeight: '700' }}>Seen</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={COLORS.bark} />
                  </PressableScale>
                </Animated.View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
