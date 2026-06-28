import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LandscapeHeader } from '@/components/LandscapeHeader';
import { PressableScale } from '@/components/PressableScale';
import { Reveal } from '@/components/Reveal';
import { SpeciesIcon } from '@/components/SpeciesIcon';
import { COLORS, glow, softShadow } from '@/constants/AppTheme';
import { useAuth } from '@/context/AuthContext';
import { useSightings } from '@/hooks/useSightings';
import { formatRelativeDate } from '@/utils/date';

export default function JournalScreen() {
  const { top } = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { sightings, loading } = useSightings(user?.uid);

  const speciesCount = new Set(sightings.map((s) => s.speciesId)).size;
  const photoCount = sightings.filter((s) => s.photoUri).length;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <LandscapeHeader height={200} />

      <ScrollView
        contentContainerStyle={{ paddingTop: top + 16, paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      >
        <Reveal>
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
              {loading ? '—' : `${speciesCount} species · ${photoCount} photos`}
            </Text>
            <Text style={{ color: COLORS.ink, fontSize: 30, fontWeight: '700' }}>Journal</Text>
          </View>
        </Reveal>

        <View style={{ paddingHorizontal: 20 }}>
          {loading ? (
            <View style={{ paddingTop: 40, alignItems: 'center' }}>
              <Text style={{ color: COLORS.bark, fontSize: 14 }}>Loading…</Text>
            </View>
          ) : sightings.length === 0 ? (
            <Reveal delay={100}>
              <View style={{ paddingTop: 60, alignItems: 'center', gap: 10 }}>
                <Text style={{ color: COLORS.ink, fontSize: 17, fontWeight: '700' }}>
                  No entries yet
                </Text>
                <Text
                  style={{
                    color: COLORS.bark,
                    fontSize: 14,
                    textAlign: 'center',
                    lineHeight: 20,
                  }}
                >
                  Your first find is waiting in the wild. Use the camera to log it.
                </Text>
              </View>
            </Reveal>
          ) : (
            <View>
              <View
                style={{
                  position: 'absolute',
                  left: 7,
                  top: 14,
                  bottom: 14,
                  width: 2,
                  borderRadius: 1,
                  backgroundColor: COLORS.sand,
                }}
              />
              {sightings.map((entry, i) => (
                <Animated.View
                  key={entry.id}
                  entering={FadeInDown.delay(120 + i * 80).springify().damping(15).stiffness(150)}
                  style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}
                >
                  <View
                    style={[
                      {
                        width: 16,
                        height: 16,
                        borderRadius: 8,
                        backgroundColor: i === 0 ? COLORS.clay : COLORS.sage,
                        borderWidth: 3,
                        borderColor: COLORS.cream,
                        marginRight: 12,
                      },
                      i === 0 ? glow(COLORS.clay, 6) : {},
                    ]}
                  />
                  <PressableScale
                    scaleTo={0.98}
                    onPress={() => router.push(`/species/${entry.speciesId}` as never)}
                    style={[
                      {
                        flex: 1,
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
                    {entry.photoUri ? (
                      <Image
                        source={{ uri: entry.photoUri }}
                        style={{ width: 56, height: 56, borderRadius: 14 }}
                        contentFit="cover"
                      />
                    ) : (
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
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 16 }}>
                        {entry.commonName}
                      </Text>
                      <Text
                        style={{
                          color: COLORS.bark,
                          fontStyle: 'italic',
                          fontSize: 13,
                          marginTop: 1,
                        }}
                      >
                        {entry.latinName}
                      </Text>
                      <Text style={{ color: COLORS.bark, fontSize: 12, marginTop: 4 }}>
                        {formatRelativeDate(entry.capturedAt)}
                      </Text>
                      {entry.notes ? (
                        <Text
                          numberOfLines={1}
                          style={{ color: COLORS.bark, fontSize: 12, marginTop: 3, fontStyle: 'italic' }}
                        >
                          {entry.notes}
                        </Text>
                      ) : null}
                    </View>
                    <Text style={{ color: COLORS.bark, fontSize: 20 }}>›</Text>
                  </PressableScale>
                </Animated.View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
