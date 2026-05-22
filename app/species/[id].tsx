import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { G, Path, Rect } from 'react-native-svg';

import { COLORS, glow, softShadow } from '@/constants/AppTheme';

const TABS = ['Overview', 'ID Tips', 'Your sightings'] as const;
type TabName = (typeof TABS)[number];

const STATS: { label: string; value: string }[] = [
  { label: 'Habitat', value: 'Sonoran' },
  { label: 'Height', value: '12–18 m' },
  { label: 'Lifespan', value: '150 yr+' },
  { label: 'Status', value: 'Stable' },
];

export default function SpeciesDetailScreen() {
  useLocalSearchParams<{ id: string }>();
  const { top } = useSafeAreaInsets();
  const router = useRouter();
  const [tab, setTab] = useState<TabName>('Overview');
  const [liked, setLiked] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 36 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ height: 360, backgroundColor: COLORS.gold, overflow: 'hidden' }}>
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
            <Pressable
              onPress={() => router.back()}
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
            </Pressable>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable
                onPress={() => setLiked((v) => !v)}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 21,
                  backgroundColor: 'rgba(10, 10, 24, 0.4)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons
                  name={liked ? 'heart' : 'heart-outline'}
                  size={20}
                  color={liked ? COLORS.clay : COLORS.cream}
                />
              </Pressable>
              <Pressable
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
              </Pressable>
            </View>
          </View>

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
            <Text style={{ color: COLORS.cream, fontSize: 11, fontWeight: '600' }}>1 / 6</Text>
          </View>
        </View>

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
            Cacti · Cactaceae
          </Text>
          <Text
            style={{ color: COLORS.ink, fontSize: 32, fontWeight: '700', marginTop: 4 }}
          >
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
        </View>

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

        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            paddingHorizontal: 16,
            marginTop: 20,
            gap: 10,
          }}
        >
          {STATS.map((s) => (
            <View
              key={s.label}
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
              <Text style={{ color: COLORS.bark, fontSize: 11, fontWeight: '600' }}>
                {s.label}
              </Text>
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
            </View>
          ))}
        </View>

        <View style={{ paddingHorizontal: 24, marginTop: 22 }}>
          <Text style={{ color: COLORS.ink, fontSize: 15, lineHeight: 23 }}>
            The towering icon of the Sonoran Desert. Saguaros can take 70 years to grow their first
            arm and live for two centuries — pleated trunks swell to hold rainwater after monsoon
            storms.
          </Text>
        </View>

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
              A flowering Saguaro can hold up to 80 lbs of water in a single arm.
            </Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}
