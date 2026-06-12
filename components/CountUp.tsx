import { useEffect, useState } from 'react';
import { StyleProp, Text, TextStyle } from 'react-native';

type Props = {
  value: number;
  suffix?: string;
  duration?: number;
  delay?: number;
  style?: StyleProp<TextStyle>;
};

export function CountUp({ value, suffix = '', duration = 900, delay = 0, style }: Props) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let raf = 0;
    let start: number | null = null;
    const tick = (now: number) => {
      if (start === null) start = now;
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    const timer = setTimeout(() => {
      raf = requestAnimationFrame(tick);
    }, delay);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [value, duration, delay]);

  return (
    <Text style={style}>
      {display}
      {suffix}
    </Text>
  );
}
