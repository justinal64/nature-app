import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { Floating } from '@/components/Floating';
import { LandscapeHeader } from '@/components/LandscapeHeader';
import { PressableScale } from '@/components/PressableScale';
import { Reveal } from '@/components/Reveal';
import { SpeciesIcon, SpeciesKind } from '@/components/SpeciesIcon';
import { COLORS, glow, softShadow } from '@/constants/AppTheme';
import { getCategoryCount, getSpeciesById } from '@/constants/catalog';
import { useAuth } from '@/context/AuthContext';
import { useSightings } from '@/hooks/useSightings';
import { useStreak } from '@/hooks/useStreak';
import { pickDailySpecies, scheduleStreakReminder } from '@/lib/notifications';
import { formatRelativeDate } from '@/utils/date';

const CATEGORIES = [
  { name: 'Plants', kind: 'cactus' as SpeciesKind },
  { name: 'Birds', kind: 'bird' as SpeciesKind },
  { name: 'Mammals', kind: 'mammal' as SpeciesKind },
  { name: 'Lizards', kind: 'lizard' as SpeciesKind },
  { name: 'Snakes', kind: 'snake' as SpeciesKind },
  { name: 'Amphibians', kind: 'amphibian' as SpeciesKind },
  { name: 'Insects', kind: 'insect' as SpeciesKind },
  { name: 'Arachnids', kind: 'arachnid' as SpeciesKind },
];

function todayLabel() {
  const now = new Date();
  const weekday = now.toLocaleDateString('en-US', { weekday: 'long' });
  const date = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  return `${weekday} · ${date}`;
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning,';
  if (hour < 18) return 'Good afternoon,';
  return 'Good evening,';
}

const sotd = pickDailySpecies();

