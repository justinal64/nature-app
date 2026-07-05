import { DefaultTheme, Theme } from '@react-navigation/native';
import { Platform, TextStyle, ViewStyle } from 'react-native';

export const COLORS = {
  ink: '#2A3036',
  granite: '#5D6B6F',
  slate: '#3F4A50',
  lichen: '#8FA38C',
  bone: '#EFEAE0',
  // Semantic aliases
  background: '#EFEAE0',
  surface: '#FFFFFF',
  text: '#2A3036',
  textDim: '#5D6B6F',
  primary: '#8FA38C',
  secondary: '#8FA38C',
  border: '#5D6B6F',
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
    primary: COLORS.lichen,
    background: COLORS.bone,
    card: COLORS.surface,
    text: COLORS.ink,
    border: COLORS.granite,
    notification: COLORS.lichen,
  },
  fonts: DefaultTheme.fonts,
};
