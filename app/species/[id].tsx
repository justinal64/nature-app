import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, Pressable, ScrollView, Share, Text, View } from 'react-native';
import Animated, {
  Extrapolation,
  FadeIn,
  FadeInDown,
  ZoomIn,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { G, Path, Rect } from 'react-native-svg';

import { PressableScale } from '@/components/PressableScale';
import { Reveal } from '@/components/Reveal';
import { SpeciesIcon, SpeciesKind } from '@/components/SpeciesIcon';
import { COLORS, glow, softShadow } from '@/constants/AppTheme';
import { getActiveMonths, getRelatedSpecies, getSpeciesById } from '@/constants/catalog';
import { useAuth } from '@/context/AuthContext';
import { isFavorited, toggleFavorite } from '@/lib/favorites';
import { useSightings } from '@/hooks/useSightings';
import { formatRelativeDate } from '@/utils/date';

const SCREEN_WIDTH = Dimensions.get('window').width;
const HERO_HEIGHT = 360;

const TABS = ['Overview', 'ID Tips', 'Your sightings'] as const;
type TabName = (typeof TABS)[number];

// One entry per carousel image. Extend when real photos are bundled.
const IMAGES = ['primary'] as const;

export default function SpeciesDetailScreen() {
  const { id: speciesId } = useLocalSearchParams<{ id: string }>();
  const { top } = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { sightings } = useSightings(user?.uid);
  const speciesSightings = sightings.filter((s) => s.speciesId === speciesId);
  const [tab, setTab] = useState<TabName>('Overview');
  const [liked, setLiked] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  const species = speciesId ? getSpeciesById(speciesId) : undefined;

  useEffect(() => {
    if (!user || !speciesId) return;
    isFavorited(user.uid, speciesId).then(setLiked);
  }, [user, speciesId]);

  const scrollY = useSharedValue(0);
  const heartScale = useSharedValue(1);

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  // Stretch on pull-down, recede at half speed on scroll-up
  const heroStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [-HERO_HEIGHT, 0, HERO_HEIGHT],
          [-HERO_HEIGHT / 2, 0, HERO_HEIGHT / 2],
          Extrapolation.CLAMP,
        ),
      },
      {
        scale: interpolate(scrollY.value, [-HERO_HEIGHT, 0], [1.8, 1], {
          extrapolateRight: Extrapolation.CLAMP,
        }),
      },
    ],
  }));

  const heartStyle = useAnimatedStyle(() => ({ transform: [{ scale: heartScale.value }] }));

  const toggleLike = async () => {
    if (!user || !speciesId) return;
    const next = await toggleFavorite(user.uid, speciesId);
    setLiked(next);
    Haptics.impactAsync(next ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light);
    heartScale.value = withSequence(
      withSpring(1.45, { damping: 9, stiffness: 420 }),
      withSpring(1, { damping: 14, stiffness: 260 }),
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 36 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[{ height: HERO_HEIGHT, overflow: 'hidden' }, heroStyle]}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) =>
              setImageIndex(Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH))
            }
            style={{ height: HERO_HEIGHT }}
          >
            {IMAGES.map((key, i) => (
              <View
                key={key}
                style={{
                  width: SCREEN_WIDTH,
                  height: HERO_HEIGHT,
                  backgroundColor: COLORS.gold,
                  overflow: 'hidden',
                }}
              >
                {i === 0 && (
                  <Svg width="100%" height="100%" viewBox="0 0 393 360" preserveAspectRatio="none">
                    <Rect x={0} y={0} width={393} height={360} fill={COLORS.gold} />
                    <Path
                      d="M0 250 L 80 210 L 140 240 L 220 200 L 290 230 L 393 205 L 393 360 L 0 360 Z"
                      fill={COLORS.dusk}
                      opacity={0.4}
                    />
                    <Path
                      d="M0 280 L 100 250 L 180 275 L 260 245 L 350 270 L 393 255 L 393 360 L 0 360 Z"
                      fill={COLORS.bark}
                      opacity={0.5}
                    />
                    <Rect x={0} y={310} width={393} height={50} fill={COLORS.clay} opacity={0.7} />
                    <G fill={COLORS.ink} opacity={0.85}>
                      <Rect x={170} y={130} width={32} height={220} rx={12} />
                      <Path d="M170 230 q -34 0 -34 -34 v -28 q 0 -12 12 -12 v 36 q 0 8 8 8 h 14 z" />
                      <Path d="M202 210 q 34 0 34 -34 v -36 q 0 -12 -12 -12 v 44 q 0 8 -8 8 h -14 z" />
                    </G>
                  </Svg>
                )}
              </View>
            ))}
          </ScrollView>

          <View
            style={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              backgroundColor: 'rgba(10, 10, 24, 0.5)',
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: COLORS.cream, fontSize: 11, fontWeight: '600' }}>
              {imageIndex + 1} / {IMAGES.length}
            </Text>
          </View>
        </Animated.View>

        <Reveal>
          <View style={{ paddingHorizontal: 24, marginTop: 22 }}>
            <Text
              style={{
                color: COLORS.clay,
                fontSize: 12,
                fontWeight: '700',
                letterSpacing: 0.6,
                textTransform: 'uppercase',
              }}
            >
              {species?.family ?? '—'}
            </Text>
            <Text style={{ color: COLORS.ink, fontSize: 32, fontWeight: '700', marginTop: 4 }}>
              {species?.commonName ?? 'Unknown species'}
            </Text>
            <Text
              style={{
                color: COLORS.bark,
                fontStyle: 'italic',
                fontSize: 15,
                marginTop: 2,
              }}
            >
              {species?.latin ?? ''}
            </Text>
          </View>
        </Reveal>

        <Reveal delay={70}>
          <View
            style={{
              flexDirection: 'row',
              marginHorizontal: 24,
              marginTop: 22,
              backgroundColor: COLORS.cream,
              borderRadius: 14,
              padding: 4,
            }}
          >
            {TABS.map((t) => {
              const active = tab === t;
              return (
                <Pressable
                  key={t}
                  onPress={() => setTab(t)}
                  style={[
                    {
                      flex: 1,
                      paddingVertical: 10,
                      borderRadius: 11,
                      alignItems: 'center',
                      backgroundColor: active ? COLORS.surface : 'transparent',
                    },
                    active ? softShadow(0.05, 4, 1) : {},
                  ]}
                >
                  <Text
                    style={{
                      color: active ? COLORS.ink : COLORS.bark,
                      fontWeight: active ? '700' : '600',
                      fontSize: 13,
                    }}
                  >
                    {t}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Reveal>

        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            paddingHorizontal: 16,
            marginTop: 20,
            gap: 10,
          }}
        >
          {(species?.stats ?? []).map((s, i) => (
            <Animated.View
              key={s.label}
              entering={ZoomIn.delay(140 + i * 70).springify().damping(13).stiffness(180)}
              style={[
                {
                  width: '47.5%',
                  backgroundColor: COLORS.surface,
                  borderRadius: 14,
                  padding: 14,
                  borderWidth: 1,
                  borderColor: COLORS.sand,
                },
                softShadow(0.04, 6, 2),
              ]}
            >
              <Text style={{ color: COLORS.bark, fontSize: 11, fontWeight: '600' }}>{s.label}</Text>
              <Text
                style={{
                  color: COLORS.ink,
                  fontSize: 17,
                  fontWeight: '700',
                  marginTop: 4,
                }}
              >
                {s.value}
              </Text>
            </Animated.View>
          ))}
        </View>

        {tab === 'Overview' && (
          <Animated.View key="overview" entering={FadeInDown.duration(280)}>
            <View style={{ paddingHorizontal: 24, marginTop: 22 }}>
              <Text style={{ color: COLORS.ink, fontSize: 15, lineHeight: 23 }}>
                {species?.description ?? ''}
              </Text>
            </View>

            {species?.didYouKnow ? (
              <View
                style={[
                  {
                    marginHorizontal: 16,
                    marginTop: 22,
                    backgroundColor: COLORS.dusk,
                    borderRadius: 18,
                    padding: 18,
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    gap: 12,
                  },
                  glow(COLORS.dusk, 12),
                ]}
              >
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: COLORS.gold,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 16 }}>i</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: COLORS.gold,
                      fontSize: 11,
                      fontWeight: '700',
                      letterSpacing: 0.6,
                      textTransform: 'uppercase',
                      marginBottom: 4,
                    }}
                  >
                    Did you know
                  </Text>
                  <Text style={{ color: COLORS.cream, fontSize: 14, lineHeight: 20 }}>
                    {species.didYouKnow}
                  </Text>
                </View>
              </View>
            ) : null}
          </Animated.View>
        )}

        {tab === 'ID Tips' && (
          <View style={{ paddingHorizontal: 24, marginTop: 22, gap: 14 }}>
            {(species?.idTips ?? []).map((tip, i) => (
              <Animated.View
                key={tip}
                entering={FadeInDown.delay(i * 60).duration(280)}
                style={{ flexDirection: 'row', gap: 10 }}
              >
                <Text
                  style={{ color: COLORS.clay, fontSize: 16, fontWeight: '700', lineHeight: 23 }}
                >
                  •
                </Text>
                <Text style={{ color: COLORS.ink, fontSize: 15, lineHeight: 23, flex: 1 }}>
                  {tip}
                </Text>
              </Animated.View>
            ))}
          </View>
        )}

        {/* Seasonal activity bar — shown on Overview and ID Tips tabs */}
        {tab !== 'Your sightings' && speciesId && (
          <Animated.View entering={FadeInDown.delay(180).duration(300)} style={{ paddingHorizontal: 24, marginTop: 28 }}>
            <Text style={{ color: COLORS.bark, fontSize: 12, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 12 }}>
              Activity by month
            </Text>
            <View style={{ flexDirection: 'row', gap: 4 }}>
              {['J','F','M','A','M','J','J','A','S','O','N','D'].map((m, i) => {
                const activeMonths = getActiveMonths(speciesId);
                const active = activeMonths.includes(i + 1);
                return (
                  <View key={`${m}-${i}`} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                    <View style={{ width: '100%', height: 32, borderRadius: 6, backgroundColor: active ? COLORS.sage : COLORS.sand, opacity: active ? 1 : 0.4 }} />
                    <Text style={{ color: COLORS.bark, fontSize: 9, fontWeight: '600' }}>{m}</Text>
                  </View>
                );
              })}
            </View>
          </Animated.View>
        )}

        {/* Related species — shown on Overview tab */}
        {tab === 'Overview' && species && (() => {
          const related = getRelatedSpecies(species);
          if (related.length === 0) return null;
          return (
            <Animated.View entering={FadeInDown.delay(240).duration(300)} style={{ marginTop: 28, paddingBottom: 32 }}>
              <Text style={{ color: COLORS.bark, fontSize: 12, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 12, paddingHorizontal: 24 }}>
                You might also see
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
                {related.map((rel) => (
                  <PressableScale
                    key={rel.id}
                    onPress={() => router.push(`/species/${rel.id}` as never)}
                    scaleTo={0.96}
                    accessibilityLabel={`View ${rel.commonName}`}
                    accessibilityRole="button"
                    style={[{ width: 110, borderRadius: 18, backgroundColor: COLORS.surface, padding: 12, borderWidth: 1, borderColor: COLORS.sand, alignItems: 'center', gap: 8 }, softShadow(0.04, 6, 2)]}
                  >
                    <View style={{ width: 60, height: 60, borderRadius: 14, backgroundColor: COLORS.cream, alignItems: 'center', justifyContent: 'center' }}>
                      <SpeciesIcon kind={rel.kind as SpeciesKind} size={38} color={COLORS.ink} />
                    </View>
                    <Text numberOfLines={2} style={{ color: COLORS.ink, fontWeight: '700', fontSize: 12, textAlign: 'center', lineHeight: 16 }}>
                      {rel.commonName}
                    </Text>
                    <Text style={{ color: COLORS.bark, fontSize: 10, textAlign: 'center' }}>{rel.region.replace('_', ' ')}</Text>
                  </PressableScale>
                ))}
              </ScrollView>
            </Animated.View>
          );
        })()}

        {tab === 'Your sightings' && (
          <Animated.View key="sightings" entering={FadeInDown.duration(280)}>
            {speciesSightings.length === 0 ? (
              <View style={{ paddingHorizontal: 24, marginTop: 48, alignItems: 'center', gap: 8 }}>
                <Text style={{ color: COLORS.ink, fontSize: 16, fontWeight: '700' }}>
                  No sightings yet
                </Text>
                <Text style={{ color: COLORS.bark, fontSize: 14, textAlign: 'center', lineHeight: 20 }}>
                  {`Spot a ${species?.commonName ?? 'one'}? Use the camera to log your first sighting.`}
                </Text>
              </View>
            ) : (
              <View style={{ paddingHorizontal: 20, marginTop: 20, gap: 10 }}>
                {speciesSightings.map((s) => (
                  <View
                    key={s.id}
                    style={[
                      {
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
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        backgroundColor: COLORS.sage,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <SpeciesIcon kind={s.kind as SpeciesKind} size={30} color={COLORS.cream} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 15 }}>
                        {formatRelativeDate(s.capturedAt)}
                      </Text>
                      {s.notes ? (
                        <Text style={{ color: COLORS.bark, fontSize: 13, marginTop: 2 }}>
                          {s.notes}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </Animated.View>
        )}
      </Animated.ScrollView>

      <Animated.View
        entering={FadeIn.delay(150).duration(350)}
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
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <PressableScale
            onPress={toggleLike}
            scaleTo={0.88}
            accessibilityLabel="Toggle favorite"
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
            <Animated.View style={heartStyle}>
              <Ionicons
                name={liked ? 'heart' : 'heart-outline'}
                size={20}
                color={liked ? COLORS.clay : COLORS.cream}
              />
            </Animated.View>
          </PressableScale>
          <PressableScale
            scaleTo={0.88}
            accessibilityLabel="Compare with another species"
            accessibilityRole="button"
            onPress={() => router.push(`/compare?a=${speciesId}` as never)}
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: 'rgba(10, 10, 24, 0.4)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="git-compare-outline" size={20} color={COLORS.cream} />
          </PressableScale>
          <PressableScale
            scaleTo={0.88}
            accessibilityLabel="Ask AI about this species"
            accessibilityRole="button"
            onPress={() => router.push(`/ask?speciesId=${speciesId}` as never)}
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: 'rgba(10, 10, 24, 0.4)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={20} color={COLORS.cream} />
          </PressableScale>
          <PressableScale
            scaleTo={0.88}
            accessibilityLabel="Share"
            accessibilityRole="button"
            onPress={() =>
              Share.share({
                message: `Check out the ${species?.commonName ?? 'species'} (${species?.latin ?? ''}) on WildLens!`,
              })
            }
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: 'rgba(10, 10, 24, 0.4)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="share-outline" size={20} color={COLORS.cream} />
          </PressableScale>
        </View>
      </Animated.View>
    </View>
  );
}
