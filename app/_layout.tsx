import { ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import '../global.css';

import { NatureTheme } from '@/constants/AppTheme';
import { AuthProvider, useAuth } from '@/context/AuthContext';

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const isLoginPage = segments[0] === 'login';
    const isRegisterPage = segments[0] === 'register';
    const isVerifyPage = segments[0] === 'verify-email';
    const isPublicPage = isLoginPage || isRegisterPage;

    if (!user && !isPublicPage) {
      router.replace('/login');
    } else if (user && !user.emailVerified && !isVerifyPage) {
      router.replace('/verify-email');
    } else if (user && user.emailVerified && (isPublicPage || isVerifyPage)) {
      router.replace('/');
    }
  }, [user, loading, segments, router]);

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
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="verify-email" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
