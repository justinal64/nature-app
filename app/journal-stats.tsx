import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SpeciesIcon, SpeciesKind } from '@/components/SpeciesIcon';
import { COLORS, softShadow } from '@/constants/AppTheme';
import { useAuth } from '@/context/AuthContext';
import { useSightings } from '@/hooks/useSightings';

const KIND_LABELS: Record<string, string> = {
  cactus: 'Plants',
  bird: 'Birds',
  insect: 'Insects',
  snake: 'Reptiles',
  mammal: 'Mammals',
  lizard: 'Lizards',
  amphibian: 'Amphibians',
  arachnid: 'Arachnids',
};

const KIND_COLOR: Record<string, string> = {
  cactus: COLORS.sage,
  bird: COLORS.clay,
  insect: COLORS.gold,
  snake: COLORS.dusk,
  mammal: COLORS.bark,
  lizard: COLORS.dusk,
  amphibian: COLORS.sage,
  arachnid: COLORS.ink,
};

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function JournalStatsScreen() {
  const { top } = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { sightings } = useSightings(user?.uid);

  const total = sightings.length;
  const uniqueSpecies = new Set(sightings.map((s) => s.speciesId)).size;

  // Sightings by kind
  const byKind = ['cactus', 'bird', 'mammal', 'snake', 'lizard', 'insect', 'arachnid', 'amphibian'].map((kind) => ({
    kind,
    count: sightings.filter((s) => s.kind === kind).length,
  }));
  const maxKind = Math.max(...byKind.map((k) => k.count), 1);

  // Sightings by month (last 12 months)
  const now = new Date();
  const byMonth = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    const count = sightings.filter((s) => {
      const sd = new Date(s.capturedAt);
      return sd.getFullYear() === d.getFullYear() && sd.getMonth() === d.getMonth();
    }).length;
    return { label: MONTH_NAMES[d.getMonth()], count };
  });
  const maxMonth = Math.max(...byMonth.map((m) => m.count), 1);

  // Most-logged species
  const speciesCounts: Record<string, { name: string; kind: string; count: number }> = {};
  for (const s of sightings) {
    if (!speciesCounts[s.speciesId]) {
      speciesCounts[s.speciesId] = { name: s.commonName, kind: s.kind, count: 0 };
    }
    speciesCounts[s.speciesId].count++;
  }
  const topSpecies = Object.entries(speciesCounts)
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Current / best streak
  const sortedDates = [...new Set(sightings.map((s) => new Date(s.capturedAt).toDateString()))].sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime(),
  );
  let currentStreak = 0;
  let bestStreak = 0;
  let run = 0;
  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) { run = 1; }
    else {
      const prev = new Date(sortedDates[i - 1]);
      const curr = new Date(sortedDates[i]);
      const diff = (curr.getTime() - prev.getTime()) / 86400000;
      run = diff <= 1 ? run + 1 : 1;
    }
    if (run > bestStreak) bestStreak = run;
  }
  const todayStr = new Date().toDateString();
  const yesterdayStr = new Date(Date.now() - 86400000).toDateString();
  if (sortedDates.includes(todayStr) || sortedDates.includes(yesterdayStr)) {
    currentStreak = run;
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
          backgroundColor: COLORS.background,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          style={{
            width: 40, height: 40, borderRadius: 20,
            backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center',
            borderWidth: 1, borderColor: COLORS.sand,
          }}
        >
          <Ionicons name="chevron-back" size={20} color={COLORS.ink} />
        </TouchableOpacity>
        <Text style={{ flex: 1, color: COLORS.ink, fontWeight: '700', fontSize: 18 }}>My Field Stats</Text>
        <Ionicons name="stats-chart" size={20} color={COLORS.clay} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 48 }} showsVerticalScrollIndicator={false}>

        {/* Top stats row */}
        <Animated.View entering={FadeInDown.duration(280)} style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Total sightings', value: total, icon: 'leaf', color: COLORS.sage },
            { label: 'Species found', value: uniqueSpecies, icon: 'albums', color: COLORS.clay },
            { label: 'Best streak', value: bestStreak, icon: 'flame', color: COLORS.gold },
            { label: 'Current streak', value: currentStreak, icon: 'trending-up', color: COLORS.dusk },
          ].map((s) => (
            <View
              key={s.label}
              style={[
                {
                  flex: 1, backgroundColor: COLORS.surface, borderRadius: 16, padding: 12,
                  alignItems: 'center', gap: 4, borderWidth: 1, borderColor: COLORS.sand,
                },
                softShadow(0.04, 5, 1),
              ]}
            >
              <Ionicons name={s.icon as never} size={18} color={s.color} />
              <Text style={{ color: COLORS.ink, fontSize: 20, fontWeight: '800' }}>{s.value}</Text>
              <Text style={{ color: COLORS.bark, fontSize: 9, textAlign: 'center', lineHeight: 12 }}>{s.label}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Sightings by kind */}
        <Animated.View entering={FadeInDown.delay(60).duration(280)} style={{ marginBottom: 24 }}>
          <Text style={{ color: COLORS.bark, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 }}>
            By type
          </Text>
          {byKind.map((k) => (
            <View key={k.kind} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 }}>
              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: KIND_COLOR[k.kind], alignItems: 'center', justifyContent: 'center' }}>
                <SpeciesIcon kind={k.kind as SpeciesKind} size={22} color={COLORS.cream} />
              </View>
              <Text style={{ color: COLORS.ink, fontWeight: '600', fontSize: 13, width: 64 }}>{KIND_LABELS[k.kind]}</Text>
              <View style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: COLORS.sand, overflow: 'hidden' }}>
                <View
                  style={{
                    height: '100%',
                    borderRadius: 4,
                    backgroundColor: KIND_COLOR[k.kind],
                    width: `${(k.count / maxKind) * 100}%`,
                  }}
                />
              </View>
              <Text style={{ color: COLORS.bark, fontSize: 12, width: 22, textAlign: 'right' }}>{k.count}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Monthly activity */}
        <Animated.View entering={FadeInDown.delay(120).duration(280)} style={{ marginBottom: 24 }}>
          <Text style={{ color: COLORS.bark, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 }}>
            Last 12 months
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 80 }}>
            {byMonth.map((m) => (
              <View key={m.label} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                <View
                  style={{
                    width: '100%',
                    borderRadius: 4,
                    backgroundColor: m.count > 0 ? COLORS.clay : COLORS.sand,
                    height: Math.max((m.count / maxMonth) * 56, m.count > 0 ? 6 : 2),
                  }}
                />
                <Text style={{ color: COLORS.bark, fontSize: 8 }}>{m.label}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Top species */}
        {topSpecies.length > 0 && (
          <Animated.View entering={FadeInDown.delay(180).duration(280)}>
            <Text style={{ color: COLORS.bark, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 }}>
              Most logged
            </Text>
            {topSpecies.map((sp, i) => (
              <TouchableOpacity
                key={sp.id}
                onPress={() => router.push(`/species/${sp.id}` as never)}
                accessibilityLabel={`View ${sp.name}`}
                accessibilityRole="button"
                style={[
                  {
                    flexDirection: 'row', alignItems: 'center',
                    backgroundColor: COLORS.surface, borderRadius: 14,
                    padding: 12, marginBottom: 8,
                    borderWidth: 1, borderColor: COLORS.sand, gap: 12,
                  },
                  softShadow(0.03, 4, 1),
                ]}
              >
                <View style={{
                  width: 28, height: 28, borderRadius: 8,
                  backgroundColor: COLORS.cream, alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text style={{ color: COLORS.clay, fontWeight: '800', fontSize: 13 }}>{i + 1}</Text>
                </View>
                <View style={{
                  width: 40, height: 40, borderRadius: 10,
                  backgroundColor: KIND_COLOR[sp.kind], alignItems: 'center', justifyContent: 'center',
                }}>
                  <SpeciesIcon kind={sp.kind as SpeciesKind} size={26} color={COLORS.cream} />
                </View>
                <Text style={{ flex: 1, color: COLORS.ink, fontWeight: '700', fontSize: 14 }}>{sp.name}</Text>
                <Text style={{ color: COLORS.clay, fontWeight: '700', fontSize: 14 }}>{sp.count}×</Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}

        {total === 0 && (
          <View style={{ paddingTop: 60, alignItems: 'center', gap: 10 }}>
            <Ionicons name="stats-chart-outline" size={48} color={COLORS.sand} />
            <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 17 }}>No sightings yet</Text>
            <Text style={{ color: COLORS.bark, fontSize: 14, textAlign: 'center', paddingHorizontal: 40, lineHeight: 20 }}>
              Head out and log your first sighting to see stats here.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
