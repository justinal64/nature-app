import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, Text, View } from 'react-native';
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

import { PressableScale } from '@/components/PressableScale';
import { Reveal } from '@/components/Reveal';
import { SpeciesIcon } from '@/components/SpeciesIcon';
import { COLORS, glow, softShadow } from '@/constants/AppTheme';

const OTHER = [
  { name: 'Cardón', pct: 11 },
  { name: 'Organ Pipe', pct: 6 },
  { name: 'Mexican Fence', pct: 3 },
];

const FACTS = [
  { label: 'Habitat', value: 'Sonoran' },
  { label: 'Height', value: '12–18 m' },
  { label: 'Lifespan', value: '150 yr+' },
];

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
  const { photoUri, confidence: confidenceParam, noMatch } = useLocalSearchParams<{
    photoUri?: string;
    confidence?: string;
    noMatch?: string;
  }>();

  const matchPct = confidenceParam !== undefined ? parseInt(confidenceParam, 10) : 96;
  const isLowConfidence = noMatch === 'true' || matchPct < 50;
  const noMatchMode = noMatch === 'true';

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ height: 320, backgroundColor: COLORS.gold, overflow: 'hidden' }}>
          {photoUri ? (
            <Image
              source={{ uri: photoUri }}
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
              {isLowConfidence ? (
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
            {isLowConfidence ? (
              <>
                <Text style={{ color: COLORS.ink, fontSize: 26, fontWeight: '700' }}>
                  {noMatchMode ? "Couldn't identify this" : "We're not confident"}
                </Text>
                <Text
                  style={{ color: COLORS.bark, fontSize: 15, lineHeight: 22, marginTop: 10 }}
                >
                  {noMatchMode
                    ? "Try repositioning the subject or taking a clearer, closer shot."
                    : "The photo doesn't give us enough to be certain. Try getting closer or finding better lighting."}
                </Text>
              </>
            ) : (
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
                  Cacti · Cactaceae
                </Text>
                <Text style={{ color: COLORS.ink, fontSize: 30, fontWeight: '700', marginTop: 6 }}>
                  Saguaro
                </Text>
                <Text
                  style={{
                    color: COLORS.bark,
                    fontStyle: 'italic',
                    fontSize: 15,
                    marginTop: 2,
                  }}
                >
                  Carnegiea gigantea
                </Text>

                <View style={{ flexDirection: 'row', marginTop: 18, gap: 10 }}>
                  {FACTS.map((fact, i) => (
                    <Animated.View
                      key={fact.label}
                      entering={FadeInDown.delay(300 + i * 80).springify().damping(15).stiffness(160)}
                      style={{
                        flex: 1,
                        backgroundColor: COLORS.cream,
                        borderRadius: 14,
                        padding: 12,
                      }}
                    >
                      <Text style={{ color: COLORS.bark, fontSize: 11, fontWeight: '600' }}>
                        {fact.label}
                      </Text>
                      <Text
                        style={{ color: COLORS.ink, fontSize: 15, fontWeight: '700', marginTop: 4 }}
                      >
                        {fact.value}
                      </Text>
                    </Animated.View>
                  ))}
                </View>
              </>
            )}
          </View>
        </Reveal>

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
              {isLowConfidence ? 'Top suggestions' : 'Other possibilities'}
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
              {OTHER.map((alt, i) => (
                <View
                  key={alt.name}
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
                    <SpeciesIcon kind="cactus" size={22} color={COLORS.cream} />
                  </View>
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <Text style={{ color: COLORS.ink, fontWeight: '600', fontSize: 15 }}>
                      {alt.name}
                    </Text>
                    {/* scaled ~6x so single-digit percentages still read as bars */}
                    <MatchBar pct={alt.pct * 6} delay={500 + i * 120} />
                  </View>
                  <Text style={{ color: COLORS.bark, fontSize: 15, fontWeight: '700' }}>
                    {alt.pct}
                    <Text style={{ fontSize: 12, fontWeight: '500' }}>%</Text>
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </Reveal>

        <Reveal delay={380}>
          <View style={{ flexDirection: 'row', marginHorizontal: 16, marginTop: 24, gap: 12 }}>
            {isLowConfidence ? (
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
                  onPress={() => router.replace('/(tabs)')}
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
                    Save to Journal
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
      </ScrollView>
    </View>
  );
}
