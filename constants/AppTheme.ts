import { DefaultTheme, Theme } from '@react-navigation/native';
import { Platform, TextStyle, ViewStyle } from 'react-native';

export const COLORS = {
  background: '#0F1A0B',
  card: '#1A2E14',
  primary: '#56AB2F',
  secondary: '#A8E063',
  text: '#F0F7EE',
  textDim: '#92B896',
  border: '#2A4225',
  success: '#00C853',
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
  dark: true,
  colors: {
    primary: COLORS.primary,
    background: COLORS.background,
    card: COLORS.card,
    text: COLORS.text,
    border: COLORS.border,
    notification: COLORS.primary,
  },
  fonts: DefaultTheme.fonts,
};
