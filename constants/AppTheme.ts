import { DefaultTheme, Theme } from '@react-navigation/native';
import { Platform, TextStyle, ViewStyle } from 'react-native';

export const COLORS = {
  ink: '#3D2519',
  clay: '#B85C3A',
  sand: '#E8D5B7',
  sage: '#9CAB87',
  dusk: '#6B4E6B',
  cream: '#F4ECDA',
};

export const glow = (color: string, radius = 10): ViewStyle => ({
  ...Platform.select({
    ios: {
      shadowColor: color,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.7,
      shadowRadius: radius,
    },
    android: {
      elevation: Math.min(radius, 24),
    },
    default: {},
  }),
});

export const textGlow = (color: string, radius = 8): TextStyle => ({
  textShadowColor: color,
  textShadowOffset: { width: 0, height: 0 },
  textShadowRadius: radius,
});

export const NatureTheme: Theme = {
  dark: false,
  colors: {
    primary: COLORS.clay,
    background: COLORS.cream,
    card: COLORS.sand,
    text: COLORS.ink,
    border: COLORS.sage,
    notification: COLORS.clay,
  },
  fonts: DefaultTheme.fonts,
};
