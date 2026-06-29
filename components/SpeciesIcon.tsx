import Svg, { Circle, Ellipse, Path } from 'react-native-svg';

import { COLORS } from '@/constants/AppTheme';

export type SpeciesKind = 'cactus' | 'bird' | 'insect' | 'snake' | 'mammal' | 'lizard';

type Props = {
  kind: SpeciesKind;
  size?: number;
  color?: string;
};

export function SpeciesIcon({ kind, size = 50, color = COLORS.cream }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      {kind === 'cactus' && (
        <Path
          d="M40 8c-9 12-11 22-7 32h-3l-2 10h4v18h16V50h4l-2-10h-3c4-10 2-20-7-32z"
          fill={color}
        />
      )}
      {kind === 'bird' && (
        <Path
          d="M52 18c-6 0-12 4-14 10-8-2-18 2-22 12 8 2 14 0 18-4-2 8-12 14-20 14 14 6 30 4 38-8 4-6 6-14 4-22 4 0 6-2 8-4-4 0-8 0-12 2z"
          fill={color}
        />
      )}
      {kind === 'insect' && (
        <>
          <Ellipse cx={40} cy={40} rx={9} ry={22} fill={color} />
          <Circle cx={40} cy={20} r={6} fill={color} />
          <Path
            d="M40 25c-14-2-26 6-26 16M40 25c14-2 26 6 26 16M40 40c-16 4-26 14-24 22M40 40c16 4 26 14 24 22M40 32l-4-10M40 32l4-10"
            stroke={color}
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
          />
        </>
      )}
      {kind === 'snake' && (
        <>
          <Path
            d="M10 50 C 14 30, 30 30, 34 50 C 38 70, 54 70, 58 50 C 60 38, 68 38, 70 46"
            stroke={color}
            strokeWidth={9}
            fill="none"
            strokeLinecap="round"
          />
          <Circle cx={68} cy={44} r={2} fill={COLORS.ink} />
        </>
      )}
      {kind === 'mammal' && (
        <>
          {/* Paw print: main pad + three toe pads */}
          <Ellipse cx={40} cy={54} rx={20} ry={15} fill={color} />
          <Circle cx={20} cy={32} r={8} fill={color} />
          <Circle cx={40} cy={24} r={8} fill={color} />
          <Circle cx={58} cy={30} r={8} fill={color} />
        </>
      )}
      {kind === 'lizard' && (
        <>
          {/* Body */}
          <Ellipse cx={38} cy={42} rx={16} ry={10} fill={color} />
          {/* Head */}
          <Ellipse cx={57} cy={37} rx={11} ry={8} fill={color} />
          {/* Snout */}
          <Path d="M66 34 L74 34 L70 40 Z" fill={color} />
          {/* Tail curves left */}
          <Path d="M22 46 C14 52 10 56 8 62" stroke={color} strokeWidth={7} fill="none" strokeLinecap="round" />
          {/* Legs */}
          <Path d="M46 50 L42 62 M30 50 L34 62 M46 34 L42 22 M30 34 L34 22" stroke={color} strokeWidth={4} fill="none" strokeLinecap="round" />
        </>
      )}
    </Svg>
  );
}
