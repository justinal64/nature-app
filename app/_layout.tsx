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
          headerStyle: { backgroundColor: NatureTheme.colors.card },
          headerTintColor: NatureTheme.colors.text,
          headerTitleStyle: { fontWeight: 'bold', color: NatureTheme.colors.primary },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
