import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Platform, Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS, softShadow } from '@/constants/AppTheme';
import { useAuth } from '@/context/AuthContext';
import {
  type Challenge,
  createChallenge,
  deleteChallenge,
  getChallenges,
  getChallengeSpecies,
  getChallengeStatus,
} from '@/lib/challenges';
import { getSightings, type Sighting } from '@/lib/sightings';

const STATUS_CONFIG: Record<ReturnType<typeof getChallengeStatus>, { label: string; color: string }> = {
  upcoming: { label: 'Upcoming', color: COLORS.granite },
  active: { label: 'Active', color: COLORS.lichen },
  ended: { label: 'Ended', color: COLORS.granite },
};

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, days: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export default function ChallengesScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [sightings, setSightings] = useState<Sighting[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(addDays(new Date(), 7));
  const [target, setTarget] = useState('');
  const [pickerOpen, setPickerOpen] = useState<'start' | 'end' | null>(null);

  const load = useCallback(async () => {
    if (!user) {
      setChallenges([]);
      setSightings([]);
      setLoading(false);
      return;
    }
    const [c, s] = await Promise.all([getChallenges(user.uid), getSightings(user.uid)]);
    setChallenges(c);
    setSightings(s);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  function resetForm() {
    setName('');
    setStartDate(new Date());
    setEndDate(addDays(new Date(), 7));
    setTarget('');
    setPickerOpen(null);
  }

  async function handleCreate() {
    if (!user || !name.trim()) return;
    if (toISODate(endDate) < toISODate(startDate)) {
      Alert.alert('Check your dates', 'The end date needs to be on or after the start date.');
      return;
    }
    await createChallenge(user.uid, {
      name: name.trim(),
      startDate: toISODate(startDate),
      endDate: toISODate(endDate),
      targetSpecies: target.trim() ? Math.max(1, parseInt(target.trim(), 10)) : undefined,
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    resetForm();
    setCreating(false);
    load();
  }

  function handleDelete(challenge: Challenge) {
    Alert.alert('Delete challenge?', `"${challenge.name}" will be removed. Your sightings aren't affected.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (!user) return;
          await deleteChallenge(user.uid, challenge.id);
          load();
        },
      },
    ]);
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
          <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 18 }}>Challenges</Text>
          <Text style={{ color: COLORS.granite, fontSize: 12, marginTop: 1 }}>
            Your own time-boxed species-count goals
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setCreating(true)}
          accessibilityLabel="New challenge"
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
        data={challenges}
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
              <Ionicons name="flag-outline" size={28} color={COLORS.granite} />
              <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 15, marginTop: 10 }}>
                No challenges yet
              </Text>
              <Text style={{ color: COLORS.granite, fontSize: 13, textAlign: 'center', marginTop: 6, lineHeight: 18 }}>
                Set yourself a goal — e.g. 20 species in a weekend.
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item, index }) => {
          const status = getChallengeStatus(item);
          const cfg = STATUS_CONFIG[status];
          const species = getChallengeSpecies(item, sightings);
          const pct = item.targetSpecies ? Math.min(1, species.size / item.targetSpecies) : null;
          return (
            <Animated.View entering={FadeInDown.delay(index * 40).duration(220)}>
              <Pressable
                onLongPress={() => handleDelete(item)}
                accessibilityLabel={`${item.name}, ${cfg.label}, ${species.size} species logged`}
                style={[
                  {
                    backgroundColor: COLORS.surface,
                    borderRadius: 16,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: COLORS.granite,
                    gap: 10,
                  },
                  softShadow(0.04, 5, 1),
                ]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 15, flex: 1 }} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <View style={{ backgroundColor: cfg.color, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 }}>
                    <Text style={{ color: COLORS.bone, fontSize: 10, fontWeight: '700', textTransform: 'uppercase' }}>
                      {cfg.label}
                    </Text>
                  </View>
                </View>
                <Text style={{ color: COLORS.granite, fontSize: 12 }}>
                  {new Date(item.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  {' – '}
                  {new Date(item.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </Text>
                <Text style={{ color: COLORS.ink, fontSize: 14, fontWeight: '600' }}>
                  {species.size} {species.size === 1 ? 'species' : 'species'}
                  {item.targetSpecies ? ` of ${item.targetSpecies}` : ''} logged
                </Text>
                {pct != null && (
                  <View style={{ height: 6, borderRadius: 3, backgroundColor: COLORS.background, overflow: 'hidden' }}>
                    <View style={{ height: 6, width: `${Math.round(pct * 100)}%`, backgroundColor: COLORS.lichen }} />
                  </View>
                )}
              </Pressable>
            </Animated.View>
          );
        }}
      />

      {creating && (
        <Pressable
          style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)' }}
          onPress={() => { setCreating(false); resetForm(); }}
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
                gap: 12,
              },
              softShadow(0.2, 24, 8),
            ]}
          >
            <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 16 }}>New challenge</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. 20 species this weekend"
              placeholderTextColor={COLORS.granite}
              autoFocus
              style={{
                backgroundColor: COLORS.surface,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: COLORS.granite,
                paddingHorizontal: 14,
                height: 46,
                color: COLORS.ink,
                fontSize: 15,
              }}
            />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable
                onPress={() => setPickerOpen(pickerOpen === 'start' ? null : 'start')}
                style={{
                  flex: 1,
                  backgroundColor: COLORS.surface,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: COLORS.granite,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                }}
              >
                <Text style={{ color: COLORS.granite, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>Start</Text>
                <Text style={{ color: COLORS.ink, fontSize: 14, fontWeight: '600', marginTop: 2 }}>
                  {startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setPickerOpen(pickerOpen === 'end' ? null : 'end')}
                style={{
                  flex: 1,
                  backgroundColor: COLORS.surface,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: COLORS.granite,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                }}
              >
                <Text style={{ color: COLORS.granite, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>End</Text>
                <Text style={{ color: COLORS.ink, fontSize: 14, fontWeight: '600', marginTop: 2 }}>
                  {endDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </Text>
              </Pressable>
            </View>
            {pickerOpen && (
              <DateTimePicker
                value={pickerOpen === 'start' ? startDate : endDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                onChange={(_: DateTimePickerEvent, date?: Date) => {
                  if (Platform.OS !== 'ios') setPickerOpen(null);
                  if (!date) return;
                  if (pickerOpen === 'start') setStartDate(date);
                  else setEndDate(date);
                }}
              />
            )}
            <TextInput
              value={target}
              onChangeText={(t) => setTarget(t.replace(/[^0-9]/g, ''))}
              placeholder="Target species count (optional)"
              placeholderTextColor={COLORS.granite}
              keyboardType="number-pad"
              style={{
                backgroundColor: COLORS.surface,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: COLORS.granite,
                paddingHorizontal: 14,
                height: 46,
                color: COLORS.ink,
                fontSize: 15,
              }}
            />
            <TouchableOpacity
              onPress={handleCreate}
              disabled={!name.trim()}
              style={{
                backgroundColor: name.trim() ? COLORS.lichen : COLORS.granite,
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
