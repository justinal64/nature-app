import { DefaultTheme, Theme } from '@react-navigation/native';
import { Platform, TextStyle, ViewStyle } from 'react-native';

export const COLORS = {
  ink: '#3D2519',
  clay: '#B85C3A',
  sand: '#E8D5B7',
  sage: '#9CAB87',
  dusk: '#6B4E6B',
  cream: '#F4ECDA',
  bark: '#8B6F47',
  gold: '#D4A437',
  night: '#0A0A18',
  // Semantic aliases
  background: '#F4ECDA',
  surface: '#FFFFFF',
  text: '#3D2519',
  textDim: '#8B6F47',
  primary: '#B85C3A',
  secondary: '#9CAB87',
  border: '#E8D5B7',
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

export const softShadow = (opacity = 0.08, radius = 12, offsetY = 4): ViewStyle => ({
  ...Platform.select({
    ios: {
      shadowColor: COLORS.ink,
      shadowOffset: { width: 0, height: offsetY },
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
    android: {
      elevation: Math.min(radius, 12),
    },
    default: {},
  }),
});

export const NatureTheme: Theme = {
  dark: false,
  colors: {
    primary: COLORS.clay,
    background: COLORS.cream,
    card: COLORS.surface,
    text: COLORS.ink,
    border: COLORS.sand,
    notification: COLORS.clay,
  },
  fonts: DefaultTheme.fonts,
};
