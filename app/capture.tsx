import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { G, Line, Path, Rect } from 'react-native-svg';

import { SpeciesIcon } from '@/components/SpeciesIcon';
import { COLORS, glow } from '@/constants/AppTheme';

export default function CaptureScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.gold }}>
      <View style={{ position: 'absolute', inset: 0 }}>
        <Svg width="100%" height="100%" viewBox="0 0 393 752" preserveAspectRatio="xMidYMid slice">
          <Rect x={0} y={0} width={393} height={752} fill={COLORS.gold} />
          <Path
            d="M0 520 L 80 480 L 140 510 L 220 470 L 290 500 L 393 475 L 393 752 L 0 752 Z"
            fill={COLORS.dusk}
            opacity={0.4}
          />
          <Path
            d="M0 560 L 100 530 L 180 555 L 260 525 L 350 550 L 393 535 L 393 752 L 0 752 Z"
            fill={COLORS.bark}
            opacity={0.5}
          />
          <Rect x={0} y={600} width={393} height={152} fill={COLORS.clay} opacity={0.7} />
          <G fill={COLORS.ink} opacity={0.85}>
            <Rect x={170} y={300} width={32} height={300} rx={12} />
            <Path d="M170 460 q -34 0 -34 -34 v -28 q 0 -12 12 -12 v 36 q 0 8 8 8 h 14 z" />
            <Path d="M202 420 q 34 0 34 -34 v -36 q 0 -12 -12 -12 v 44 q 0 8 -8 8 h -14 z" />
          </G>
        </Svg>
      </View>

      <View style={{ position: 'absolute', inset: 0 }}>
        <Svg width="100%" height="100%" viewBox="0 0 393 752">
          <G stroke={COLORS.cream} strokeWidth={2.5} fill="none" opacity={0.9}>
            <Line x1={60} y1={top + 150} x2={92} y2={top + 150} />
            <Line x1={60} y1={top + 150} x2={60} y2={top + 182} />
            <Line x1={333} y1={top + 150} x2={301} y2={top + 150} />
            <Line x1={333} y1={top + 150} x2={333} y2={top + 182} />
            <Line x1={60} y1={top + 460} x2={92} y2={top + 460} />
            <Line x1={60} y1={top + 460} x2={60} y2={top + 428} />
            <Line x1={333} y1={top + 460} x2={301} y2={top + 460} />
            <Line x1={333} y1={top + 460} x2={333} y2={top + 428} />
          </G>
        </Svg>
      </View>

      <View
        style={{
          position: 'absolute',
          top: top + 16,
          left: 0,
          right: 0,
          paddingHorizontal: 20,
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
            backgroundColor: 'rgba(10, 10, 24, 0.45)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="close" size={22} color={COLORS.cream} />
        </Pressable>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Pressable
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: 'rgba(10, 10, 24, 0.45)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="flash-outline" size={20} color={COLORS.cream} />
          </Pressable>
          <Pressable
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: 'rgba(10, 10, 24, 0.45)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="sync-outline" size={20} color={COLORS.cream} />
          </Pressable>
        </View>
      </View>

      <View
        style={{
          position: 'absolute',
          top: '36%',
          left: 0,
          right: 0,
          alignItems: 'center',
        }}
      >
        <View
          style={{
            backgroundColor: 'rgba(10, 10, 24, 0.55)',
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 18,
          }}
        >
          <Text
            style={{
              color: COLORS.cream,
              fontSize: 13,
              fontWeight: '500',
              letterSpacing: 0.3,
            }}
          >
            Center the subject — hold steady
          </Text>
        </View>
      </View>

      <View
        style={{
          position: 'absolute',
          left: 20,
          right: 20,
          bottom: bottom + 130,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          backgroundColor: 'rgba(10, 10, 24, 0.7)',
          borderRadius: 18,
          padding: 14,
          borderWidth: 1,
          borderColor: 'rgba(244, 236, 218, 0.18)',
        }}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: COLORS.gold,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="sparkles" size={18} color={COLORS.ink} />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: COLORS.cream,
              fontWeight: '700',
              fontSize: 15,
              marginBottom: 2,
            }}
          >
            Looks like a Saguaro
          </Text>
          <Text style={{ color: 'rgba(244, 236, 218, 0.7)', fontSize: 12, lineHeight: 16 }}>
            Tap the shutter to confirm — or move closer for a sharper ID.
          </Text>
        </View>
      </View>

      <View
        style={{
          position: 'absolute',
          bottom: bottom + 28,
          left: 0,
          right: 0,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 36,
        }}
      >
        <Pressable
          style={{
            width: 50,
            height: 50,
            borderRadius: 14,
            backgroundColor: 'rgba(10, 10, 24, 0.45)',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <SpeciesIcon kind="bird" size={28} color={COLORS.cream} />
        </Pressable>

        <Pressable
          onPress={() => router.replace('/result')}
          style={({ pressed }) => [
            {
              width: 78,
              height: 78,
              borderRadius: 39,
              borderWidth: 5,
              borderColor: COLORS.cream,
              backgroundColor: 'rgba(244, 236, 218, 0.2)',
              alignItems: 'center',
              justifyContent: 'center',
              transform: [{ scale: pressed ? 0.94 : 1 }],
            },
            glow(COLORS.cream, 12),
          ]}
        >
          <View
            style={{
              width: 58,
              height: 58,
              borderRadius: 29,
              backgroundColor: COLORS.cream,
            }}
          />
        </Pressable>

        <Pressable
          style={{
            width: 50,
            height: 50,
            borderRadius: 14,
            backgroundColor: 'rgba(10, 10, 24, 0.45)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="arrow-up" size={22} color={COLORS.cream} />
        </Pressable>
      </View>
    </View>
  );
}
