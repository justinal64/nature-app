import Svg, { Path, Rect, Text as SvgText } from 'react-native-svg';

import { COLORS } from '@/constants/AppTheme';

// Approximate polygons for the four North American desert regions.
// Projection: viewBox 280×230, covering lng –120→–102 (18°) and lat 24→44 (20°).
//   x = (lng + 120) × 280/18   y = (44 − lat) × 230/20
const DESERTS: { key: string; label: string; d: string }[] = [
  {
    key: 'GREAT_BASIN',
    label: 'Great Basin',
    // NV, UT, parts of OR/ID — top third of map
    d: 'M0,0 L124,0 L124,84 L78,84 L0,48 Z',
  },
  {
    key: 'MOJAVE',
    label: 'Mojave',
    // Southern CA, S Nevada, NW Arizona — upper-left of mid section
    d: 'M31,84 L78,84 L78,108 L62,132 L31,120 Z',
  },
  {
    key: 'SONORAN',
    label: 'Sonoran',
    // Arizona + NW Mexico — centre-left of map
    d: 'M78,84 L140,108 L171,144 L171,216 L140,230 L78,216 L62,132 L78,108 Z',
  },
  {
    key: 'CHIHUAHUAN',
    label: 'Chihuahuan',
    // New Mexico, W Texas, N Mexico — right side
    d: 'M171,120 L264,120 L264,230 L202,216 L171,216 L171,144 Z',
  },
];

type Props = {
  region: string; // one of the DESERT keys, or empty string for "unknown"
};

export function DesertRangeMap({ region }: Props) {
  return (
    <Svg width="100%" viewBox="0 0 280 230" style={{ aspectRatio: 280 / 230 }}>
      {/* Ocean / background */}
      <Rect x={0} y={0} width={280} height={230} rx={0} fill={COLORS.cream} />

      {DESERTS.map((d) => {
        const active = d.key === region;
        return (
          <Path
            key={d.key}
            d={d.d}
            fill={active ? COLORS.clay : COLORS.sand}
            stroke={COLORS.background}
            strokeWidth={2}
            opacity={active ? 1 : 0.55}
          />
        );
      })}

      {/* Region labels */}
      <SvgText x={40} y={44} fill={COLORS.bark} fontSize={9} fontWeight="600" textAnchor="middle">Great</SvgText>
      <SvgText x={40} y={55} fill={COLORS.bark} fontSize={9} fontWeight="600" textAnchor="middle">Basin</SvgText>
      <SvgText x={52} y={115} fill={COLORS.bark} fontSize={8} fontWeight="600" textAnchor="middle">Mojave</SvgText>
      <SvgText x={112} y={168} fill={region === 'SONORAN' ? COLORS.cream : COLORS.bark} fontSize={9} fontWeight="600" textAnchor="middle">Sonoran</SvgText>
      <SvgText x={218} y={180} fill={region === 'CHIHUAHUAN' ? COLORS.cream : COLORS.bark} fontSize={8} fontWeight="600" textAnchor="middle">Chihuahuan</SvgText>
    </Svg>
  );
}
