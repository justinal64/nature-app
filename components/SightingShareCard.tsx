import { Image } from 'expo-image';
import { Text, View } from 'react-native';

import { SpeciesIcon } from '@/components/SpeciesIcon';
import { COLORS } from '@/constants/AppTheme';
import type { Sighting } from '@/lib/sightings';
import { formatRelativeDate } from '@/utils/date';

type Props = { sighting: Sighting };

export function SightingShareCard({ sighting }: Props) {
  return (
    <View
      style={{
        width: 320,
        backgroundColor: COLORS.cream,
        borderRadius: 20,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <View
        style={{
          backgroundColor: COLORS.clay,
          paddingVertical: 12,
          paddingHorizontal: 20,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: 11,
            backgroundColor: COLORS.cream,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <SpeciesIcon kind={sighting.kind} size={14} color={COLORS.clay} />
        </View>
        <Text style={{ color: COLORS.cream, fontWeight: '700', fontSize: 15, letterSpacing: 0.3 }}>
          WildLens
        </Text>
      </View>

      {/* Photo or icon */}
      {sighting.photoUri ? (
        <Image
          source={{ uri: sighting.photoUri }}
          style={{ width: 320, height: 240 }}
          contentFit="cover"
        />
      ) : (
        <View
          style={{
            width: 320,
            height: 240,
            backgroundColor: COLORS.sage,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <SpeciesIcon kind={sighting.kind} size={100} color={COLORS.cream} />
        </View>
      )}

      {/* Species info */}
      <View style={{ padding: 20, gap: 2 }}>
        <Text style={{ color: COLORS.ink, fontWeight: '800', fontSize: 22, lineHeight: 28 }}>
          {sighting.commonName}
        </Text>
        <Text style={{ color: COLORS.bark, fontStyle: 'italic', fontSize: 14, marginBottom: 6 }}>
          {sighting.latinName}
        </Text>
        {sighting.notes ? (
          <Text
            numberOfLines={2}
            style={{ color: COLORS.bark, fontSize: 13, fontStyle: 'italic', marginBottom: 4 }}
          >
            &ldquo;{sighting.notes}&rdquo;
          </Text>
        ) : null}
        <Text style={{ color: COLORS.bark, fontSize: 12, marginTop: 4 }}>
          {formatRelativeDate(sighting.capturedAt)}
        </Text>
      </View>

      {/* Footer */}
      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: COLORS.sand,
          paddingVertical: 10,
          paddingHorizontal: 20,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text style={{ color: COLORS.bark, fontSize: 11, fontStyle: 'italic' }}>
          Spotted in the wild
        </Text>
        <Text style={{ color: COLORS.bark, fontSize: 11 }}>wildlens.app</Text>
      </View>
    </View>
  );
}
