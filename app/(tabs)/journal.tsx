import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Image } from 'expo-image';
import { Alert, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import ViewShot from 'react-native-view-shot';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LandscapeHeader } from '@/components/LandscapeHeader';
import { PressableScale } from '@/components/PressableScale';
import { Reveal } from '@/components/Reveal';
import { SightingShareCard } from '@/components/SightingShareCard';
import { SpeciesIcon } from '@/components/SpeciesIcon';
import { COLORS, glow, softShadow } from '@/constants/AppTheme';
import { useAuth } from '@/context/AuthContext';
import { useSightings } from '@/hooks/useSightings';
import type { Sighting } from '@/lib/sightings';
import { formatRelativeDate } from '@/utils/date';

export default function JournalScreen() {
  const { top } = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { sightings, loading } = useSightings(user?.uid);
  const [sharingSighting, setSharingSighting] = useState<Sighting | null>(null);
  const viewShotRef = useRef<ViewShot>(null);

  const speciesCount = new Set(sightings.map((s) => s.speciesId)).size;
  const photoCount = sightings.filter((s) => s.photoUri).length;

  async function handleShare() {
    if (!viewShotRef.current) return;
    try {
      const uri = await viewShotRef.current.capture!();
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert('Sharing not available', 'Your device does not support sharing.');
        return;
      }
      await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Share sighting' });
    } catch {
      Alert.alert('Error', 'Could not capture the share card. Please try again.');
    } finally {
      setSharingSighting(null);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <LandscapeHeader height={200} />

      <ScrollView
        contentContainerStyle={{ paddingTop: top + 16, paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      >
        <Reveal>
          <View
            style={{
              paddingHorizontal: 24,
              paddingTop: 12,
              paddingBottom: 18,
              flexDirection: 'row',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
            }}
          >
            <View>
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
            <TouchableOpacity
              onPress={() => router.push('/sightings-map' as never)}
              accessibilityLabel="View sightings on map"
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
                marginBottom: 4,
              }}
            >
              <Ionicons name="map-outline" size={20} color={COLORS.clay} />
            </TouchableOpacity>
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
                    accessibilityLabel={`${entry.commonName} — ${formatRelativeDate(entry.capturedAt)}`}
                    accessibilityRole="button"
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
                          style={{
                            color: COLORS.bark,
                            fontSize: 12,
                            marginTop: 3,
                            fontStyle: 'italic',
                          }}
                        >
                          {entry.notes}
                        </Text>
                      ) : null}
                    </View>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        setSharingSighting(entry);
                      }}
                      accessibilityLabel={`Share ${entry.commonName} sighting`}
                      accessibilityRole="button"
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={{ padding: 4 }}
                    >
                      <Ionicons name="share-outline" size={20} color={COLORS.bark} />
                    </TouchableOpacity>
                  </PressableScale>
                </Animated.View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Share modal */}
      <Modal
        visible={!!sharingSighting}
        transparent
        animationType="fade"
        onRequestClose={() => setSharingSighting(null)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.55)',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          {sharingSighting && (
            <>
              <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1 }}>
                <SightingShareCard sighting={sharingSighting} />
              </ViewShot>

              <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
                <TouchableOpacity
                  onPress={() => setSharingSighting(null)}
                  style={{
                    flex: 1,
                    paddingVertical: 14,
                    borderRadius: 14,
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: '600', fontSize: 15 }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleShare}
                  style={{
                    flex: 1,
                    paddingVertical: 14,
                    borderRadius: 14,
                    backgroundColor: COLORS.clay,
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  <Ionicons name="share-outline" size={18} color="#fff" />
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Share</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </Modal>
    </View>
  );
}
