import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/PressableScale';
import { SpeciesIcon, SpeciesKind } from '@/components/SpeciesIcon';
import { COLORS, softShadow } from '@/constants/AppTheme';
import { CATALOG, getSpeciesById, type Species } from '@/constants/catalog';

const KIND_LABEL: Record<Species['kind'], string> = {
  cactus: 'Plant',
  bird: 'Bird',
  insect: 'Insect',
  snake: 'Reptile',
};

const KIND_COLOR: Record<Species['kind'], string> = {
  cactus: COLORS.sage,
  bird: COLORS.clay,
  insect: COLORS.gold,
  snake: COLORS.dusk,
};

function StatCol({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: highlight ? COLORS.clay + '18' : COLORS.surface,
        borderRadius: 12,
        padding: 10,
        alignItems: 'center',
        borderWidth: highlight ? 1 : 1,
        borderColor: highlight ? COLORS.clay : COLORS.sand,
      }}
    >
      <Text style={{ color: COLORS.bark, fontSize: 10, fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 }}>
        {label}
      </Text>
      <Text style={{ color: COLORS.ink, fontSize: 13, fontWeight: '700', textAlign: 'center' }}>
        {value}
      </Text>
    </View>
  );
}

function SpeciesCard({ sp }: { sp: Species }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 18,
          backgroundColor: KIND_COLOR[sp.kind],
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 8,
        }}
      >
        <SpeciesIcon kind={sp.kind as SpeciesKind} size={46} color={COLORS.cream} />
      </View>
      <Text numberOfLines={2} style={{ color: COLORS.ink, fontWeight: '700', fontSize: 13, textAlign: 'center', lineHeight: 17 }}>
        {sp.commonName}
      </Text>
      <Text style={{ color: COLORS.bark, fontStyle: 'italic', fontSize: 11, textAlign: 'center', marginTop: 2 }}>
        {sp.latin}
      </Text>
      <View
        style={{
          backgroundColor: KIND_COLOR[sp.kind],
          borderRadius: 10,
          paddingHorizontal: 8,
          paddingVertical: 2,
          marginTop: 6,
        }}
      >
        <Text style={{ color: COLORS.cream, fontSize: 10, fontWeight: '700' }}>{KIND_LABEL[sp.kind]}</Text>
      </View>
    </View>
  );
}

