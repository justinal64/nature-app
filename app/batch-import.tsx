import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SpeciesIcon, type SpeciesKind } from '@/components/SpeciesIcon';
import { COLORS, softShadow } from '@/constants/AppTheme';
import { CATALOG, type Species } from '@/constants/catalog';
import { useAuth } from '@/context/AuthContext';
import { identifySpecies } from '@/lib/identify';
import { addSighting } from '@/lib/sightings';

// Matches the low-confidence cutoff app/result.tsx uses for its single-photo
// flow, so a photo that would be blocked from auto-save there also lands in
// "needs review" here rather than being silently auto-accepted.
const CONFIDENCE_THRESHOLD = 50;
const REVIEW_COLOR = '#8B6A00';

type ImportItem = {
  uri: string;
  capturedAt: Date;
  location?: { lat: number; lng: number };
  species?: Species;
  confidence?: number;
  // True once the app's own guess is good enough to auto-accept, or the
  // user has explicitly confirmed/changed it. Only confirmed items save.
  confirmed: boolean;
};

function parseExifGps(exif: Record<string, unknown>): { lat: number; lng: number } | undefined {
  const lat = exif.GPSLatitude as number | undefined;
  const lng = exif.GPSLongitude as number | undefined;
  const latRef = exif.GPSLatitudeRef as string | undefined;
  const lngRef = exif.GPSLongitudeRef as string | undefined;
  if (lat == null || lng == null) return undefined;
  return {
    lat: latRef === 'S' ? -lat : lat,
    lng: lngRef === 'W' ? -lng : lng,
  };
}

