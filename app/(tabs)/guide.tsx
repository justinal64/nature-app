import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LandscapeHeader } from '@/components/LandscapeHeader';
import { SpeciesIcon, SpeciesKind } from '@/components/SpeciesIcon';
import { COLORS, softShadow } from '@/constants/AppTheme';

const CATS = [
  { name: 'Trees', count: 64, kind: 'cactus' as SpeciesKind, active: true },
  { name: 'Birds', count: 142, kind: 'bird' as SpeciesKind },
  { name: 'Insects', count: 217, kind: 'insect' as SpeciesKind },
  { name: 'Snakes', count: 31, kind: 'snake' as SpeciesKind },
];

const SPECIES = [
  {
    id: 'saguaro',
    name: 'Saguaro',
    latin: 'Carnegiea gigantea',
    region: 'SONORAN',
    seen: 4,
  },
  {
    id: 'joshua-tree',
    name: 'Joshua Tree',
    latin: 'Yucca brevifolia',
    region: 'MOJAVE',
    seen: 2,
  },
  {
    id: 'palo-verde',
    name: 'Palo Verde',
    latin: 'Parkinsonia florida',
    region: 'SONORAN',
    seen: 1,
  },
  {
    id: 'mesquite',
    name: 'Mesquite',
    latin: 'Prosopis velutina',
    region: 'SONORAN',
    seen: 6,
  },
  {
    id: 'desert-willow',
    name: 'Desert Willow',
    latin: 'Chilopsis linearis',
    region: 'CHIHUAHUAN',
    seen: 0,
  },
  {
    id: 'ocotillo',
    name: 'Ocotillo',
    latin: 'Fouquieria splendens',
    region: 'SONORAN',
    seen: 1,
  },
  {
    id: 'ironwood',
    name: 'Ironwood',
    latin: 'Olneya tesota',
    region: 'SONORAN',
    seen: 0,
  },
];

export default function GuideScreen() {
  const { top } = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <LandscapeHeader height={210} />

      <ScrollView
        contentContainerStyle={{ paddingTop: top + 12, paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      >
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
          <Text style={{ color: COLORS.bark, fontSize: 14 }}>Search species…</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 16, gap: 10 }}
        >
          {CATS.map((cat) => (
            <Pressable
              key={cat.name}
              style={[
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 22,
                  backgroundColor: cat.active ? COLORS.clay : COLORS.surface,
                  borderWidth: 1,
                  borderColor: cat.active ? COLORS.clay : COLORS.sand,
                  gap: 8,
                },
                cat.active ? softShadow(0.1, 8, 3) : {},
              ]}
            >
              <SpeciesIcon
                kind={cat.kind}
                size={18}
                color={cat.active ? COLORS.cream : COLORS.ink}
              />
              <Text
                style={{
                  color: cat.active ? COLORS.cream : COLORS.ink,
                  fontWeight: '700',
                  fontSize: 13,
                }}
              >
                {cat.name}
              </Text>
              <Text
                style={{
                  color: cat.active ? 'rgba(244, 236, 218, 0.7)' : COLORS.bark,
                  fontWeight: '600',
                  fontSize: 12,
                }}
              >
                {cat.count}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

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
            <Text style={{ fontWeight: '700' }}>64</Text> species ·{' '}
            <Text style={{ color: COLORS.clay, fontWeight: '700' }}>14 seen</Text>
          </Text>
          <Pressable
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              backgroundColor: COLORS.surface,
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: COLORS.sand,
            }}
          >
            <Text style={{ color: COLORS.bark, fontWeight: '600', fontSize: 12 }}>
              Region: Sonoran
            </Text>
            <Text style={{ color: COLORS.bark, fontSize: 10 }}>▾</Text>
          </Pressable>
        </View>

        <View style={{ paddingHorizontal: 20, gap: 10 }}>
          {SPECIES.map((sp) => (
            <Pressable
              key={sp.id}
              onPress={() => router.push(`/species/${sp.id}`)}
              style={({ pressed }) => [
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: COLORS.surface,
                  borderRadius: 16,
                  padding: 14,
                  borderWidth: 1,
                  borderColor: COLORS.sand,
                  gap: 14,
                  opacity: pressed ? 0.95 : 1,
                  transform: [{ scale: pressed ? 0.995 : 1 }],
                },
                softShadow(0.04, 6, 2),
              ]}
            >
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  backgroundColor: sp.seen > 0 ? COLORS.sage : COLORS.sand,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <SpeciesIcon kind="cactus" size={36} color={COLORS.cream} />
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

              {sp.seen > 0 ? (
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: COLORS.clay, fontSize: 18, fontWeight: '700' }}>
                    {sp.seen}
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
              )}
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
