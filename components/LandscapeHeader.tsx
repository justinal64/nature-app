import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { COLORS, glow } from '@/constants/AppTheme';

type Props = {
  height?: number;
};

// 0 → 1 → 0 loop, eased like a slow breath
function useDrift(duration: number) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [t, duration]);
  return t;
}

function Bird({ size = 22, opacity = 0.45 }: { size?: number; opacity?: number }) {
  return (
    <Svg width={size} height={size * 0.55} viewBox="0 0 24 13" opacity={opacity}>
      <Path
        d="M2 10 Q 7 2 12 9 Q 17 2 22 10"
        stroke={COLORS.bark}
        strokeWidth={2.2}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

export function LandscapeHeader({ height = 200 }: Props) {
  const back = useDrift(13000);
  const front = useDrift(9000);
  const sun = useDrift(4200);
  const flight = useDrift(16000);

  const backWaveStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(back.value, [0, 1], [-14, 14]) }],
  }));
  const frontWaveStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(front.value, [0, 1], [16, -16]) }],
  }));
  const sunStyle = useAnimatedStyle(() => ({
    opacity: interpolate(sun.value, [0, 1], [0.8, 1]),
    transform: [{ scale: interpolate(sun.value, [0, 1], [1, 1.07]) }],
  }));
  const flightStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(flight.value, [0, 1], [-34, 44]) },
      { translateY: interpolate(flight.value, [0, 0.25, 0.5, 0.75, 1], [0, -7, 2, -5, 0]) },
    ],
  }));

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 16,
            right: 40,
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: COLORS.gold,
          },
          glow(COLORS.gold, 18),
          sunStyle,
        ]}
      />

      <Animated.View style={[{ position: 'absolute', top: 52, left: '26%' }, flightStyle]}>
        <Bird />
        <View style={{ marginLeft: 26, marginTop: -4, transform: [{ scale: 0.65 }] }}>
          <Bird opacity={0.3} />
        </View>
      </Animated.View>

      <Animated.View
        style={[{ position: 'absolute', top: 0, bottom: 0, left: '-8%', width: '116%' }, backWaveStyle]}
      >
        <Svg width="100%" height="100%" viewBox="0 0 393 200" preserveAspectRatio="none">
          <Path d="M0 80 Q 100 50, 200 90 T 393 70 L 393 200 L 0 200 Z" fill={COLORS.clay} opacity={0.16} />
        </Svg>
      </Animated.View>

      <Animated.View
        style={[{ position: 'absolute', top: 0, bottom: 0, left: '-8%', width: '116%' }, frontWaveStyle]}
      >
        <Svg width="100%" height="100%" viewBox="0 0 393 200" preserveAspectRatio="none">
          <Path d="M0 130 Q 130 100, 260 130 T 393 120 L 393 200 L 0 200 Z" fill={COLORS.bark} opacity={0.12} />
        </Svg>
      </Animated.View>
    </View>
  );
}

export function DesertLandscape({ height = 320 }: { height?: number }) {
  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height,
        overflow: 'hidden',
        backgroundColor: COLORS.gold,
        pointerEvents: 'none',
      }}
    >
      <Svg width="100%" height="100%" viewBox="0 0 393 320" preserveAspectRatio="none">
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
        <Path d="M0 280 L 393 280 L 393 320 L 0 320 Z" fill={COLORS.clay} opacity={0.7} />
        <Path
          d="M160 120 h28 v180 h-28 z M160 200 q -28 0 -28 -28 v -20 q 0 -10 10 -10 v 28 q 0 6 6 6 h 12 z M188 180 q 28 0 28 -28 v -28 q 0 -10 -10 -10 v 36 q 0 6 -6 6 h -12 z"
          fill={COLORS.ink}
          opacity={0.85}
        />
      </Svg>
    </View>
  );
}
