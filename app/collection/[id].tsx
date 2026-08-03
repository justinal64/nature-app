import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SpeciesIcon } from '@/components/SpeciesIcon';
import { COLORS, softShadow } from '@/constants/AppTheme';
import { useAuth } from '@/context/AuthContext';
import { type Collection, getCollectionById, toggleSightingInCollection } from '@/lib/collections';
import { getSightings, type Sighting } from '@/lib/sightings';
import { formatRelativeDate } from '@/utils/date';

export default function CollectionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { top, bottom } = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();

  const [collection, setCollection] = useState<Collection | null>(null);
  const [allSightings, setAllSightings] = useState<Sighting[]>([]);
  const [loading, setLoading] = useState(true);
  const [picking, setPicking] = useState(false);

  const load = useCallback(async () => {
    if (!user || !id) return;
    const [c, sightings] = await Promise.all([getCollectionById(user.uid, id), getSightings(user.uid)]);
    setCollection(c ?? null);
    setAllSightings(sightings);
    setLoading(false);
  }, [user, id]);

  useEffect(() => { load(); }, [load]);

  async function toggle(sightingId: string) {
    if (!user || !collection) return;
    const updated = await toggleSightingInCollection(user.uid, collection.id, sightingId);
    setCollection(updated.find((c) => c.id === collection.id) ?? null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  if (!loading && !collection) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: COLORS.granite, fontSize: 14 }}>Collection not found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 12 }}>
          <Text style={{ color: COLORS.lichen, fontWeight: '600' }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const members = collection ? allSightings.filter((s) => collection.sightingIds.includes(s.id)) : [];

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
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
          accessibilityLabel="Back"
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
          <Ionicons name="chevron-back" size={20} color={COLORS.ink} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 18 }} numberOfLines={1}>
            {collection?.name ?? '…'}
          </Text>
          <Text style={{ color: COLORS.granite, fontSize: 12, marginTop: 1 }}>
            {members.length} {members.length === 1 ? 'sighting' : 'sightings'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setPicking(true)}
          accessibilityLabel="Add sightings to this collection"
          accessibilityRole="button"
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: COLORS.lichen,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="add" size={22} color={COLORS.bone} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={members}
        keyExtractor={(s) => s.id}
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: bottom + 24 }}
        ListEmptyComponent={
          !loading ? (
            <View
              style={[
                { backgroundColor: COLORS.surface, borderRadius: 16, padding: 24, alignItems: 'center', marginTop: 20 },
                softShadow(0.04, 5, 1),
              ]}
            >
              <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 15 }}>Nothing here yet</Text>
              <Text style={{ color: COLORS.granite, fontSize: 13, textAlign: 'center', marginTop: 6, lineHeight: 18 }}>
                Tap + to add sightings you&apos;ve already logged.
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item: s }) => (
          <Pressable
            onPress={() => router.push(`/sighting/${s.id}` as never)}
            onLongPress={() => toggle(s.id)}
            accessibilityLabel={`${s.commonName}. Long press to remove from collection.`}
            accessibilityRole="button"
            style={[
              {
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: COLORS.surface,
                borderRadius: 16,
                padding: 12,
                borderWidth: 1,
                borderColor: COLORS.granite,
                gap: 12,
              },
              softShadow(0.04, 5, 1),
            ]}
          >
            {(() => {
              const thumbUri = s.photoUris?.[0] ?? s.photoUri;
              return thumbUri ? (
                <Image source={{ uri: thumbUri }} style={{ width: 52, height: 52, borderRadius: 12 }} contentFit="cover" />
              ) : (
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 12,
                    backgroundColor: COLORS.lichen,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <SpeciesIcon kind={s.kind} size={26} color={COLORS.bone} />
                </View>
              );
            })()}
            <View style={{ flex: 1 }}>
              <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 14 }}>{s.commonName}</Text>
              <Text style={{ color: COLORS.granite, fontSize: 11, marginTop: 2 }}>
                {formatRelativeDate(s.capturedAt)}
              </Text>
            </View>
          </Pressable>
        )}
      />

      {picking && collection && (
        <Pressable
          style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)' }}
          onPress={() => setPicking(false)}
          accessibilityRole="button"
          accessibilityLabel="Close"
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
                maxHeight: '75%',
              },
              softShadow(0.2, 24, 8),
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 16 }}>Add sightings</Text>
              <TouchableOpacity onPress={() => setPicking(false)} accessibilityRole="button" accessibilityLabel="Done">
                <Text style={{ color: COLORS.lichen, fontWeight: '700', fontSize: 15 }}>Done</Text>
              </TouchableOpacity>
            </View>
            {allSightings.length === 0 ? (
              <Text style={{ color: COLORS.granite, fontSize: 13 }}>You haven&apos;t logged any sightings yet.</Text>
            ) : (
              <FlatList
                data={allSightings}
                keyExtractor={(s) => s.id}
                showsVerticalScrollIndicator={false}
                renderItem={({ item: s }) => {
                  const included = collection.sightingIds.includes(s.id);
                  return (
                    <Pressable
                      onPress={() => toggle(s.id)}
                      accessibilityLabel={`${included ? 'Remove' : 'Add'} ${s.commonName}`}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: included }}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: 10,
                        borderBottomWidth: 1,
                        borderBottomColor: COLORS.granite,
                        gap: 12,
                      }}
                    >
                      <Ionicons
                        name={included ? 'checkmark-circle' : 'ellipse-outline'}
                        size={22}
                        color={included ? COLORS.lichen : COLORS.granite}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: COLORS.ink, fontWeight: '600', fontSize: 14 }}>{s.commonName}</Text>
                        <Text style={{ color: COLORS.granite, fontSize: 11, marginTop: 1 }}>
                          {formatRelativeDate(s.capturedAt)}
                        </Text>
                      </View>
                    </Pressable>
                  );
                }}
              />
            )}
          </Pressable>
        </Pressable>
      )}
    </View>
  );
}
