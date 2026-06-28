import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import 'react-native-reanimated';
import 'react-native-url-polyfill/auto';
import '../global.css';

import { NatureTheme } from '@/constants/AppTheme';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ONBOARDING_KEY } from './onboarding';
import { scheduleSpeciesOfTheDay, scheduleStreakReminder } from '@/lib/notifications';
import { updateStreak } from '@/lib/streak';

function RootLayoutNav() {
  const { user, loading, emailVerified } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const onboardingChecked = useRef(false);

  useEffect(() => {
    if (user?.emailVerified) {
      updateStreak(user.uid).catch(() => {});
      scheduleStreakReminder().catch(() => {});
      scheduleSpeciesOfTheDay().catch(() => {});
    }
  }, [user?.uid, user?.emailVerified]);

  // Navigate to species detail when user taps a Species of the Day notification
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const id = response.notification.request.identifier;
      if (id === 'species-of-the-day') {
        const speciesId = response.notification.request.content.data?.speciesId as string | undefined;
        if (speciesId) {
          router.push(`/species/${speciesId}` as never);
        }
      }
    });
    return () => sub.remove();
  }, [router]);

  useEffect(() => {
    if (loading) return;

    const root = segments[0];
    const isLoginPage = root === 'login';
    const isRegisterPage = root === 'register';
    const isVerifyPage = root === 'verify-email';
    const isForgotPasswordPage = root === 'forgot-password';
    const isPrivacyPolicyPage = root === 'privacy-policy';
    const isOnboardingPage = root === 'onboarding';
    const isPublicPage = isLoginPage || isRegisterPage || isForgotPasswordPage || isPrivacyPolicyPage;

    if (!user && !isPublicPage) {
      router.replace('/login');
    } else if (user && !emailVerified && !isVerifyPage) {
      router.replace('/verify-email');
    } else if (user && emailVerified && (isPublicPage || isVerifyPage)) {
      // Show onboarding once, then go home
      if (!onboardingChecked.current && !isOnboardingPage) {
        onboardingChecked.current = true;
        AsyncStorage.getItem(ONBOARDING_KEY).then((done) => {
          if (!done) {
            router.replace('/onboarding');
          } else {
            router.replace('/');
          }
        });
      } else if (!isOnboardingPage) {
        router.replace('/');
      }
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
        <Stack.Screen name="field-cam" options={{ animation: 'fade', presentation: 'fullScreenModal' }} />
        <Stack.Screen name="ask" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="onboarding" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="search" options={{ animation: 'fade', presentation: 'modal' }} />
        <Stack.Screen name="favorites" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="compare" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="journal-stats" options={{ animation: 'slide_from_right' }} />
      </Stack>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </ErrorBoundary>
  );
}
