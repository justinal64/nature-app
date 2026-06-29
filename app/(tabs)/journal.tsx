import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Image } from 'expo-image';
import {
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
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
import { useDisplayPrefs } from '@/context/DisplayPrefsContext';
import { useSightings } from '@/hooks/useSightings';
import { exportSightingsCsv } from '@/lib/export';
import type { Sighting, SpeciesKind } from '@/lib/sightings';
import { deleteSighting, getQualityGrade, updateSighting } from '@/lib/sightings';
import { formatRelativeDate } from '@/utils/date';

const KIND_FILTERS: { label: string; value: SpeciesKind | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Plants', value: 'cactus' },
  { label: 'Birds', value: 'bird' },
  { label: 'Insects', value: 'insect' },
  { label: 'Snakes', value: 'snake' },
];

export default function JournalScreen() {
  const { top } = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { sightings, loading, refresh } = useSightings(user?.uid);
  const { preferScientific } = useDisplayPrefs();
  const [sharingSighting, setSharingSighting] = useState<Sighting | null>(null);
  const [editingSighting, setEditingSighting] = useState<Sighting | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [kindFilter, setKindFilter] = useState<SpeciesKind | 'all'>('all');
  const viewShotRef = useRef<ViewShot>(null);

  const filtered = kindFilter === 'all' ? sightings : sightings.filter((s) => s.kind === kindFilter);
  const speciesCount = new Set(sightings.map((s) => s.speciesId)).size;
  const photoCount = sightings.filter((s) => (s.photoUris?.length ?? 0) > 0 || !!s.photoUri).length;

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

  function handleLongPress(entry: Sighting) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(entry.commonName, undefined, [
      {
        text: 'Edit notes',
        onPress: () => {
          setEditNotes(entry.notes ?? '');
          setEditingSighting(entry);
        },
      },
      {
        text: 'Delete entry',
        style: 'destructive',
        onPress: () =>
          Alert.alert('Delete this entry?', 'This cannot be undone.', [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: async () => {
                if (!user) return;
                await deleteSighting(user.uid, entry.id);
                await refresh();
              },
            },
          ]),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  async function saveEdit() {
    if (!editingSighting || !user) return;
    await updateSighting(user.uid, editingSighting.id, { notes: editNotes.trim() || undefined });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await refresh();
    setEditingSighting(null);
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <LandscapeHeader height={200} />

      <ScrollView
        contentContainerStyle={{ paddingTop: top + 16, paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor={COLORS.clay}
            colors={[COLORS.clay]}
          />
        }
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
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 4 }}>
              <TouchableOpacity
                onPress={() => router.push('/batch-import' as never)}
                accessibilityLabel="Import photos from camera roll"
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
                <Ionicons name="images-outline" size={20} color={COLORS.clay} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push('/journal-stats' as never)}
                accessibilityLabel="View field stats"
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
                <Ionicons name="stats-chart-outline" size={20} color={COLORS.clay} />
              </TouchableOpacity>
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
                }}
              >
                <Ionicons name="map-outline" size={20} color={COLORS.clay} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  if (sightings.length === 0) {
                    Alert.alert('Nothing to export', 'Log some sightings first.');
                    return;
                  }
                  try {
                    await exportSightingsCsv(sightings);
                  } catch {
                    Alert.alert('Export failed', 'Could not export your sightings. Please try again.');
                  }
                }}
                accessibilityLabel="Export sightings as CSV"
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
                <Ionicons name="download-outline" size={20} color={COLORS.clay} />
              </TouchableOpacity>
            </View>
          </View>
        </Reveal>

        {/* Kind filter pills */}
        {!loading && sightings.length > 0 && (
          <Reveal delay={60}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: 16 }}
            >
              {KIND_FILTERS.map((f) => {
                const active = kindFilter === f.value;
                return (
                  <Pressable
                    key={f.value}
                    onPress={() => setKindFilter(f.value)}
                    accessibilityLabel={`Filter by ${f.label}`}
                    accessibilityRole="button"
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 20,
                      backgroundColor: active ? COLORS.clay : COLORS.surface,
                      borderWidth: 1,
                      borderColor: active ? COLORS.clay : COLORS.sand,
                    }}
                  >
                    <Text
                      style={{
                        color: active ? COLORS.cream : COLORS.ink,
                        fontWeight: '600',
                        fontSize: 13,
                      }}
                    >
                      {f.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Reveal>
        )}

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
          ) : filtered.length === 0 ? (
            <Reveal delay={60}>
              <View style={{ paddingTop: 48, alignItems: 'center', gap: 8 }}>
                <Text style={{ color: COLORS.ink, fontSize: 16, fontWeight: '700' }}>
                  No {KIND_FILTERS.find((f) => f.value === kindFilter)?.label.toLowerCase()} logged yet
                </Text>
                <Text style={{ color: COLORS.bark, fontSize: 13 }}>Try a different filter.</Text>
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
              {filtered.map((entry, i) => (
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
                    onPress={() => router.push(`/sighting/${entry.id}` as never)}
                    onLongPress={() => handleLongPress(entry)}
                    accessibilityLabel={`${entry.commonName} — ${formatRelativeDate(entry.capturedAt)}. Long press to edit or delete.`}
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
                    {(() => {
                      const thumbUri = entry.photoUris?.[0] ?? entry.photoUri;
                      const extraCount = (entry.photoUris?.length ?? 0) - 1;
                      return thumbUri ? (
                        <View style={{ position: 'relative' }}>
                          <Image
                            source={{ uri: thumbUri }}
                            style={{ width: 56, height: 56, borderRadius: 14 }}
                            contentFit="cover"
                          />
                          {extraCount > 0 && (
                            <View style={{ position: 'absolute', bottom: 2, right: 2, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 6, paddingHorizontal: 4, paddingVertical: 1 }}>
                              <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700' }}>+{extraCount}</Text>
                            </View>
                          )}
                        </View>
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
                      );
                    })()}
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 16, fontStyle: preferScientific ? 'italic' : 'normal' }}>
                        {preferScientific ? entry.latinName : entry.commonName}
                      </Text>
                      <Text
                        style={{
                          color: COLORS.bark,
                          fontStyle: preferScientific ? 'normal' : 'italic',
                          fontSize: 13,
                          marginTop: 1,
                        }}
                      >
                        {preferScientific ? entry.commonName : entry.latinName}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6 }}>
                        <Text style={{ color: COLORS.bark, fontSize: 12 }}>
                          {formatRelativeDate(entry.capturedAt)}
                        </Text>
                        {(() => {
                          const grade = getQualityGrade(entry);
                          const gradeConfig = {
                            research:  { label: 'Research Grade', color: COLORS.sage },
                            needs_id:  { label: 'Needs ID',       color: COLORS.gold },
                            casual:    { label: 'Casual',          color: COLORS.bark },
                          }[grade];
                          return (
                            <View style={{ backgroundColor: gradeConfig.color + '30', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1, borderWidth: 1, borderColor: gradeConfig.color + '60' }}>
                              <Text style={{ color: gradeConfig.color, fontSize: 10, fontWeight: '700' }}>
                                {gradeConfig.label}
                              </Text>
                            </View>
                          );
                        })()}
                      </View>
                      {entry.locationObscured && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 }}>
                          <Ionicons name="eye-off-outline" size={11} color={COLORS.bark} />
                          <Text style={{ color: COLORS.bark, fontSize: 10, fontStyle: 'italic' }}>Location obscured</Text>
                        </View>
                      )}
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

      {/* Edit notes modal */}
      <Modal
        visible={!!editingSighting}
        transparent
        animationType="slide"
        onRequestClose={() => setEditingSighting(null)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}
          onPress={() => setEditingSighting(null)}
        >
          <Pressable
            onPress={() => {}}
            style={[
              {
                backgroundColor: COLORS.background,
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
                padding: 24,
                paddingBottom: 36,
              },
              softShadow(0.18, 20, 8),
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ flex: 1, color: COLORS.ink, fontWeight: '700', fontSize: 18 }}>
                Edit notes
              </Text>
              <TouchableOpacity
                onPress={() => setEditingSighting(null)}
                accessibilityLabel="Cancel"
                accessibilityRole="button"
              >
                <Ionicons name="close" size={22} color={COLORS.bark} />
              </TouchableOpacity>
            </View>
            {editingSighting && (
              <Text style={{ color: COLORS.bark, fontSize: 13, fontStyle: 'italic', marginBottom: 12 }}>
                {editingSighting.commonName} · {formatRelativeDate(editingSighting.capturedAt)}
              </Text>
            )}
            <View
              style={{
                borderWidth: 1,
                borderColor: COLORS.sand,
                borderRadius: 14,
                padding: 14,
                minHeight: 100,
                backgroundColor: COLORS.surface,
                marginBottom: 20,
              }}
            >
              <TextInput
                value={editNotes}
                onChangeText={setEditNotes}
                placeholder="Add field notes…"
                placeholderTextColor={COLORS.bark}
                multiline
                style={{ color: COLORS.ink, fontSize: 15, lineHeight: 22 }}
                autoFocus
                maxLength={500}
                accessibilityLabel="Field notes"
              />
            </View>
            <Pressable
              onPress={saveEdit}
              accessibilityLabel="Save notes"
              accessibilityRole="button"
              style={[
                {
                  backgroundColor: COLORS.clay,
                  borderRadius: 24,
                  paddingVertical: 16,
                  alignItems: 'center',
                },
                glow(COLORS.clay, 8),
              ]}
            >
              <Text style={{ color: COLORS.cream, fontWeight: '700', fontSize: 16 }}>Save</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
