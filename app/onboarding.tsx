import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { SpeciesIcon } from '@/components/SpeciesIcon';
import { COLORS, glow, softShadow } from '@/constants/AppTheme';

export const ONBOARDING_KEY = 'onboarding_complete_v1';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Slide = {
  title: string;
  subtitle: string;
  cta: string;
  bg: string;
  accent: string;
  illustration: () => React.ReactNode;
};

function CameraIllustration() {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: 200, height: 200 }}>
      <View style={[{ width: 160, height: 120, borderRadius: 24, backgroundColor: COLORS.ink, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: COLORS.gold }, softShadow(0.25, 20, 8)]}>
        <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.sage, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: COLORS.cream }}>
          <SpeciesIcon kind="cactus" size={34} color={COLORS.cream} />
        </View>
      </View>
      <View style={{ position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.clay, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke={COLORS.cream} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </View>
    </View>
  );
}

function GuideIllustration() {
  const kinds = ['bird', 'cactus', 'insect', 'snake'] as const;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: 180, gap: 12, alignItems: 'center', justifyContent: 'center' }}>
      {kinds.map((k) => (
        <View key={k} style={[{ width: 76, height: 76, borderRadius: 20, backgroundColor: COLORS.cream, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: COLORS.sand }, softShadow(0.12, 10, 4)]}>
          <SpeciesIcon kind={k} size={46} color={COLORS.ink} />
        </View>
      ))}
    </View>
  );
}

function JournalIllustration() {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: 200, height: 200 }}>
      <View style={[{ width: 160, borderRadius: 20, backgroundColor: COLORS.cream, padding: 16, borderWidth: 1.5, borderColor: COLORS.sand }, softShadow(0.15, 14, 6)]}>
        {[
          { kind: 'bird' as const, name: 'Roadrunner', when: '2 days ago' },
          { kind: 'cactus' as const, name: 'Saguaro', when: 'Last week' },
          { kind: 'snake' as const, name: 'Sidewinder', when: 'June 20' },
        ].map((item, i) => (
          <View key={item.name} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 7, borderBottomWidth: i < 2 ? 1 : 0, borderBottomColor: COLORS.sand }}>
            <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: COLORS.sage, alignItems: 'center', justifyContent: 'center' }}>
              <SpeciesIcon kind={item.kind} size={22} color={COLORS.cream} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 12 }}>{item.name}</Text>
              <Text style={{ color: COLORS.bark, fontSize: 10 }}>{item.when}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const SLIDES: Slide[] = [
  {
    title: 'Identify what\nyou find',
    subtitle: 'Point your camera at any desert plant or animal. Our AI identifies it instantly — even offline.',
    cta: 'Next',
    bg: COLORS.gold,
    accent: COLORS.ink,
    illustration: () => <CameraIllustration />,
  },
  {
    title: 'Explore\n49 species',
    subtitle: 'Browse the full guide across four deserts — Sonoran, Mojave, Chihuahuan, and Great Basin. No signal needed.',
    cta: 'Next',
    bg: COLORS.sage,
    accent: COLORS.ink,
    illustration: () => <GuideIllustration />,
  },
  {
    title: 'Build your\nfield journal',
    subtitle: 'Every find is logged, mapped, and shareable. Earn badges as you discover more of the desert.',
    cta: 'Get started',
    bg: COLORS.clay,
    accent: COLORS.cream,
    illustration: () => <JournalIllustration />,
  },
];

export default function OnboardingScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const dotScale = useSharedValue(1);

  const slide = SLIDES[index];

  function goNext() {
    if (index < SLIDES.length - 1) {
      const next = index + 1;
      scrollRef.current?.scrollTo({ x: next * SCREEN_WIDTH, animated: true });
      setIndex(next);
      dotScale.value = withSpring(1.3, { damping: 8 }, () => {
        dotScale.value = withSpring(1);
      });
    } else {
      finish();
    }
  }

  async function finish() {
    await AsyncStorage.setItem(ONBOARDING_KEY, '1');
    router.replace('/');
  }

  const dotStyle = useAnimatedStyle(() => ({ transform: [{ scale: dotScale.value }] }));

  return (
    <View style={{ flex: 1, backgroundColor: slide.bg }}>
      {/* Skip */}
      <Pressable
        onPress={finish}
        accessibilityLabel="Skip onboarding"
        accessibilityRole="button"
        style={{ position: 'absolute', top: top + 14, right: 20, zIndex: 10, paddingHorizontal: 14, paddingVertical: 8 }}
      >
        <Text style={{ color: slide.accent, opacity: 0.6, fontWeight: '600', fontSize: 14 }}>Skip</Text>
      </Pressable>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        style={{ flex: 1 }}
      >
        {SLIDES.map((s, i) => (
          <View key={i} style={{ width: SCREEN_WIDTH, flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: top + 56, paddingBottom: bottom + 160, paddingHorizontal: 32 }}>
            <Animated.View entering={FadeIn.delay(100).duration(400)} style={{ marginBottom: 40 }}>
              {s.illustration()}
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(180).duration(400)} style={{ alignItems: 'center' }}>
              <Text style={{ color: s.accent, fontSize: 36, fontWeight: '800', lineHeight: 42, textAlign: 'center', letterSpacing: -0.5, marginBottom: 18 }}>
                {s.title}
              </Text>
              <Text style={{ color: s.accent, opacity: 0.75, fontSize: 16, lineHeight: 24, textAlign: 'center' }}>
                {s.subtitle}
              </Text>
            </Animated.View>
          </View>
        ))}
      </ScrollView>

      {/* Dots + CTA */}
      <View style={{ position: 'absolute', bottom: bottom + 32, left: 24, right: 24, alignItems: 'center', gap: 24 }}>
        {/* Dots */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {SLIDES.map((_, i) => (
            <Animated.View
              key={i}
              style={[
                {
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: slide.accent,
                  opacity: i === index ? 1 : 0.25,
                  width: i === index ? 28 : 8,
                },
                i === index ? dotStyle : {},
              ]}
            />
          ))}
        </View>

        {/* CTA button */}
        <Pressable
          onPress={goNext}
          accessibilityLabel={slide.cta}
          accessibilityRole="button"
          style={[
            {
              width: '100%',
              paddingVertical: 18,
              borderRadius: 28,
              backgroundColor: slide.accent,
              alignItems: 'center',
            },
            slide.bg === COLORS.clay ? {} : glow(slide.accent, 12),
          ]}
        >
          <Text style={{ color: slide.bg, fontWeight: '800', fontSize: 17, letterSpacing: 0.2 }}>
            {slide.cta}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
