import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/PressableScale';
import { SpeciesIcon, SpeciesKind } from '@/components/SpeciesIcon';
import { COLORS, softShadow } from '@/constants/AppTheme';
import { getSpeciesById } from '@/constants/catalog';
import { useAuth } from '@/context/AuthContext';
import { useSightings } from '@/hooks/useSightings';
import { formatRelativeDate } from '@/utils/date';

const CATS: { name: string; kind: SpeciesKind | 'all' }[] = [
  { name: 'All', kind: 'all' },
  { name: 'Plants', kind: 'plant' },
  { name: 'Birds', kind: 'bird' },
  { name: 'Mammals', kind: 'mammal' },
  { name: 'Lizards', kind: 'lizard' },
  { name: 'Snakes', kind: 'snake' },
  { name: 'Amphibians', kind: 'amphibian' },
  { name: 'Insects', kind: 'insect' },
  { name: 'Arachnids', kind: 'arachnid' },
  { name: 'Fungi', kind: 'fungus' },
  { name: 'Fish', kind: 'fish' },
];

type LifeListEntry = {
  speciesId: string;
  commonName: string;
  latin: string;
  kind: SpeciesKind;
  firstSeen: string;
  count: number;
};

export default function LifeListScreen() {
  const { top } = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { sightings } = useSightings(user?.uid);
  const [filter, setFilter] = useState<SpeciesKind | 'all'>('all');

  const entries = useMemo<LifeListEntry[]>(() => {
    const bySpecies = new Map<string, { count: number; firstSeen: string }>();
    for (const s of sightings) {
      const existing = bySpecies.get(s.speciesId);
      if (!existing) {
        bySpecies.set(s.speciesId, { count: 1, firstSeen: s.capturedAt });
      } else {
        existing.count += 1;
        if (s.capturedAt < existing.firstSeen) existing.firstSeen = s.capturedAt;
      }
    }
    return Array.from(bySpecies.entries())
      .map(([speciesId, { count, firstSeen }]) => {
        const sp = getSpeciesById(speciesId);
        return {
          speciesId,
          commonName: sp?.commonName ?? speciesId,
          latin: sp?.latin ?? '',
          kind: sp?.kind ?? 'plant',
          firstSeen,
          count,
        };
      })
      .sort((a, b) => (a.firstSeen < b.firstSeen ? 1 : -1));
  }, [sightings]);

  const filtered = filter === 'all' ? entries : entries.filter((e) => e.kind === filter);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ paddingTop: top + 14, paddingHorizontal: 16, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.granite }}
        >
          <Ionicons name="chevron-back" size={20} color={COLORS.ink} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 18 }}>Life List</Text>
          <Text style={{ color: COLORS.granite, fontSize: 12 }}>
            {entries.length} species observed
          </Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 12, alignItems: 'center' }}
      >
        {CATS.map((cat) => {
          const active = filter === cat.kind;
          return (
            <PressableScale
              key={cat.kind}
              onPress={() => setFilter(cat.kind)}
              scaleTo={0.95}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: active ? COLORS.lichen : COLORS.surface,
                borderWidth: 1,
                borderColor: active ? COLORS.lichen : COLORS.granite,
              }}
            >
              <Text style={{ color: active ? COLORS.bone : COLORS.ink, fontWeight: '600', fontSize: 13 }}>
                {cat.name}
              </Text>
            </PressableScale>
          );
        })}
      </ScrollView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, gap: 10 }}>
        {filtered.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 60, gap: 8 }}>
            <Ionicons name="albums-outline" size={40} color={COLORS.granite} />
            <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 16 }}>No species yet</Text>
            <Text style={{ color: COLORS.granite, fontSize: 13, textAlign: 'center' }}>
              Log a sighting to start your life list.
            </Text>
          </View>
        ) : (
          filtered.map((entry, i) => (
            <Animated.View key={entry.speciesId} entering={FadeInDown.delay(i * 30).duration(250)}>
              <Pressable
                onPress={() => router.push(`/species/${entry.speciesId}` as never)}
                style={[
                  { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: COLORS.granite, gap: 12 },
                  softShadow(0.04, 6, 2),
                ]}
              >
                <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.lichen, alignItems: 'center', justifyContent: 'center' }}>
                  <SpeciesIcon kind={entry.kind} size={28} color={COLORS.bone} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 15 }}>{entry.commonName}</Text>
                  <Text style={{ color: COLORS.granite, fontStyle: 'italic', fontSize: 12 }}>{entry.latin}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: COLORS.granite, fontSize: 11 }}>
                    First: {formatRelativeDate(entry.firstSeen)}
                  </Text>
                  <Text style={{ color: COLORS.lichen, fontSize: 11, fontWeight: '700' }}>
                    {entry.count} {entry.count === 1 ? 'sighting' : 'sightings'}
                  </Text>
                </View>
              </Pressable>
            </Animated.View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
