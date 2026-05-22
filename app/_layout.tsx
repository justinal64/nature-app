import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css';

import { NatureTheme } from '@/constants/AppTheme';

export default function RootLayout() {
  return (
    <ThemeProvider value={NatureTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: NatureTheme.colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="capture"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen name="result" options={{ animation: 'fade' }} />
        <Stack.Screen name="species/[id]" options={{ animation: 'slide_from_right' }} />
      </Stack>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}
