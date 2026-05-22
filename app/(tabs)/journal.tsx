import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LandscapeHeader } from '@/components/LandscapeHeader';
import { SpeciesIcon, SpeciesKind } from '@/components/SpeciesIcon';
import { COLORS, softShadow } from '@/constants/AppTheme';

const ENTRIES: { name: string; latin: string; meta: string; kind: SpeciesKind }[] = [
  { name: 'Saguaro', latin: 'Carnegiea gigantea', meta: 'Today · 2:14 pm', kind: 'cactus' },
  { name: 'Tarantula Hawk', latin: 'Pepsis spp.', meta: 'May 19', kind: 'insect' },
  { name: 'Mourning Dove', latin: 'Zenaida macroura', meta: 'May 18', kind: 'bird' },
  { name: 'Sidewinder', latin: 'Crotalus cerastes', meta: 'May 16', kind: 'snake' },
  { name: 'Palo Verde', latin: 'Parkinsonia florida', meta: 'May 14', kind: 'cactus' },
];

export default function JournalScreen() {
  const { top } = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <LandscapeHeader height={200} />

      <ScrollView
        contentContainerStyle={{ paddingTop: top + 16, paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 18 }}>
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
            47 species · 128 photos
          </Text>
          <Text style={{ color: COLORS.ink, fontSize: 30, fontWeight: '700' }}>Journal</Text>
        </View>

        <View style={{ paddingHorizontal: 20, gap: 10 }}>
          {ENTRIES.map((entry) => (
            <Pressable
              key={entry.name + entry.meta}
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
                  backgroundColor: COLORS.sage,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <SpeciesIcon kind={entry.kind} size={34} color={COLORS.cream} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 16 }}>
                  {entry.name}
                </Text>
                <Text
                  style={{
                    color: COLORS.bark,
                    fontStyle: 'italic',
                    fontSize: 13,
                    marginTop: 1,
                  }}
                >
                  {entry.latin}
                </Text>
                <Text style={{ color: COLORS.bark, fontSize: 12, marginTop: 4 }}>
                  {entry.meta}
                </Text>
              </View>
              <Text style={{ color: COLORS.bark, fontSize: 20 }}>›</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
