import { ReactNode, useEffect } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

type Props = {
  children: ReactNode;
  amplitude?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
};

export function Floating({ children, amplitude = 5, duration = 3200, style }: Props) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [t, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(t.value, [0, 1], [-amplitude, amplitude]) }],
  }));

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}
