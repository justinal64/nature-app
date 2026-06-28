import { ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import 'react-native-url-polyfill/auto';
import '../global.css';

import { NatureTheme } from '@/constants/AppTheme';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { scheduleStreakReminder } from '@/lib/notifications';
import { updateStreak } from '@/lib/streak';

function RootLayoutNav() {
  const { user, loading, emailVerified } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (user?.emailVerified) {
      updateStreak(user.uid).catch(() => {});
      scheduleStreakReminder().catch(() => {});
    }
  }, [user?.uid, user?.emailVerified]);

  useEffect(() => {
    if (loading) return;

    const root = segments[0];
    const isLoginPage = root === 'login';
    const isRegisterPage = root === 'register';
    const isVerifyPage = root === 'verify-email';
    const isForgotPasswordPage = root === 'forgot-password';
    const isPrivacyPolicyPage = root === 'privacy-policy';
    const isPublicPage = isLoginPage || isRegisterPage || isForgotPasswordPage || isPrivacyPolicyPage;

    if (!user && !isPublicPage) {
      router.replace('/login');
    } else if (user && !emailVerified && !isVerifyPage) {
      router.replace('/verify-email');
    } else if (user && emailVerified && (isPublicPage || isVerifyPage)) {
      router.replace('/');
    }
  }, [user, loading, emailVerified, segments, router]);

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
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="verify-email" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen
          name="capture"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen name="result" options={{ animation: 'fade' }} />
        <Stack.Screen name="species/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="privacy-policy" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="sightings-map" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="sound-id" options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
      </Stack>
      <StatusBar style="dark" />
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
