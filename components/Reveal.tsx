import { ReactNode } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

type Props = {
  children: ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
};

export function Reveal({ children, delay = 0, style }: Props) {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).springify().damping(16).stiffness(140).mass(0.9)}
      style={style}
    >
      {children}
    </Animated.View>
  );
}
