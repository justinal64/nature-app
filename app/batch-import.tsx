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
import { addSighting } from '@/lib/sightings';

type ImportItem = {
  uri: string;
  capturedAt: Date;
  location?: { lat: number; lng: number };
  species?: Species;
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
    setItems(
      result.assets.map((a) => {
        const exif = a.exif as Record<string, unknown> | undefined;
        // Parse EXIF date if present (format: "YYYY:MM:DD HH:MM:SS")
        let capturedAt = new Date();
        const exifDate = exif?.DateTimeOriginal;
        if (typeof exifDate === 'string') {
          const parsed = new Date(exifDate.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3'));
          if (!isNaN(parsed.getTime())) capturedAt = parsed;
        }
        const location = exif ? parseExifGps(exif) : undefined;
        return { uri: a.uri, capturedAt, location };
      }),
    );
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
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, species: sp } : item)));
    setPickerActiveIdx(null);
    setSearchQuery('');
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
    const assigned = items.filter((item) => item.species);
    if (assigned.length === 0) {
      Alert.alert('No species assigned', 'Tap each photo to assign a species before saving.');
      return;
    }
    const unassigned = items.length - assigned.length;
    if (unassigned > 0) {
      Alert.alert(
        'Some photos unassigned',
        `${unassigned} photo${unassigned > 1 ? 's' : ''} without a species will be skipped. Save ${assigned.length} sighting${assigned.length > 1 ? 's' : ''}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Save assigned', onPress: () => doSave(assigned) },
        ],
      );
    } else {
      doSave(assigned);
    }
  }

  const assignedCount = items.filter((i) => i.species).length;

  if (items.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: COLORS.bark, fontSize: 14 }}>Opening photo library…</Text>
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
          borderBottomColor: COLORS.sand,
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
            borderColor: COLORS.sand,
          }}
        >
          <Ionicons name="close" size={20} color={COLORS.ink} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 18 }}>Import photos</Text>
          <Text style={{ color: COLORS.bark, fontSize: 12, marginTop: 1 }}>
            {assignedCount} of {items.length} assigned
          </Text>
        </View>
        <Pressable
          onPress={saveAll}
          disabled={saving || assignedCount === 0}
          accessibilityLabel="Save all assigned sightings"
          accessibilityRole="button"
          style={{
            backgroundColor: assignedCount > 0 ? COLORS.clay : COLORS.sand,
            borderRadius: 20,
            paddingHorizontal: 16,
            paddingVertical: 9,
            opacity: saving ? 0.6 : 1,
          }}
        >
          <Text style={{ color: COLORS.cream, fontWeight: '700', fontSize: 14 }}>
            {saving ? 'Saving…' : assignedCount > 0 ? `Save ${assignedCount}` : 'Save'}
          </Text>
        </Pressable>
      </View>

      {/* Photo list */}
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {items.map((item, idx) => (
          <View
            key={`${item.uri}-${idx}`}
            style={[
              {
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: COLORS.surface,
                borderRadius: 16,
                padding: 12,
                borderWidth: 1,
                borderColor: item.species ? COLORS.sage : COLORS.sand,
                gap: 12,
              },
              softShadow(0.04, 5, 1),
            ]}
          >
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
                      backgroundColor: COLORS.sage,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <SpeciesIcon kind={item.species.kind as SpeciesKind} size={20} color={COLORS.cream} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 14 }}>
                      {item.species.commonName}
                    </Text>
                    <Text style={{ color: COLORS.bark, fontSize: 11, fontStyle: 'italic' }}>
                      {item.species.latin}
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="search-outline" size={15} color={COLORS.bark} />
                  <Text style={{ color: COLORS.bark, fontSize: 14 }}>Assign species…</Text>
                </View>
              )}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                <Text style={{ color: COLORS.bark, fontSize: 11 }}>
                  {item.capturedAt.toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
                {item.location && (
                  <Ionicons name="location" size={11} color={COLORS.sage} />
                )}
              </View>
            </Pressable>
            <TouchableOpacity
              onPress={() => removeItem(idx)}
              hitSlop={8}
              accessibilityLabel="Remove from import"
              accessibilityRole="button"
            >
              <Ionicons name="close-circle" size={20} color={COLORS.bark} />
            </TouchableOpacity>
          </View>
        ))}
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
                borderColor: COLORS.sand,
                paddingHorizontal: 14,
                height: 44,
                gap: 8,
                marginBottom: 14,
              }}
            >
              <Ionicons name="search" size={16} color={COLORS.bark} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search species…"
                placeholderTextColor={COLORS.bark}
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
                style={{ flex: 1, color: COLORS.ink, fontSize: 14 }}
                accessibilityLabel="Search species"
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery('')} accessibilityRole="button">
                  <Ionicons name="close-circle" size={16} color={COLORS.bark} />
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
                    borderBottomColor: COLORS.sand,
                    gap: 12,
                  }}
                >
                  <View
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      backgroundColor: COLORS.cream,
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
                    <Text style={{ color: COLORS.bark, fontSize: 11, fontStyle: 'italic' }}>
                      {sp.latin}
                    </Text>
                  </View>
                  <Ionicons name="add-circle-outline" size={20} color={COLORS.clay} />
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      )}
    </View>
  );
}
