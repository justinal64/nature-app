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
      entering={FadeInDown.delay(delay).duration(300)}
      style={style}
    >
      {children}
    </Animated.View>
  );
}