export default function BatchImportScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();

  const [items, setItems] = useState<ImportItem[]>([]);
  const [identifying, setIdentifying] = useState(false);
  const [identifiedCount, setIdentifiedCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [pickerActiveIdx, setPickerActiveIdx] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [launched, setLaunched] = useState(false);

  useEffect(() => {
    if (!launched) {
      setLaunched(true);
      launchPicker();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function launchPicker() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission needed',
        'Allow access to your photo library to import sightings.',
        [{ text: 'OK', onPress: () => router.back() }],
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      exif: true,
      quality: 0.85,
      orderedSelection: true,
    });
    if (result.canceled || result.assets.length === 0) {
      router.back();
      return;
    }
    const initial: ImportItem[] = result.assets.map((a) => {
      const exif = a.exif as Record<string, unknown> | undefined;
      // Parse EXIF date if present (format: "YYYY:MM:DD HH:MM:SS")
      let capturedAt = new Date();
      const exifDate = exif?.DateTimeOriginal;
      if (typeof exifDate === 'string') {
        const parsed = new Date(exifDate.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3'));
        if (!isNaN(parsed.getTime())) capturedAt = parsed;
      }
      const location = exif ? parseExifGps(exif) : undefined;
      return { uri: a.uri, capturedAt, location, confirmed: false };
    });
    setItems(initial);
    identifyAll(initial);
  }

  // Runs the same on-device/cloud identify pipeline result.tsx uses, one
  // photo at a time (the model instance is cached after the first load, so
  // this is cheap after the first call) — updating each row as its guess
  // comes in rather than blocking on the whole batch.
  async function identifyAll(initial: ImportItem[]) {
    setIdentifying(true);
    setIdentifiedCount(0);
    for (let i = 0; i < initial.length; i++) {
      const item = initial[i];
      try {
        const results = await identifySpecies(item.uri, { coords: item.location });
        const top = results[0];
        const sp = top?.speciesId ? CATALOG.find((s) => s.id === top.speciesId) : undefined;
        const goodMatch = !!sp && !top.isOffline && top.confidence >= CONFIDENCE_THRESHOLD;
        setItems((prev) =>
          prev.map((it, idx) =>
            idx === i
              ? { ...it, species: sp, confidence: sp ? top.confidence : undefined, confirmed: goodMatch }
              : it,
          ),
        );
      } catch {
        // Leave unassigned — the user can still assign it manually below.
      }
      setIdentifiedCount((c) => c + 1);
    }
    setIdentifying(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  const q = searchQuery.trim().toLowerCase();
  const searchResults = q
    ? CATALOG.filter(
        (sp) =>
          sp.commonName.toLowerCase().includes(q) ||
          sp.latin.toLowerCase().includes(q),
      ).slice(0, 10)
    : CATALOG.slice(0, 10);

  function assignSpecies(idx: number, sp: Species) {
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, species: sp, confidence: undefined, confirmed: true } : item)),
    );
    setPickerActiveIdx(null);
    setSearchQuery('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function confirmGuess(idx: number) {
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, confirmed: true } : item)));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
    if (pickerActiveIdx !== null && idx <= pickerActiveIdx) {
      setPickerActiveIdx(null);
    }
  }

  async function doSave(assigned: ImportItem[]) {
    if (!user) return;
    setSaving(true);
    try {
      for (const item of assigned) {
        await addSighting({
          userId: user.uid,
          speciesId: item.species!.id,
          commonName: item.species!.commonName,
          latinName: item.species!.latin,
          kind: item.species!.kind,
          photoUris: [item.uri],
          capturedAt: item.capturedAt.toISOString(),
          location: item.location,
        });
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch {
      Alert.alert('Error', 'Could not save all sightings. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function saveAll() {
    if (!user) return;
    const ready = items.filter((item) => item.species && item.confirmed);
    if (ready.length === 0) {
      Alert.alert('Nothing to save', 'Confirm or assign a species for at least one photo first.');
      return;
    }
    const notReady = items.length - ready.length;
    if (notReady > 0) {
      Alert.alert(
        'Some photos need review',
        `${notReady} photo${notReady > 1 ? 's' : ''} still ${notReady > 1 ? 'need' : 'needs'} a confirmed species and will be skipped. Save the other ${ready.length}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: `Save ${ready.length}`, onPress: () => doSave(ready) },
        ],
      );
    } else {
      doSave(ready);
    }
  }

  const readyCount = items.filter((i) => i.species && i.confirmed).length;

  if (items.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: COLORS.granite, fontSize: 14 }}>Opening photo library…</Text>
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
          borderBottomColor: COLORS.granite,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityLabel="Cancel import"
          accessibilityRole="button"
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: COLORS.surface,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: COLORS.granite,
          }}
        >
          <Ionicons name="close" size={20} color={COLORS.ink} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 18 }}>Import photos</Text>
          <Text style={{ color: COLORS.granite, fontSize: 12, marginTop: 1 }}>
            {identifying
              ? `Identifying ${identifiedCount} of ${items.length}…`
              : `${readyCount} of ${items.length} ready to save`}
          </Text>
        </View>
        <Pressable
          onPress={saveAll}
          disabled={saving || identifying || readyCount === 0}
          accessibilityLabel="Save all confirmed sightings"
          accessibilityRole="button"
          style={{
            backgroundColor: readyCount > 0 && !identifying ? COLORS.lichen : COLORS.granite,
            borderRadius: 20,
            paddingHorizontal: 16,
            paddingVertical: 9,
            opacity: saving ? 0.6 : 1,
          }}
        >
          <Text style={{ color: COLORS.bone, fontWeight: '700', fontSize: 14 }}>
            {saving ? 'Saving…' : readyCount > 0 ? `Save ${readyCount}` : 'Save'}
          </Text>
        </Pressable>
      </View>

      {/* Identification progress bar */}
      {identifying && (
        <View style={{ height: 3, backgroundColor: COLORS.surface }}>
          <View
            style={{
              height: 3,
              width: `${Math.round((identifiedCount / items.length) * 100)}%`,
              backgroundColor: COLORS.lichen,
            }}
          />
        </View>
      )}

      {/* Photo list */}
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {items.map((item, idx) => {
          const needsReview = !!item.species && !item.confirmed;
          const borderColor = item.confirmed ? COLORS.lichen : needsReview ? REVIEW_COLOR : COLORS.granite;
          return (
            <View
              key={`${item.uri}-${idx}`}
              style={[
                {
                  backgroundColor: COLORS.surface,
                  borderRadius: 16,
                  padding: 12,
                  borderWidth: 1,
                  borderColor,
                  gap: 10,
                },
                softShadow(0.04, 5, 1),
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Image
                  source={{ uri: item.uri }}
                  style={{ width: 60, height: 60, borderRadius: 12 }}
                  contentFit="cover"
                />
                <Pressable
                  onPress={() => { setPickerActiveIdx(idx); setSearchQuery(''); }}
                  accessibilityLabel={item.species ? `Change species: ${item.species.commonName}` : 'Assign species'}
                  accessibilityRole="button"
                  style={{ flex: 1 }}
                >
                  {item.species ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          backgroundColor: item.confirmed ? COLORS.lichen : REVIEW_COLOR,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <SpeciesIcon kind={item.species.kind as SpeciesKind} size={20} color={COLORS.bone} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 14 }}>
                          {item.species.commonName}
                        </Text>
                        <Text style={{ color: COLORS.granite, fontSize: 11, fontStyle: 'italic' }}>
                          {item.species.latin}
                          {item.confidence != null ? `  ·  ${item.confidence}% match` : ''}
                        </Text>
                      </View>
                    </View>
                  ) : identifying ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Ionicons name="hourglass-outline" size={15} color={COLORS.granite} />
                      <Text style={{ color: COLORS.granite, fontSize: 14 }}>Identifying…</Text>
                    </View>
                  ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Ionicons name="search-outline" size={15} color={COLORS.granite} />
                      <Text style={{ color: COLORS.granite, fontSize: 14 }}>Assign species…</Text>
                    </View>
                  )}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                    <Text style={{ color: COLORS.granite, fontSize: 11 }}>
                      {item.capturedAt.toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Text>
                    {item.location && (
                      <Ionicons name="location" size={11} color={COLORS.lichen} />
                    )}
                  </View>
                </Pressable>
                <TouchableOpacity
                  onPress={() => removeItem(idx)}
                  hitSlop={8}
                  accessibilityLabel="Remove from import"
                  accessibilityRole="button"
                >
                  <Ionicons name="close-circle" size={20} color={COLORS.granite} />
                </TouchableOpacity>
              </View>
              {needsReview && (
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Pressable
                    onPress={() => confirmGuess(idx)}
                    accessibilityLabel={`Confirm ${item.species?.commonName}`}
                    accessibilityRole="button"
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      paddingVertical: 8,
                      borderRadius: 10,
                      backgroundColor: COLORS.bone,
                    }}
                  >
                    <Ionicons name="checkmark" size={15} color={REVIEW_COLOR} />
                    <Text style={{ color: REVIEW_COLOR, fontWeight: '600', fontSize: 13 }}>
                      Looks right
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => { setPickerActiveIdx(idx); setSearchQuery(''); }}
                    accessibilityLabel="Change species"
                    accessibilityRole="button"
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      paddingVertical: 8,
                      borderRadius: 10,
                      backgroundColor: COLORS.bone,
                    }}
                  >
                    <Ionicons name="create-outline" size={15} color={COLORS.granite} />
                    <Text style={{ color: COLORS.granite, fontWeight: '600', fontSize: 13 }}>Change</Text>
                  </Pressable>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Species picker bottom sheet */}
      {pickerActiveIdx !== null && (
        <Pressable
          style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)' }}
          onPress={() => { setPickerActiveIdx(null); setSearchQuery(''); }}
          accessibilityRole="button"
          accessibilityLabel="Close species picker"
        >
          <Pressable
            onPress={() => {}}
            style={[
              {
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: COLORS.background,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                padding: 20,
                paddingBottom: bottom + 24,
                maxHeight: '65%',
              },
              softShadow(0.2, 24, 8),
            ]}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: COLORS.surface,
                borderRadius: 22,
                borderWidth: 1,
                borderColor: COLORS.granite,
                paddingHorizontal: 14,
                height: 44,
                gap: 8,
                marginBottom: 14,
              }}
            >
              <Ionicons name="search" size={16} color={COLORS.granite} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search species…"
                placeholderTextColor={COLORS.granite}
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
                style={{ flex: 1, color: COLORS.ink, fontSize: 14 }}
                accessibilityLabel="Search species"
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery('')} accessibilityRole="button">
                  <Ionicons name="close-circle" size={16} color={COLORS.granite} />
                </Pressable>
              )}
            </View>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {searchResults.map((sp) => (
                <Pressable
                  key={sp.id}
                  onPress={() => assignSpecies(pickerActiveIdx, sp)}
                  accessibilityLabel={`Select ${sp.commonName}`}
                  accessibilityRole="button"
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 10,
                    borderBottomWidth: 1,
                    borderBottomColor: COLORS.granite,
                    gap: 12,
                  }}
                >
                  <View
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      backgroundColor: COLORS.bone,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <SpeciesIcon kind={sp.kind as SpeciesKind} size={24} color={COLORS.ink} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: COLORS.ink, fontWeight: '600', fontSize: 14 }}>
                      {sp.commonName}
                    </Text>
                    <Text style={{ color: COLORS.granite, fontSize: 11, fontStyle: 'italic' }}>
                      {sp.latin}
                    </Text>
                  </View>
                  <Ionicons name="add-circle-outline" size={20} color={COLORS.lichen} />
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      )}
    </View>
  );
}
