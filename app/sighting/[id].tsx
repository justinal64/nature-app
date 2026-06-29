import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SpeciesIcon } from '@/components/SpeciesIcon';
import { COLORS, glow, softShadow } from '@/constants/AppTheme';
import { getSpeciesById } from '@/constants/catalog';
import { useAuth } from '@/context/AuthContext';
import type { Sighting } from '@/lib/sightings';
import { deleteSighting, getSightingById, updateSighting } from '@/lib/sightings';

const KIND_COLOR: Record<string, string> = {
  cactus: COLORS.sage,
  bird: COLORS.clay,
  insect: COLORS.gold,
  snake: COLORS.dusk,
};

function formatFullDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function SightingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { top } = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const [sighting, setSighting] = useState<Sighting | null>(null);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!user || !id) return;
    getSightingById(user.uid, id).then((s) => {
      if (s) {
        setSighting(s);
        setNotes(s.notes ?? '');
      }
    });
  }, [user, id]);

  async function saveNotes() {
    if (!user || !sighting) return;
    await updateSighting(user.uid, sighting.id, { notes: notes.trim() || undefined });
    setSighting((prev) => prev ? { ...prev, notes: notes.trim() || undefined } : prev);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setEditingNotes(false);
  }

  async function handleDelete() {
    Alert.alert('Delete this sighting?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (!user || !sighting) return;
          await deleteSighting(user.uid, sighting.id);
          router.back();
        },
      },
    ]);
  }

  if (!sighting) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: COLORS.bark, fontSize: 14 }}>Loading…</Text>
      </View>
    );
  }

  const species = getSpeciesById(sighting.speciesId);
  const kindColor = KIND_COLOR[sighting.kind] ?? COLORS.sage;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Header */}
      <View
        style={{
          paddingTop: top + 12,
          paddingBottom: 12,
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
        <Text style={{ flex: 1, color: COLORS.ink, fontWeight: '700', fontSize: 18 }} numberOfLines={1}>
          {sighting.commonName}
        </Text>
        <TouchableOpacity
          onPress={handleDelete}
          accessibilityLabel="Delete sighting"
          accessibilityRole="button"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="trash-outline" size={20} color={COLORS.clay} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 48 }} showsVerticalScrollIndicator={false}>

        {/* Photo carousel / species icon */}
        <Animated.View entering={FadeIn.duration(300)} style={{ marginBottom: 20 }}>
          {(() => {
            const photos = sighting.photoUris?.length ? sighting.photoUris : sighting.photoUri ? [sighting.photoUri] : [];
            if (photos.length === 0) {
              return (
                <View style={{ width: '100%', height: 180, borderRadius: 20, backgroundColor: kindColor, alignItems: 'center', justifyContent: 'center' }}>
                  <SpeciesIcon kind={sighting.kind as never} size={80} color={COLORS.cream} />
                </View>
              );
            }
            if (photos.length === 1) {
              return (
                <Image source={{ uri: photos[0] }} style={{ width: '100%', height: 240, borderRadius: 20 }} contentFit="cover" />
              );
            }
            return (
              <View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                  {photos.map((uri, i) => (
                    <Image key={`${uri}-${i}`} source={{ uri }} style={{ width: 260, height: 240, borderRadius: 20 }} contentFit="cover" />
                  ))}
                </ScrollView>
                <Text style={{ color: COLORS.bark, fontSize: 11, textAlign: 'center', marginTop: 6 }}>{photos.length} photos · swipe to browse</Text>
              </View>
            );
          })()}
        </Animated.View>

        {/* Identity */}
        <Animated.View entering={FadeInDown.delay(80).duration(280)} style={[
          { backgroundColor: COLORS.surface, borderRadius: 18, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: COLORS.sand },
          softShadow(0.04, 6, 2),
        ]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: kindColor, alignItems: 'center', justifyContent: 'center' }}>
              <SpeciesIcon kind={sighting.kind as never} size={32} color={COLORS.cream} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: COLORS.ink, fontWeight: '800', fontSize: 20 }}>{sighting.commonName}</Text>
              <Text style={{ color: COLORS.bark, fontStyle: 'italic', fontSize: 14, marginTop: 2 }}>{sighting.latinName}</Text>
            </View>
          </View>
          {species && (
            <Text style={{ color: COLORS.bark, fontSize: 12, marginTop: 12, lineHeight: 18 }} numberOfLines={3}>
              {species.description}
            </Text>
          )}
        </Animated.View>

        {/* Date & Location */}
        <Animated.View entering={FadeInDown.delay(140).duration(280)} style={[
          { backgroundColor: COLORS.surface, borderRadius: 18, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: COLORS.sand, gap: 12 },
          softShadow(0.03, 4, 1),
        ]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Ionicons name="calendar-outline" size={18} color={COLORS.clay} />
            <Text style={{ color: COLORS.ink, fontSize: 14, flex: 1 }}>{formatFullDate(sighting.capturedAt)}</Text>
          </View>
          {sighting.location && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Ionicons name="location-outline" size={18} color={COLORS.clay} />
              <Text style={{ color: COLORS.ink, fontSize: 14 }}>
                {sighting.location.lat.toFixed(4)}°, {sighting.location.lng.toFixed(4)}°
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Notes */}
        <Animated.View entering={FadeInDown.delay(200).duration(280)} style={[
          { backgroundColor: COLORS.surface, borderRadius: 18, padding: 18, marginBottom: 20, borderWidth: 1, borderColor: COLORS.sand },
          softShadow(0.03, 4, 1),
        ]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <Text style={{ flex: 1, color: COLORS.bark, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Field notes
            </Text>
            <TouchableOpacity
              onPress={() => setEditingNotes((v) => !v)}
              accessibilityLabel={editingNotes ? 'Cancel editing notes' : 'Edit notes'}
              accessibilityRole="button"
            >
              <Text style={{ color: COLORS.clay, fontWeight: '600', fontSize: 13 }}>
                {editingNotes ? 'Cancel' : 'Edit'}
              </Text>
            </TouchableOpacity>
          </View>
          {editingNotes ? (
            <>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="What did you notice? Behavior, habitat, conditions…"
                placeholderTextColor={COLORS.bark}
                multiline
                maxLength={500}
                autoFocus
                style={{
                  color: COLORS.ink, fontSize: 14, lineHeight: 21,
                  minHeight: 80, borderWidth: 1, borderColor: COLORS.sand,
                  borderRadius: 10, padding: 10,
                }}
              />
              <Pressable
                onPress={saveNotes}
                accessibilityLabel="Save notes"
                accessibilityRole="button"
                style={[
                  { backgroundColor: COLORS.clay, borderRadius: 20, paddingVertical: 12, alignItems: 'center', marginTop: 12 },
                  glow(COLORS.clay, 6),
                ]}
              >
                <Text style={{ color: COLORS.cream, fontWeight: '700', fontSize: 14 }}>Save notes</Text>
              </Pressable>
            </>
          ) : (
            <Text style={{ color: sighting.notes ? COLORS.ink : COLORS.bark, fontSize: 14, lineHeight: 21, fontStyle: sighting.notes ? 'normal' : 'italic' }}>
              {sighting.notes ?? 'No notes yet — tap Edit to add some.'}
            </Text>
          )}
        </Animated.View>

        {/* View species button */}
        {species && (
          <Animated.View entering={FadeInDown.delay(260).duration(280)}>
            <TouchableOpacity
              onPress={() => router.push(`/species/${sighting.speciesId}` as never)}
              accessibilityLabel={`View ${sighting.commonName} in field guide`}
              accessibilityRole="button"
              style={[
                {
                  backgroundColor: COLORS.clay, borderRadius: 24,
                  paddingVertical: 16, alignItems: 'center',
                  flexDirection: 'row', justifyContent: 'center', gap: 8,
                },
                glow(COLORS.clay, 8),
              ]}
            >
              <Ionicons name="book-outline" size={18} color={COLORS.cream} />
              <Text style={{ color: COLORS.cream, fontWeight: '700', fontSize: 16 }}>View in field guide</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}
