import * as Notifications from 'expo-notifications';

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
