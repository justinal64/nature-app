import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS, softShadow } from '@/constants/AppTheme';
import { useAuth } from '@/context/AuthContext';
import { type Collection, createCollection, deleteCollection, getCollections } from '@/lib/collections';

export default function CollectionsScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();

  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');

  const load = useCallback(async () => {
    if (!user) {
      setCollections([]);
      setLoading(false);
      return;
    }
    setCollections(await getCollections(user.uid));
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  async function handleCreate() {
    if (!user || !newName.trim()) return;
    await createCollection(user.uid, newName.trim());
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNewName('');
    setCreating(false);
    load();
  }

  function handleDelete(collection: Collection) {
    Alert.alert(
      'Delete collection?',
      `"${collection.name}" will be removed. Your sightings themselves aren't affected.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!user) return;
            await deleteCollection(user.uid, collection.id);
            load();
          },
        },
      ],
    );
  }

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
          <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 18 }}>Collections</Text>
          <Text style={{ color: COLORS.granite, fontSize: 12, marginTop: 1 }}>
            Group your own sightings around a trip, place, or theme
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setCreating(true)}
          accessibilityLabel="New collection"
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
        data={collections}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: bottom + 24 }}
        ListEmptyComponent={
          !loading ? (
            <View
              style={[
                { backgroundColor: COLORS.surface, borderRadius: 16, padding: 24, alignItems: 'center', marginTop: 20 },
                softShadow(0.04, 5, 1),
              ]}
            >
              <Ionicons name="albums-outline" size={28} color={COLORS.granite} />
              <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 15, marginTop: 10 }}>
                No collections yet
              </Text>
              <Text style={{ color: COLORS.granite, fontSize: 13, textAlign: 'center', marginTop: 6, lineHeight: 18 }}>
                Tap + to start one — e.g. &quot;Grand Canyon 2026&quot; or &quot;Backyard birds.&quot;
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 40).duration(220)}>
            <Pressable
              onPress={() => router.push(`/collection/${item.id}` as never)}
              onLongPress={() => handleDelete(item)}
              accessibilityLabel={`Open ${item.name}, ${item.sightingIds.length} sightings`}
              accessibilityRole="button"
              style={[
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: COLORS.surface,
                  borderRadius: 16,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: COLORS.granite,
                  gap: 12,
                },
                softShadow(0.04, 5, 1),
              ]}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: COLORS.lichen,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="albums" size={22} color={COLORS.bone} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 15 }}>{item.name}</Text>
                <Text style={{ color: COLORS.granite, fontSize: 12, marginTop: 2 }}>
                  {item.sightingIds.length} {item.sightingIds.length === 1 ? 'sighting' : 'sightings'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.granite} />
            </Pressable>
          </Animated.View>
        )}
      />

      {creating && (
        <Pressable
          style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)' }}
          onPress={() => { setCreating(false); setNewName(''); }}
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
              },
              softShadow(0.2, 24, 8),
            ]}
          >
            <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 16, marginBottom: 12 }}>
              New collection
            </Text>
            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder="e.g. Grand Canyon 2026"
              placeholderTextColor={COLORS.granite}
              autoFocus
              onSubmitEditing={handleCreate}
              returnKeyType="done"
              style={{
                backgroundColor: COLORS.surface,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: COLORS.granite,
                paddingHorizontal: 14,
                height: 46,
                color: COLORS.ink,
                fontSize: 15,
                marginBottom: 14,
              }}
            />
            <TouchableOpacity
              onPress={handleCreate}
              disabled={!newName.trim()}
              style={{
                backgroundColor: newName.trim() ? COLORS.lichen : COLORS.granite,
                borderRadius: 14,
                paddingVertical: 13,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: COLORS.bone, fontWeight: '700', fontSize: 15 }}>Create</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      )}
    </View>
  );
}
