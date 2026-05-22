import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { LandscapeHeader } from '@/components/LandscapeHeader';
import { SpeciesIcon, SpeciesKind } from '@/components/SpeciesIcon';
import { COLORS, softShadow } from '@/constants/AppTheme';

const RECENT = [
  { name: 'Saguaro', time: '2h ago', kind: 'cactus' as SpeciesKind },
  { name: 'Mourning Dove', time: 'Yesterday', kind: 'bird' as SpeciesKind },
  { name: 'Tarantula Hawk', time: '3d ago', kind: 'insect' as SpeciesKind },
  { name: 'Sidewinder', time: '5d ago', kind: 'snake' as SpeciesKind },
];

const CATEGORIES = [
  { name: 'Trees', count: 64, kind: 'cactus' as SpeciesKind },
  { name: 'Birds', count: 142, kind: 'bird' as SpeciesKind },
  { name: 'Insects', count: 217, kind: 'insect' as SpeciesKind },
  { name: 'Snakes', count: 31, kind: 'snake' as SpeciesKind },
];

export default function HomeScreen() {
  const { top } = useSafeAreaInsets();
  const router = useRouter();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.background }}
      contentContainerStyle={{ paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
    >
      <LandscapeHeader height={220} />

      <View style={{ height: top + 8 }} />

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
            Tuesday · May 21
          </Text>
          <Text style={{ color: COLORS.ink, fontSize: 28, fontWeight: '400', lineHeight: 34 }}>
            Good afternoon,
          </Text>
          <Text style={{ color: COLORS.ink, fontSize: 28, fontWeight: '700', lineHeight: 34 }}>
            Iris.
          </Text>
        </View>
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
          <Text style={{ color: COLORS.cream, fontSize: 22, fontWeight: '700' }}>I</Text>
        </View>
      </View>

      <Pressable
        onPress={() => router.push('/capture')}
        style={({ pressed }) => [
          {
            marginHorizontal: 20,
            height: 168,
            borderRadius: 24,
            overflow: 'hidden',
            backgroundColor: COLORS.gold,
            transform: [{ scale: pressed ? 0.99 : 1 }],
          },
          softShadow(0.15, 16, 6),
        ]}
      >
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
          />
          <Path
            d="M -20 130 Q 100 100, 220 130 T 380 110 L 380 168 L -20 168 Z"
            fill={COLORS.ink}
            opacity={0.55}
          />
        </Svg>

        <View
          style={{
            position: 'absolute',
            right: 18,
            top: 8,
            opacity: 0.85,
          }}
        >
          <SpeciesIcon kind="cactus" size={140} color={COLORS.ink} />
        </View>

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
      </Pressable>

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
        <Pressable>
          <Text style={{ color: COLORS.clay, fontSize: 13, fontWeight: '600' }}>See all ›</Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
      >
        {RECENT.map((item) => (
          <Pressable
            key={item.name}
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
              <SpeciesIcon kind={item.kind} size={44} color={COLORS.cream} />
            </View>
            <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 14 }}>{item.name}</Text>
            <Text style={{ color: COLORS.bark, fontSize: 12, marginTop: 2 }}>{item.time}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={{ paddingHorizontal: 24, marginTop: 28, marginBottom: 14 }}>
        <Text style={{ color: COLORS.ink, fontSize: 18, fontWeight: '700' }}>Browse the guide</Text>
      </View>

      <View
        style={{
          paddingHorizontal: 20,
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat.name}
            onPress={() => router.push('/(tabs)/guide')}
            style={({ pressed }) => [
              {
                width: '47.5%',
                borderRadius: 18,
                backgroundColor: COLORS.surface,
                padding: 16,
                borderWidth: 1,
                borderColor: COLORS.sand,
                alignItems: 'center',
                transform: [{ scale: pressed ? 0.98 : 1 }],
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
              <Text style={{ color: COLORS.clay, fontWeight: '700' }}>{cat.count}</Text> species
            </Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
