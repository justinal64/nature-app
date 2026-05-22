import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LandscapeHeader } from '@/components/LandscapeHeader';
import { SpeciesIcon, SpeciesKind } from '@/components/SpeciesIcon';
import { COLORS, glow, softShadow } from '@/constants/AppTheme';

const STATS = [
  { value: '47', label: 'Species' },
  { value: '128', label: 'Photos' },
  { value: '14d', label: 'Streak' },
  { value: '6', label: 'Badges' },
];

const BADGES: { name: string; kind: SpeciesKind }[] = [
  { name: 'First Find', kind: 'cactus' },
  { name: '10-day Streak', kind: 'bird' },
  { name: 'Cactus Crew', kind: 'cactus' },
  { name: 'Birder', kind: 'bird' },
];

const ENTRIES: { name: string; meta: string; kind: SpeciesKind }[] = [
  { name: 'Saguaro', meta: 'Today · 2:14 pm', kind: 'cactus' },
  { name: 'Tarantula Hawk', meta: 'May 19', kind: 'insect' },
  { name: 'Mourning Dove', meta: 'May 18', kind: 'bird' },
];

export default function ProfileScreen() {
  const { top } = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <LandscapeHeader height={220} />

      <ScrollView
        contentContainerStyle={{ paddingTop: top + 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            paddingHorizontal: 24,
            paddingTop: 14,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <View
            style={[
              {
                width: 76,
                height: 76,
                borderRadius: 38,
                backgroundColor: COLORS.dusk,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 3,
                borderColor: COLORS.cream,
              },
              glow(COLORS.dusk, 10),
            ]}
          >
            <Text style={{ color: COLORS.cream, fontSize: 32, fontWeight: '700' }}>I</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: COLORS.ink, fontSize: 22, fontWeight: '700' }}>
              Iris Calloway
            </Text>
            <Text style={{ color: COLORS.bark, fontSize: 13, marginTop: 2 }}>
              Tucson, Arizona · Joined Mar 2026
            </Text>
          </View>
          <Pressable
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: COLORS.cream,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: COLORS.sand,
            }}
          >
            <Ionicons name="settings-outline" size={16} color={COLORS.ink} />
          </Pressable>
        </View>

        <View
          style={[
            {
              marginHorizontal: 20,
              marginTop: 22,
              backgroundColor: COLORS.surface,
              borderRadius: 18,
              padding: 16,
              flexDirection: 'row',
              borderWidth: 1,
              borderColor: COLORS.sand,
            },
            softShadow(0.05, 8, 2),
          ]}
        >
          {STATS.map((stat, i) => (
            <View
              key={stat.label}
              style={{
                flex: 1,
                alignItems: 'center',
                borderLeftWidth: i === 0 ? 0 : 1,
                borderLeftColor: COLORS.sand,
              }}
            >
              <Text style={{ color: COLORS.ink, fontSize: 20, fontWeight: '700' }}>
                {stat.value}
              </Text>
              <Text
                style={{
                  color: COLORS.bark,
                  fontSize: 11,
                  fontWeight: '600',
                  letterSpacing: 0.4,
                  marginTop: 2,
                }}
              >
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 24,
            marginTop: 28,
            marginBottom: 12,
          }}
        >
          <Text style={{ color: COLORS.ink, fontSize: 17, fontWeight: '700' }}>Recent badges</Text>
          <Pressable>
            <Text style={{ color: COLORS.clay, fontSize: 13, fontWeight: '600' }}>All ›</Text>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
        >
          {BADGES.map((badge) => (
            <View
              key={badge.name}
              style={{
                width: 100,
                alignItems: 'center',
              }}
            >
              <View
                style={[
                  {
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: COLORS.sage,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 3,
                    borderColor: COLORS.gold,
                  },
                  glow(COLORS.gold, 8),
                ]}
              >
                <SpeciesIcon kind={badge.kind} size={42} color={COLORS.cream} />
              </View>
              <Text
                style={{
                  color: COLORS.ink,
                  fontSize: 12,
                  fontWeight: '600',
                  marginTop: 8,
                  textAlign: 'center',
                }}
              >
                {badge.name}
              </Text>
            </View>
          ))}
        </ScrollView>

        <View style={{ paddingHorizontal: 24, marginTop: 28, marginBottom: 12 }}>
          <Text style={{ color: COLORS.ink, fontSize: 17, fontWeight: '700' }}>Recent entries</Text>
        </View>

        <View
          style={[
            {
              marginHorizontal: 20,
              backgroundColor: COLORS.surface,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: COLORS.sand,
              overflow: 'hidden',
            },
            softShadow(0.04, 6, 2),
          ]}
        >
          {ENTRIES.map((entry, i) => (
            <Pressable
              key={entry.name}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 14,
                gap: 12,
                borderTopWidth: i === 0 ? 0 : 1,
                borderTopColor: COLORS.sand,
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: COLORS.sage,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <SpeciesIcon kind={entry.kind} size={28} color={COLORS.cream} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 15 }}>
                  {entry.name}
                </Text>
                <Text style={{ color: COLORS.bark, fontSize: 12, marginTop: 1 }}>
                  {entry.meta}
                </Text>
              </View>
              <Text style={{ color: COLORS.bark, fontSize: 18 }}>›</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
