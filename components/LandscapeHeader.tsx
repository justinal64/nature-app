import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { COLORS } from '@/constants/AppTheme';

type Props = {
  height?: number;
};

export function LandscapeHeader({ height = 200 }: Props) {
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height,
        overflow: 'hidden',
      }}
    >
      <Svg width="100%" height="100%" viewBox="0 0 393 200" preserveAspectRatio="none">
        <Path
          d="M0 80 Q 100 50, 200 90 T 393 70 L 393 200 L 0 200 Z"
          fill={COLORS.clay}
          opacity={0.16}
        />
        <Path
          d="M0 130 Q 130 100, 260 130 T 393 120 L 393 200 L 0 200 Z"
          fill={COLORS.bark}
          opacity={0.12}
        />
      </Svg>
    </View>
  );
}

export function DesertLandscape({ height = 320 }: { height?: number }) {
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height,
        overflow: 'hidden',
        backgroundColor: COLORS.gold,
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
