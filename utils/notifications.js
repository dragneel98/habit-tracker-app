// ============================================================
// notifications.js
// Programación de recordatorios locales con expo-notifications.
// ============================================================
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// Programa un recordatorio diario a la hora indicada (hour, minute).
// Devuelve el id de la notificación para poder cancelarla luego.
export async function scheduleHabitReminder(habit) {
  if (!habit.reminder || !habit.reminder.enabled) return null;

  const { hour, minute } = habit.reminder;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: `${habit.icon || '✅'} ${habit.name}`,
      body: '¡No te olvides de completar tu hábito hoy!',
      sound: true,
    },
    trigger: {
      hour,
      minute,
      repeats: true,
    },
  });

  return id;
}

export async function cancelHabitReminder(notificationId) {
  if (!notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (e) {
    // noop
  }
}