export default function CompareScreen() {
  const { top } = useSafeAreaInsets();
  const router = useRouter();
  const { a } = useLocalSearchParams<{ a?: string }>();

  const speciesA = a ? getSpeciesById(a) : undefined;
  const [speciesB, setSpeciesB] = useState<Species | undefined>(undefined);
  const [query, setQuery] = useState('');
  const [picking, setPicking] = useState(!speciesB);

  const q = query.trim().toLowerCase();
  const searchResults = q
    ? CATALOG.filter(
        (sp) =>
          sp.id !== a &&
          (sp.commonName.toLowerCase().includes(q) ||
            sp.latin.toLowerCase().includes(q)),
      ).slice(0, 12)
    : CATALOG.filter((sp) => sp.id !== a && sp.kind === speciesA?.kind).slice(0, 12);

  function pick(sp: Species) {
    setSpeciesB(sp);
    setPicking(false);
    setQuery('');
  }

  if (!speciesA) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: COLORS.ink }}>Species not found.</Text>
      </View>
    );
  }

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
        <Text style={{ flex: 1, color: COLORS.ink, fontWeight: '700', fontSize: 18 }}>Compare Species</Text>
        <Ionicons name="git-compare-outline" size={20} color={COLORS.clay} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Species cards row */}
        <Animated.View
          entering={FadeIn.duration(250)}
          style={{
            flexDirection: 'row',
            padding: 20,
            gap: 14,
            borderBottomWidth: 1,
            borderBottomColor: COLORS.sand,
          }}
        >
          <View style={{ flex: 1, alignItems: 'center' }}>
            <SpeciesCard sp={speciesA} />
          </View>

          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: COLORS.cream,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: COLORS.sand,
              }}
            >
              <Text style={{ color: COLORS.bark, fontWeight: '700', fontSize: 12 }}>VS</Text>
            </View>
          </View>

          <View style={{ flex: 1, alignItems: 'center' }}>
            {speciesB ? (
              <View style={{ alignItems: 'center', gap: 6 }}>
                <SpeciesCard sp={speciesB} />
                <Pressable
                  onPress={() => { setSpeciesB(undefined); setPicking(true); }}
                  accessibilityLabel="Change comparison species"
                  accessibilityRole="button"
                  style={{ marginTop: 4 }}
                >
                  <Text style={{ color: COLORS.clay, fontSize: 12, fontWeight: '600' }}>Change</Text>
                </Pressable>
              </View>
            ) : (
              <PressableScale
                onPress={() => setPicking(true)}
                scaleTo={0.96}
                accessibilityLabel="Pick a species to compare"
                accessibilityRole="button"
                style={[
                  {
                    width: '100%',
                    minHeight: 130,
                    borderRadius: 18,
                    borderWidth: 2,
                    borderColor: COLORS.clay,
                    borderStyle: 'dashed',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    backgroundColor: COLORS.surface,
                  },
                ]}
              >
                <Ionicons name="add-circle-outline" size={32} color={COLORS.clay} />
                <Text style={{ color: COLORS.clay, fontWeight: '600', fontSize: 13, textAlign: 'center' }}>
                  Pick a species
                </Text>
              </PressableScale>
            )}
          </View>
        </Animated.View>

        {/* Picker panel */}
        {picking && (
          <Animated.View entering={FadeInDown.duration(250)} style={{ padding: 20 }}>
            <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 15, marginBottom: 12 }}>
              {q ? 'Search results' : `Similar ${KIND_LABEL[speciesA.kind]}s`}
            </Text>
            <View
              style={[
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: COLORS.surface,
                  borderRadius: 22,
                  borderWidth: 1,
                  borderColor: COLORS.sand,
                  paddingHorizontal: 14,
                  height: 44,
                  gap: 8,
                  marginBottom: 16,
                },
                softShadow(0.04, 4, 1),
              ]}
            >
              <Ionicons name="search" size={16} color={COLORS.bark} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search by name…"
                placeholderTextColor={COLORS.bark}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
                style={{ flex: 1, color: COLORS.ink, fontSize: 14 }}
                accessibilityLabel="Search for a species to compare"
              />
              {query.length > 0 && (
                <Pressable onPress={() => setQuery('')} accessibilityLabel="Clear" accessibilityRole="button">
                  <Ionicons name="close-circle" size={16} color={COLORS.bark} />
                </Pressable>
              )}
            </View>

            {searchResults.map((sp, i) => (
              <Animated.View key={sp.id} entering={FadeInDown.delay(i * 30).duration(180)}>
                <PressableScale
                  onPress={() => pick(sp)}
                  scaleTo={0.98}
                  accessibilityLabel={`Compare with ${sp.commonName}`}
                  accessibilityRole="button"
                  style={[
                    {
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: COLORS.surface,
                      borderRadius: 14,
                      padding: 12,
                      marginBottom: 8,
                      borderWidth: 1,
                      borderColor: COLORS.sand,
                      gap: 12,
                    },
                    softShadow(0.03, 4, 1),
                  ]}
                >
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      backgroundColor: KIND_COLOR[sp.kind],
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <SpeciesIcon kind={sp.kind as SpeciesKind} size={28} color={COLORS.cream} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 14 }}>{sp.commonName}</Text>
                    <Text style={{ color: COLORS.bark, fontStyle: 'italic', fontSize: 12 }}>{sp.latin}</Text>
                  </View>
                  <Ionicons name="add-circle-outline" size={22} color={COLORS.clay} />
                </PressableScale>
              </Animated.View>
            ))}
          </Animated.View>
        )}

        {/* Comparison table */}
        {speciesB && !picking && (
          <Animated.View entering={FadeInDown.duration(300)} style={{ padding: 20 }}>
            {/* Stats comparison */}
            {speciesA.stats.length > 0 && (
              <>
                <Text
                  style={{
                    color: COLORS.bark,
                    fontSize: 11,
                    fontWeight: '700',
                    letterSpacing: 0.5,
                    textTransform: 'uppercase',
                    marginBottom: 12,
                  }}
                >
                  At a glance
                </Text>
                {speciesA.stats.map((stat, i) => {
                  const bStat = speciesB.stats[i];
                  return (
                    <View key={stat.label} style={{ flexDirection: 'row', gap: 10, marginBottom: 8 }}>
                      <StatCol label={stat.label} value={stat.value} />
                      <View style={{ width: 30, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: COLORS.bark, fontSize: 10 }}>—</Text>
                      </View>
                      <StatCol label={bStat?.label ?? stat.label} value={bStat?.value ?? '—'} />
                    </View>
                  );
                })}
              </>
            )}

            {/* Region */}
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 8, marginTop: 4 }}>
              <StatCol label="Region" value={speciesA.region.replace('_', ' ')} />
              <View style={{ width: 30 }} />
              <StatCol label="Region" value={speciesB.region.replace('_', ' ')} />
            </View>

            {/* Family */}
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
              <StatCol label="Family" value={speciesA.family} />
              <View style={{ width: 30 }} />
              <StatCol label="Family" value={speciesB.family} />
            </View>

            {/* ID tips side-by-side */}
            <Text
              style={{
                color: COLORS.bark,
                fontSize: 11,
                fontWeight: '700',
                letterSpacing: 0.5,
                textTransform: 'uppercase',
                marginBottom: 12,
              }}
            >
              How to tell them apart
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1, gap: 6 }}>
                {speciesA.idTips.map((tip) => (
                  <View key={tip} style={{ flexDirection: 'row', gap: 6, alignItems: 'flex-start' }}>
                    <Text style={{ color: COLORS.clay, fontSize: 12, marginTop: 1 }}>•</Text>
                    <Text style={{ color: COLORS.ink, fontSize: 12, flex: 1, lineHeight: 17 }}>{tip}</Text>
                  </View>
                ))}
              </View>
              <View style={{ width: 1, backgroundColor: COLORS.sand }} />
              <View style={{ flex: 1, gap: 6 }}>
                {speciesB.idTips.map((tip) => (
                  <View key={tip} style={{ flexDirection: 'row', gap: 6, alignItems: 'flex-start' }}>
                    <Text style={{ color: COLORS.clay, fontSize: 12, marginTop: 1 }}>•</Text>
                    <Text style={{ color: COLORS.ink, fontSize: 12, flex: 1, lineHeight: 17 }}>{tip}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Navigation links */}
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 28 }}>
              <PressableScale
                onPress={() => router.push(`/species/${speciesA.id}` as never)}
                scaleTo={0.97}
                accessibilityLabel={`View full ${speciesA.commonName} detail`}
                accessibilityRole="button"
                style={[
                  {
                    flex: 1,
                    backgroundColor: COLORS.surface,
                    borderRadius: 14,
                    padding: 12,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: COLORS.sand,
                  },
                  softShadow(0.04, 5, 1),
                ]}
              >
                <Text numberOfLines={1} style={{ color: COLORS.clay, fontWeight: '700', fontSize: 13 }}>
                  {speciesA.commonName}
                </Text>
                <Text style={{ color: COLORS.bark, fontSize: 11, marginTop: 2 }}>Full detail →</Text>
              </PressableScale>
              <PressableScale
                onPress={() => router.push(`/species/${speciesB.id}` as never)}
                scaleTo={0.97}
                accessibilityLabel={`View full ${speciesB.commonName} detail`}
                accessibilityRole="button"
                style={[
                  {
                    flex: 1,
                    backgroundColor: COLORS.surface,
                    borderRadius: 14,
                    padding: 12,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: COLORS.sand,
                  },
                  softShadow(0.04, 5, 1),
                ]}
              >
                <Text numberOfLines={1} style={{ color: COLORS.clay, fontWeight: '700', fontSize: 13 }}>
                  {speciesB.commonName}
                </Text>
                <Text style={{ color: COLORS.bark, fontSize: 11, marginTop: 2 }}>Full detail →</Text>
              </PressableScale>
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}
