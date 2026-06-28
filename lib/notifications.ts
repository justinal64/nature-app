import * as Notifications from 'expo-notifications';

import { CATALOG } from '@/constants/catalog';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const STREAK_REMINDER_ID = 'streak-reminder';
// Fire at 7 PM every day
const REMINDER_HOUR = 19;

export async function requestNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleStreakReminder(): Promise<void> {
  // Cancel any existing reminder before rescheduling
  await Notifications.cancelScheduledNotificationAsync(STREAK_REMINDER_ID).catch(() => {});

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') return;

  await Notifications.scheduleNotificationAsync({
    identifier: STREAK_REMINDER_ID,
    content: {
      title: "Don't break your streak 🌵",
      body: "You haven't logged a sighting today. Head outside before midnight!",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: REMINDER_HOUR,
      minute: 0,
    },
  });
}

export async function cancelStreakReminder(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(STREAK_REMINDER_ID).catch(() => {});
}

const SOTD_ID = 'species-of-the-day';
// Fire at 8 AM every day
const SOTD_HOUR = 8;

export function pickDailySpecies(): { commonName: string; description: string; id: string } {
  // Use the day of year as a stable seed so everyone gets the same species each day
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86_400_000);
  const sp = CATALOG[dayOfYear % CATALOG.length];
  return { commonName: sp.commonName, description: sp.description.slice(0, 100) + '…', id: sp.id };
}

export async function scheduleSpeciesOfTheDay(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(SOTD_ID).catch(() => {});

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') return;

  const { commonName, description, id } = pickDailySpecies();

  await Notifications.scheduleNotificationAsync({
    identifier: SOTD_ID,
    content: {
      title: `Species of the day: ${commonName}`,
      body: description,
      data: { speciesId: id },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: SOTD_HOUR,
      minute: 0,
    },
  });
}
