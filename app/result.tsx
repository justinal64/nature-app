import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { G, Path, Rect } from 'react-native-svg';

import * as ImagePicker from 'expo-image-picker';

import { PressableScale } from '@/components/PressableScale';
import { Reveal } from '@/components/Reveal';
import { SpeciesIcon } from '@/components/SpeciesIcon';
import { COLORS, glow, softShadow } from '@/constants/AppTheme';
import { getSpeciesById } from '@/constants/catalog';
import type { Species } from '@/constants/catalog';
import { useAuth } from '@/context/AuthContext';
import { OFFLINE_FALLBACK, identifySpecies } from '@/lib/identify';
import type { IdentifyResult } from '@/lib/identify';
import { cancelStreakReminder } from '@/lib/notifications';
import { addSighting, findDuplicateSighting, type Activity, type LifeStage, type ObservationType, type Phenology, type Sex } from '@/lib/sightings';
import { maybeRequestReview } from '@/lib/review';

const KIND_LABEL: Record<Species['kind'], string> = {
  cactus: 'Plant',
  bird: 'Bird',
  insect: 'Insect',
  snake: 'Reptile',
  mammal: 'Mammal',
  lizard: 'Reptile',
  amphibian: 'Amphibian',
  arachnid: 'Arachnid',
  fungus: 'Fungi / Lichen',
};