export default function HomeScreen() {
  const { top } = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { sightings } = useSightings(user?.uid);
  const streak = useStreak(user?.uid);

  // Schedule a 7 PM reminder if user has an active streak but no sighting today.
  // Cancels automatically when a sighting is saved (result.tsx calls cancelStreakReminder).
  useEffect(() => {
    if (!user?.uid || streak === 0) return;
    scheduleStreakReminder(user.uid, streak).catch(() => {});
  }, [user?.uid, streak]);

  const firstName = user?.displayName?.trim().split(' ')[0] || user?.email?.split('@')[0] || 'friend';
  const initial = firstName.charAt(0).toUpperCase();
  const recentFinds = sightings.slice(0, 4);

  // Today's activity
  const todayStr = new Date().toDateString();
  const todaySightings = sightings.filter((s) => new Date(s.capturedAt).toDateString() === todayStr);
  const todayCount = todaySightings.length;
  const uniqueKindsToday = new Set(todaySightings.map((s) => s.kind)).size;

  const sotdSpecies = getSpeciesById(sotd.id);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.background }}
      contentContainerStyle={{ paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
    >
      <LandscapeHeader height={220} />

      <View style={{ height: top + 8 }} />

      <Reveal>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            paddingHorizontal: 24,
            paddingTop: 18,
            paddingBottom: 22,
          }}
        >
          <View>
            <Text
              style={{
                color: COLORS.bark,
                fontSize: 13,
                fontWeight: '600',
                letterSpacing: 0.5,
                marginBottom: 8,
              }}
            >
              {todayLabel()}
            </Text>
            <Text style={{ color: COLORS.ink, fontSize: 28, fontWeight: '400', lineHeight: 34 }}>
              {greeting()}
            </Text>
            <Text style={{ color: COLORS.ink, fontSize: 28, fontWeight: '700', lineHeight: 34 }}>
              {firstName}.
            </Text>
          </View>
          <Animated.View entering={ZoomIn.delay(200).springify().damping(12)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <PressableScale
              onPress={() => router.push('/search' as never)}
              scaleTo={0.9}
              accessibilityLabel="Search species"
              accessibilityRole="button"
              style={[
                {
                  width: 42,
                  height: 42,
                  borderRadius: 21,
                  backgroundColor: COLORS.surface,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: COLORS.sand,
                },
                softShadow(0.06, 6, 2),
              ]}
            >
              <Ionicons name="search-outline" size={20} color={COLORS.ink} />
            </PressableScale>
            <View
              style={[
                {
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  backgroundColor: COLORS.dusk,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: COLORS.cream,
                },
                softShadow(0.12, 8, 3),
              ]}
            >
              <Text style={{ color: COLORS.cream, fontSize: 22, fontWeight: '700' }}>{initial}</Text>
            </View>
          </Animated.View>
        </View>
      </Reveal>

      <Reveal delay={90}>
        <PressableScale
          onPress={() => router.push('/capture')}
          scaleTo={0.98}
          accessibilityLabel="Identify a species with AI — take a photo"
          accessibilityRole="button"
          style={[
            {
              marginHorizontal: 20,
              height: 168,
              borderRadius: 24,
              overflow: 'hidden',
            },
            softShadow(0.18, 18, 8),
          ]}
        >
          <LinearGradient
            colors={[COLORS.gold, COLORS.clay]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1.3 }}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          />
          <Svg
            width="100%"
            height="100%"
            viewBox="0 0 360 168"
            preserveAspectRatio="none"
            style={{ position: 'absolute' }}
          >
            <Path
              d="M -20 100 Q 80 60, 180 90 T 380 70 L 380 168 L -20 168 Z"
              fill={COLORS.gold}
              opacity={0.7}
            />
            <Path
              d="M -20 130 Q 100 100, 220 130 T 380 110 L 380 168 L -20 168 Z"
              fill={COLORS.ink}
              opacity={0.55}
            />
          </Svg>

          <Floating amplitude={4} duration={3600} style={{ position: 'absolute', right: 18, top: 8, opacity: 0.85 }}>
            <SpeciesIcon kind="cactus" size={140} color={COLORS.ink} />
          </Floating>

          <View style={{ position: 'absolute', left: 22, top: 22 }}>
            <Text
              style={{
                color: COLORS.ink,
                fontSize: 22,
                fontWeight: '700',
                letterSpacing: 0.2,
              }}
            >
              AI Identify
            </Text>
            <Text
              style={{
                color: COLORS.ink,
                opacity: 0.7,
                fontSize: 14,
                marginTop: 4,
                fontWeight: '500',
              }}
            >
              See something in the wild?
            </Text>
          </View>

          <View
            style={{
              position: 'absolute',
              right: 16,
              bottom: 16,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: COLORS.cream,
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 22,
              gap: 8,
            }}
          >
            <Ionicons name="camera" size={14} color={COLORS.ink} />
            <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 13 }}>Take a photo</Text>
          </View>
        </PressableScale>
      </Reveal>

      {/* Species of the Day */}
      <Reveal delay={128}>
        <PressableScale
          onPress={() => router.push(`/species/${sotd.id}` as never)}
          scaleTo={0.98}
          accessibilityLabel={`Species of the day: ${sotd.commonName}`}
          accessibilityRole="button"
          style={[
            {
              marginHorizontal: 20,
              marginTop: 14,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: COLORS.sage,
              borderRadius: 18,
              padding: 14,
              gap: 12,
              overflow: 'hidden',
            },
            softShadow(0.08, 8, 3),
          ]}
        >
          <View
            style={[
              {
                width: 52,
                height: 52,
                borderRadius: 14,
                backgroundColor: COLORS.cream,
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              },
              glow(COLORS.sage, 8),
            ]}
          >
            <SpeciesIcon kind={(sotdSpecies?.kind ?? 'cactus') as SpeciesKind} size={34} color={COLORS.ink} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: COLORS.cream, fontSize: 10, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase', opacity: 0.85 }}>
              Species of the Day
            </Text>
            <Text numberOfLines={1} style={{ color: COLORS.cream, fontWeight: '700', fontSize: 15, marginTop: 2 }}>
              {sotd.commonName}
            </Text>
            <Text numberOfLines={1} style={{ color: COLORS.cream, fontSize: 12, opacity: 0.8, marginTop: 1 }}>
              {sotd.description.slice(0, 64)}…
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={COLORS.cream} style={{ opacity: 0.8 }} />
        </PressableScale>
      </Reveal>

      <Reveal delay={140}>
        <PressableScale
          onPress={() => router.push('/ask' as never)}
          scaleTo={0.98}
          accessibilityLabel="Ask the Field Guide AI a question"
          accessibilityRole="button"
          style={[
            {
              marginHorizontal: 20,
              marginTop: 14,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: COLORS.surface,
              borderRadius: 18,
              padding: 14,
              borderWidth: 1,
              borderColor: COLORS.sand,
              gap: 12,
            },
            softShadow(0.05, 8, 2),
          ]}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: COLORS.clay,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={20} color={COLORS.cream} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 14 }}>Ask the Field Guide</Text>
            <Text style={{ color: COLORS.bark, fontSize: 12, marginTop: 1 }}>On-device AI · No internet needed</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={COLORS.bark} />
        </PressableScale>
      </Reveal>

      <Reveal delay={170}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 24,
            marginTop: 28,
            marginBottom: 14,
          }}
        >
          <Text style={{ color: COLORS.ink, fontSize: 18, fontWeight: '700' }}>Recent finds</Text>
          <Pressable
            onPress={() => router.push('/(tabs)/journal')}
            accessibilityLabel="See all journal entries"
            accessibilityRole="button"
          >
            <Text style={{ color: COLORS.clay, fontSize: 13, fontWeight: '600' }}>See all ›</Text>
          </Pressable>
        </View>
      </Reveal>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
      >
        {recentFinds.length === 0 ? (
          <View style={{ paddingVertical: 8, paddingHorizontal: 4 }}>
            <Text style={{ color: COLORS.bark, fontSize: 14 }}>
              Your finds will appear here after your first capture.
            </Text>
          </View>
        ) : (
          recentFinds.map((item, i) => (
            <Animated.View
              key={item.id}
              entering={FadeInDown.delay(220 + i * 70).springify().damping(15).stiffness(150)}
            >
              <PressableScale
                onPress={() => router.push(`/species/${item.speciesId}` as never)}
                accessibilityLabel={`${item.commonName}, spotted ${formatRelativeDate(item.capturedAt)}`}
                accessibilityRole="button"
                style={[
                  {
                    width: 130,
                    borderRadius: 18,
                    backgroundColor: COLORS.surface,
                    padding: 14,
                    borderWidth: 1,
                    borderColor: COLORS.sand,
                  },
                  softShadow(0.05, 8, 2),
                ]}
              >
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 14,
                    backgroundColor: COLORS.sage,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 10,
                  }}
                >
                  <SpeciesIcon kind={item.kind as SpeciesKind} size={44} color={COLORS.cream} />
                </View>
                <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 14 }}>
                  {item.commonName}
                </Text>
                <Text style={{ color: COLORS.bark, fontSize: 12, marginTop: 2 }}>
                  {formatRelativeDate(item.capturedAt)}
                </Text>
              </PressableScale>
            </Animated.View>
          ))
        )}
      </ScrollView>

      {/* Today's Activity */}
      <Reveal delay={270}>
        <View
          style={{
            marginHorizontal: 20,
            marginTop: 24,
            flexDirection: 'row',
            gap: 10,
          }}
        >
          {[
            { label: "Today's finds", value: todayCount.toString(), icon: 'leaf-outline' as const, color: COLORS.sage },
            { label: 'Kinds spotted', value: uniqueKindsToday.toString(), icon: 'apps-outline' as const, color: COLORS.clay },
            { label: 'Day streak', value: streak.toString(), icon: 'flame-outline' as const, color: COLORS.gold },
          ].map((stat) => (
            <View
              key={stat.label}
              style={[
                {
                  flex: 1,
                  backgroundColor: COLORS.surface,
                  borderRadius: 16,
                  padding: 12,
                  alignItems: 'center',
                  gap: 4,
                  borderWidth: 1,
                  borderColor: COLORS.sand,
                },
                softShadow(0.04, 5, 1),
              ]}
            >
              <Ionicons name={stat.icon} size={20} color={stat.color} />
              <Text style={{ color: COLORS.ink, fontSize: 22, fontWeight: '800' }}>{stat.value}</Text>
              <Text style={{ color: COLORS.bark, fontSize: 10, textAlign: 'center', lineHeight: 13 }}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </Reveal>

      <Reveal delay={290}>
        <View style={{ paddingHorizontal: 24, marginTop: 28, marginBottom: 14 }}>
          <Text style={{ color: COLORS.ink, fontSize: 18, fontWeight: '700' }}>Browse the guide</Text>
        </View>
      </Reveal>

      <View
        style={{
          paddingHorizontal: 20,
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        {CATEGORIES.map((cat, i) => (
          <Animated.View
            key={cat.name}
            entering={FadeInDown.delay(320 + i * 70).springify().damping(15).stiffness(150)}
            style={{ width: '47.5%' }}
          >
            <PressableScale
              onPress={() => router.push(`/(tabs)/guide?category=${cat.name}` as never)}
              scaleTo={0.97}
              accessibilityLabel={`Browse ${cat.name}, ${getCategoryCount(cat.kind)} species`}
              accessibilityRole="button"
              style={[
                {
                  borderRadius: 18,
                  backgroundColor: COLORS.surface,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: COLORS.sand,
                  alignItems: 'center',
                },
                softShadow(0.05, 8, 2),
              ]}
            >
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 16,
                  backgroundColor: COLORS.cream,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 10,
                }}
              >
                <SpeciesIcon kind={cat.kind} size={56} color={COLORS.ink} />
              </View>
              <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 15 }}>{cat.name}</Text>
              <Text style={{ color: COLORS.bark, fontSize: 12, marginTop: 2 }}>
                <Text style={{ color: COLORS.clay, fontWeight: '700' }}>{getCategoryCount(cat.kind)}</Text> species
              </Text>
            </PressableScale>
          </Animated.View>
        ))}
      </View>
    </ScrollView>
  );
}