function MatchBar({ pct, delay }: { pct: number; delay: number }) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withDelay(
      delay,
      withTiming(pct, { duration: 800, easing: Easing.out(Easing.cubic) }),
    );
  }, [width, pct, delay]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${width.value}%` }));

  return (
    <View
      style={{
        height: 5,
        borderRadius: 3,
        backgroundColor: COLORS.sand,
        overflow: 'hidden',
        marginTop: 7,
      }}
    >
      <Animated.View
        style={[{ height: '100%', borderRadius: 3, backgroundColor: COLORS.clay }, fillStyle]}
      />
    </View>
  );
}

export default function ResultScreen() {
  const { top } = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [identifying, setIdentifying] = useState(true);
  const [results, setResults] = useState<IdentifyResult[]>([]);
  const [note, setNote] = useState('');
  const [capturedAt, setCapturedAt] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [observationType, setObservationType] = useState<ObservationType>('organism');
  const [sex, setSex] = useState<Sex | undefined>(undefined);
  const [lifeStage, setLifeStage] = useState<LifeStage | undefined>(undefined);
  const [activity, setActivity] = useState<Activity | undefined>(undefined);
  const [phenology, setPhenology] = useState<Phenology | undefined>(undefined);
  const [extraPhotos, setExtraPhotos] = useState<string[]>([]);
  const locationRef = useRef<{ lat: number; lng: number } | null>(null);

  const { photoUri } = useLocalSearchParams<{ photoUri?: string }>();

  useEffect(() => {
    // Opportunistically grab location — don't block identification on it
    Location.requestForegroundPermissionsAsync().then(({ status }) => {
      if (status === 'granted') {
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
          .then((pos) => {
            locationRef.current = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          })
          .catch(() => {});
      }
    });
  }, []);

  useEffect(() => {
    const uri = typeof photoUri === 'string' ? photoUri : null;
    if (!uri) {
      setResults(OFFLINE_FALLBACK);
      setIdentifying(false);
      return;
    }
    identifySpecies(uri)
      .then(setResults)
      .finally(() => setIdentifying(false));
  }, [photoUri]);

  const topResult = results[0] ?? null;
  const alternatives = results.slice(1, 4);
  const isOffline = topResult?.isOffline ?? false;
  const matchPct = topResult?.confidence ?? 0;
  const isLowConfidence = !topResult || (!isOffline && matchPct < 50);
  const catalogEntry = topResult?.speciesId ? getSpeciesById(topResult.speciesId) : undefined;
  const stats = catalogEntry?.stats ?? [];

  async function pickExtraPhotos() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.85,
    });
    if (!result.canceled) {
      setExtraPhotos((prev) => [...prev, ...result.assets.map((a) => a.uri)]);
    }
  }

  async function doSave() {
    if (!user || !topResult) { router.replace('/(tabs)'); return; }
    setSaving(true);
    const primaryUri = typeof photoUri === 'string' ? photoUri : undefined;
    const allPhotoUris = [primaryUri, ...extraPhotos].filter(Boolean) as string[];
    try {
      await addSighting({
        userId: user.uid,
        speciesId: topResult.speciesId ?? topResult.latin.toLowerCase().replace(/\s+/g, '-'),
        commonName: topResult.commonName,
        latinName: topResult.latin,
        kind: topResult.kind,
        photoUris: allPhotoUris.length > 0 ? allPhotoUris : undefined,
        notes: note.trim() || undefined,
        capturedAt: capturedAt.toISOString(),
        observationType,
        sex,
        lifeStage,
        activity: topResult.kind !== 'cactus' ? activity : undefined,
        phenology: topResult.kind === 'cactus' ? phenology : undefined,
        location: locationRef.current ?? undefined,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      cancelStreakReminder().catch(() => {});
      maybeRequestReview(user.uid).catch(() => {});
      router.replace('/(tabs)');
    } catch {
      Alert.alert('Error', 'Could not save sighting. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function saveTopResult() {
    if (!user || !topResult) { router.replace('/(tabs)'); return; }
    const speciesId = topResult.speciesId ?? topResult.latin.toLowerCase().replace(/\s+/g, '-');
    const dupe = await findDuplicateSighting(user.uid, speciesId, capturedAt, locationRef.current ?? undefined);
    if (dupe) {
      Alert.alert(
        'Already logged',
        `You logged a ${topResult.commonName} recently. Save another entry?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Save anyway', onPress: doSave },
        ],
      );
    } else {
      doSave();
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ height: 320, backgroundColor: COLORS.gold, overflow: 'hidden' }}>
          {photoUri ? (
            <Image
              source={{ uri: photoUri as string }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
            />
          ) : (
            <Svg width="100%" height="100%" viewBox="0 0 393 320" preserveAspectRatio="none">
              <Rect x={0} y={0} width={393} height={320} fill={COLORS.gold} />
              <Path
                d="M0 220 L 80 180 L 140 210 L 220 170 L 290 200 L 393 175 L 393 320 L 0 320 Z"
                fill={COLORS.dusk}
                opacity={0.4}
              />
              <Path
                d="M0 250 L 100 220 L 180 245 L 260 215 L 350 240 L 393 225 L 393 320 L 0 320 Z"
                fill={COLORS.bark}
                opacity={0.5}
              />
              <Rect x={0} y={280} width={393} height={40} fill={COLORS.clay} opacity={0.7} />
              <G fill={COLORS.ink} opacity={0.85}>
                <Rect x={170} y={110} width={32} height={210} rx={12} />
                <Path d="M170 210 q -34 0 -34 -34 v -28 q 0 -12 12 -12 v 36 q 0 8 8 8 h 14 z" />
                <Path d="M202 190 q 34 0 34 -34 v -36 q 0 -12 -12 -12 v 44 q 0 8 -8 8 h -14 z" />
              </G>
            </Svg>
          )}

          <View
            style={{
              position: 'absolute',
              top: top + 12,
              left: 16,
              right: 16,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Animated.View entering={FadeIn.delay(120).duration(300)}>
              <PressableScale
                onPress={() => router.back()}
                scaleTo={0.88}
                accessibilityLabel="Go back"
                accessibilityRole="button"
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 21,
                  backgroundColor: 'rgba(10, 10, 24, 0.4)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="chevron-back" size={22} color={COLORS.cream} />
              </PressableScale>
            </Animated.View>

            <Animated.View entering={ZoomIn.delay(350).springify().damping(11).stiffness(220)}>
              {identifying ? (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    backgroundColor: 'rgba(10, 10, 24, 0.55)',
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 18,
                  }}
                >
                  <ActivityIndicator size="small" color={COLORS.cream} />
                  <Text style={{ color: COLORS.cream, fontWeight: '600', fontSize: 13 }}>
                    Identifying…
                  </Text>
                </View>
              ) : isOffline ? (
                <View
                  style={[
                    {
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      backgroundColor: COLORS.dusk,
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: 18,
                      opacity: 0.92,
                    },
                    glow(COLORS.dusk, 8),
                  ]}
                >
                  <Ionicons name="wifi-outline" size={14} color={COLORS.cream} />
                  <Text style={{ color: COLORS.cream, fontWeight: '700', fontSize: 13 }}>
                    Offline
                  </Text>
                </View>
              ) : isLowConfidence ? (
                <View
                  style={[
                    {
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      backgroundColor: COLORS.clay,
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: 18,
                      opacity: 0.92,
                    },
                    glow(COLORS.clay, 8),
                  ]}
                >
                  <Ionicons name="help-circle" size={16} color={COLORS.cream} />
                  <Text style={{ color: COLORS.cream, fontWeight: '700', fontSize: 13 }}>
                    Not sure
                  </Text>
                </View>
              ) : (
                <View
                  style={[
                    {
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      backgroundColor: COLORS.sage,
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: 18,
                    },
                    glow(COLORS.sage, 10),
                  ]}
                >
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.ink} />
                  <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 13 }}>
                    {matchPct}% match
                  </Text>
                </View>
              )}
            </Animated.View>
          </View>
        </View>

        <Reveal delay={120}>
          <View
            style={[
              {
                marginHorizontal: 16,
                marginTop: -36,
                backgroundColor: COLORS.surface,
                borderRadius: 22,
                padding: 22,
                borderWidth: 1,
                borderColor: COLORS.sand,
              },
              softShadow(0.08, 16, 4),
            ]}
          >
            {identifying ? (
              <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                <ActivityIndicator size="large" color={COLORS.clay} />
                <Text style={{ color: COLORS.bark, marginTop: 14, fontSize: 15 }}>
                  Analyzing your photo…
                </Text>
              </View>
            ) : isOffline ? (
              <>
                <Text style={{ color: COLORS.ink, fontSize: 26, fontWeight: '700' }}>
                  Working offline
                </Text>
                <Text
                  style={{ color: COLORS.bark, fontSize: 15, lineHeight: 22, marginTop: 10 }}
                >
                  No connection available. Here are common species in your area — select the one
                  you spotted.
                </Text>
              </>
            ) : isLowConfidence ? (
              <>
                <Text style={{ color: COLORS.ink, fontSize: 26, fontWeight: '700' }}>
                  We&apos;re not confident
                </Text>
                <Text
                  style={{ color: COLORS.bark, fontSize: 15, lineHeight: 22, marginTop: 10 }}
                >
                  The photo doesn&apos;t give us enough to be certain. Try getting closer or
                  finding better lighting.
                </Text>
              </>
            ) : (
              topResult && (
                <>
                  <Text
                    style={{
                      color: COLORS.clay,
                      fontSize: 12,
                      fontWeight: '700',
                      letterSpacing: 0.6,
                      textTransform: 'uppercase',
                    }}
                  >
                    {KIND_LABEL[topResult.kind]}
                    {catalogEntry ? ` · ${catalogEntry.family}` : ''}
                  </Text>
                  <Text
                    style={{ color: COLORS.ink, fontSize: 30, fontWeight: '700', marginTop: 6 }}
                  >
                    {topResult.commonName}
                  </Text>
                  <Text
                    style={{
                      color: COLORS.bark,
                      fontStyle: 'italic',
                      fontSize: 15,
                      marginTop: 2,
                    }}
                  >
                    {topResult.latin}
                  </Text>

                  {stats.length > 0 && (
                    <View style={{ flexDirection: 'row', marginTop: 18, gap: 10 }}>
                      {stats.slice(0, 3).map((stat, i) => (
                        <Animated.View
                          key={stat.label}
                          entering={FadeInDown.delay(300 + i * 80)
                            .springify()
                            .damping(15)
                            .stiffness(160)}
                          style={{
                            flex: 1,
                            backgroundColor: COLORS.cream,
                            borderRadius: 14,
                            padding: 12,
                          }}
                        >
                          <Text style={{ color: COLORS.bark, fontSize: 11, fontWeight: '600' }}>
                            {stat.label}
                          </Text>
                          <Text
                            style={{
                              color: COLORS.ink,
                              fontSize: 15,
                              fontWeight: '700',
                              marginTop: 4,
                            }}
                          >
                            {stat.value}
                          </Text>
                        </Animated.View>
                      ))}
                    </View>
                  )}
                </>
              )
            )}
          </View>
        </Reveal>

        {!identifying && alternatives.length > 0 && (
          <Reveal delay={260}>
            <View style={{ marginHorizontal: 16, marginTop: 22 }}>
              <Text
                style={{
                  color: COLORS.bark,
                  fontSize: 12,
                  fontWeight: '700',
                  letterSpacing: 0.6,
                  textTransform: 'uppercase',
                  marginBottom: 10,
                }}
              >
                {isOffline ? 'Common in your area' : 'Other possibilities'}
              </Text>
              <View
                style={[
                  {
                    backgroundColor: COLORS.surface,
                    borderRadius: 16,
                    overflow: 'hidden',
                    borderWidth: 1,
                    borderColor: COLORS.sand,
                  },
                  softShadow(0.04, 6, 2),
                ]}
              >
                {alternatives.map((alt, i) => (
                  <Pressable
                    key={alt.speciesId ?? alt.latin}
                    onPress={() =>
                      alt.speciesId
                        ? router.push(`/species/${alt.speciesId}` as never)
                        : undefined
                    }
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 12,
                      paddingHorizontal: 14,
                      borderTopWidth: i === 0 ? 0 : 1,
                      borderTopColor: COLORS.sand,
                    }}
                  >
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        backgroundColor: COLORS.sage,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12,
                      }}
                    >
                      <SpeciesIcon kind={alt.kind} size={22} color={COLORS.cream} />
                    </View>
                    <View style={{ flex: 1, marginRight: 12 }}>
                      <Text style={{ color: COLORS.ink, fontWeight: '600', fontSize: 15 }}>
                        {alt.commonName}
                      </Text>
                      {!isOffline && (
                        <MatchBar pct={alt.confidence} delay={500 + i * 120} />
                      )}
                    </View>
                    {!isOffline && (
                      <Text style={{ color: COLORS.bark, fontSize: 15, fontWeight: '700' }}>
                        {alt.confidence}
                        <Text style={{ fontSize: 12, fontWeight: '500' }}>%</Text>
                      </Text>
                    )}
                    {alt.speciesId && (
                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color={COLORS.bark}
                        style={{ marginLeft: isOffline ? 0 : 6 }}
                      />
                    )}
                  </Pressable>
                ))}
              </View>
            </View>
          </Reveal>
        )}

        {!identifying && !isLowConfidence && (
          <Reveal delay={300}>
            <View style={{ marginHorizontal: 16, marginTop: 16, gap: 10 }}>
              {/* Date row */}
              <Pressable
                onPress={() => setShowDatePicker(true)}
                style={[
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: COLORS.sand,
                    backgroundColor: COLORS.surface,
                    paddingHorizontal: 14,
                    paddingVertical: 13,
                  },
                ]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="calendar-outline" size={16} color={COLORS.bark} />
                  <Text style={{ color: COLORS.bark, fontSize: 13, fontWeight: '600' }}>Date observed</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ color: COLORS.ink, fontSize: 14, fontWeight: '600' }}>
                    {capturedAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </Text>
                  <Ionicons name="chevron-forward" size={14} color={COLORS.bark} />
                </View>
              </Pressable>

              {showDatePicker && (
                <DateTimePicker
                  value={capturedAt}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'inline' : 'default'}
                  maximumDate={new Date()}
                  onChange={(_: DateTimePickerEvent, date?: Date) => {
                    if (Platform.OS !== 'ios') setShowDatePicker(false);
                    if (date) setCapturedAt(date);
                  }}
                />
              )}

              {/* Extra photos strip */}
              <View style={{ gap: 8 }}>
                <Text style={{ color: COLORS.bark, fontSize: 11, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                  Photos
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {extraPhotos.map((uri, i) => (
                    <View key={`${uri}-${i}`} style={{ position: 'relative' }}>
                      <Image source={{ uri }} style={{ width: 72, height: 72, borderRadius: 12 }} contentFit="cover" />
                      <Pressable
                        onPress={() => setExtraPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                        accessibilityLabel="Remove photo"
                        accessibilityRole="button"
                        style={{ position: 'absolute', top: -6, right: -6, backgroundColor: COLORS.clay, borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Ionicons name="close" size={12} color={COLORS.cream} />
                      </Pressable>
                    </View>
                  ))}
                  <Pressable
                    onPress={pickExtraPhotos}
                    accessibilityLabel="Add more photos"
                    accessibilityRole="button"
                    style={{
                      width: 72, height: 72, borderRadius: 12,
                      borderWidth: 1.5, borderColor: COLORS.sand, borderStyle: 'dashed',
                      backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', gap: 4,
                    }}
                  >
                    <Ionicons name="add" size={22} color={COLORS.clay} />
                    <Text style={{ color: COLORS.clay, fontSize: 10, fontWeight: '700' }}>Add</Text>
                  </Pressable>
                </ScrollView>
              </View>

              {/* Observation type */}
              <View style={{ gap: 8 }}>
                <Text style={{ color: COLORS.bark, fontSize: 11, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                  What did you find?
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {([
                    ['organism', 'Organism'],
                    ['track',    'Track'],
                    ['scat',     'Scat'],
                    ['nest',     'Nest'],
                    ['shed',     'Shed skin'],
                    ['sound',    'Sound'],
                    ['other',    'Other'],
                  ] as [ObservationType, string][]).map(([type, label]) => (
                    <Pressable
                      key={type}
                      onPress={() => setObservationType(type)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 7,
                        borderRadius: 20,
                        borderWidth: 1.5,
                        borderColor: observationType === type ? COLORS.clay : COLORS.sand,
                        backgroundColor: observationType === type ? COLORS.clay : COLORS.surface,
                      }}
                    >
                      <Text style={{ color: observationType === type ? COLORS.cream : COLORS.bark, fontSize: 13, fontWeight: '600' }}>
                        {label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Annotations */}
              {topResult && (
                <>
                  {/* Sex */}
                  <View style={{ gap: 6 }}>
                    <Text style={{ color: COLORS.bark, fontSize: 11, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                      Sex
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {(['male', 'female'] as Sex[]).map((s) => (
                        <Pressable
                          key={s}
                          onPress={() => setSex(sex === s ? undefined : s)}
                          style={{
                            paddingHorizontal: 14,
                            paddingVertical: 7,
                            borderRadius: 20,
                            borderWidth: 1.5,
                            borderColor: sex === s ? COLORS.dusk : COLORS.sand,
                            backgroundColor: sex === s ? COLORS.dusk : COLORS.surface,
                          }}
                        >
                          <Text style={{ color: sex === s ? COLORS.cream : COLORS.bark, fontSize: 13, fontWeight: '600', textTransform: 'capitalize' }}>
                            {s}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>

                  {/* Life Stage */}
                  <View style={{ gap: 6 }}>
                    <Text style={{ color: COLORS.bark, fontSize: 11, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                      Life Stage
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {(['egg', 'larva', 'juvenile', 'adult'] as LifeStage[]).map((ls) => (
                        <Pressable
                          key={ls}
                          onPress={() => setLifeStage(lifeStage === ls ? undefined : ls)}
                          style={{
                            paddingHorizontal: 12,
                            paddingVertical: 7,
                            borderRadius: 20,
                            borderWidth: 1.5,
                            borderColor: lifeStage === ls ? COLORS.gold : COLORS.sand,
                            backgroundColor: lifeStage === ls ? COLORS.gold : COLORS.surface,
                          }}
                        >
                          <Text style={{ color: lifeStage === ls ? COLORS.ink : COLORS.bark, fontSize: 13, fontWeight: '600', textTransform: 'capitalize' }}>
                            {ls}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>

                  {/* Activity (animals only) */}
                  {topResult.kind !== 'cactus' && (
                    <View style={{ gap: 6 }}>
                      <Text style={{ color: COLORS.bark, fontSize: 11, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                        Activity
                      </Text>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        {(['feeding', 'perching', 'flying', 'nesting', 'basking', 'calling'] as Activity[]).map((act) => (
                          <Pressable
                            key={act}
                            onPress={() => setActivity(activity === act ? undefined : act)}
                            style={{
                              paddingHorizontal: 12,
                              paddingVertical: 7,
                              borderRadius: 20,
                              borderWidth: 1.5,
                              borderColor: activity === act ? COLORS.sage : COLORS.sand,
                              backgroundColor: activity === act ? COLORS.sage : COLORS.surface,
                            }}
                          >
                            <Text style={{ color: activity === act ? COLORS.ink : COLORS.bark, fontSize: 13, fontWeight: '600', textTransform: 'capitalize' }}>
                              {act}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Phenology (plants only) */}
                  {topResult.kind === 'cactus' && (
                    <View style={{ gap: 6 }}>
                      <Text style={{ color: COLORS.bark, fontSize: 11, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                        Phenology
                      </Text>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        {(['vegetative', 'flowering', 'fruiting', 'senescent'] as Phenology[]).map((ph) => (
                          <Pressable
                            key={ph}
                            onPress={() => setPhenology(phenology === ph ? undefined : ph)}
                            style={{
                              paddingHorizontal: 12,
                              paddingVertical: 7,
                              borderRadius: 20,
                              borderWidth: 1.5,
                              borderColor: phenology === ph ? COLORS.sage : COLORS.sand,
                              backgroundColor: phenology === ph ? COLORS.sage : COLORS.surface,
                            }}
                          >
                            <Text style={{ color: phenology === ph ? COLORS.ink : COLORS.bark, fontSize: 13, fontWeight: '600', textTransform: 'capitalize' }}>
                              {ph}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    </View>
                  )}
                </>
              )}

              {/* Note input */}
              <View
                style={{
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: COLORS.sand,
                  backgroundColor: COLORS.surface,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                }}
              >
                <TextInput
                  value={note}
                  onChangeText={setNote}
                  placeholder="Add a note… (optional)"
                  placeholderTextColor={COLORS.bark}
                  multiline
                  maxLength={300}
                  style={{
                    color: COLORS.ink,
                    fontSize: 14,
                    lineHeight: 20,
                    minHeight: 44,
                  }}
                />
              </View>
            </View>
          </Reveal>
        )}

        {!identifying && (
          <Reveal delay={380}>
            <View style={{ flexDirection: 'row', marginHorizontal: 16, marginTop: 24, gap: 12 }}>
              {isLowConfidence && !isOffline ? (
                <>
                  <PressableScale
                    onPress={() => router.replace('/capture')}
                    scaleTo={0.97}
                    style={[
                      {
                        flex: 2,
                        backgroundColor: COLORS.clay,
                        borderRadius: 24,
                        paddingVertical: 16,
                        alignItems: 'center',
                      },
                      glow(COLORS.clay, 10),
                    ]}
                  >
                    <Text style={{ color: COLORS.cream, fontWeight: '700', fontSize: 15 }}>
                      Retake photo
                    </Text>
                  </PressableScale>
                  <PressableScale
                    onPress={() => router.replace('/(tabs)/guide')}
                    scaleTo={0.97}
                    style={{
                      flex: 1,
                      backgroundColor: 'transparent',
                      borderRadius: 24,
                      paddingVertical: 16,
                      alignItems: 'center',
                      borderWidth: 1.5,
                      borderColor: COLORS.bark,
                    }}
                  >
                    <Text style={{ color: COLORS.bark, fontWeight: '700', fontSize: 15 }}>
                      Browse guide
                    </Text>
                  </PressableScale>
                </>
              ) : (
                <>
                  <PressableScale
                    onPress={saveTopResult}
                    disabled={saving || !topResult}
                    scaleTo={0.97}
                    style={[
                      {
                        flex: 2,
                        backgroundColor: COLORS.clay,
                        borderRadius: 24,
                        paddingVertical: 16,
                        alignItems: 'center',
                        opacity: saving || !topResult ? 0.6 : 1,
                      },
                      glow(COLORS.clay, 10),
                    ]}
                  >
                    <Text style={{ color: COLORS.cream, fontWeight: '700', fontSize: 15 }}>
                      {saving ? 'Saving…' : 'Save to Journal'}
                    </Text>
                  </PressableScale>
                  <PressableScale
                    onPress={() => router.replace('/capture')}
                    scaleTo={0.97}
                    style={{
                      flex: 1,
                      backgroundColor: 'transparent',
                      borderRadius: 24,
                      paddingVertical: 16,
                      alignItems: 'center',
                      borderWidth: 1.5,
                      borderColor: COLORS.bark,
                    }}
                  >
                    <Text style={{ color: COLORS.bark, fontWeight: '700', fontSize: 15 }}>
                      Retake
                    </Text>
                  </PressableScale>
                </>
              )}
            </View>
          </Reveal>
        )}
      </ScrollView>
    </View>
  );
}
