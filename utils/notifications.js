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

// Programa recordatorios para un hábito.
// Soporta programar en días específicos y devuelve un array con los IDs creados.
export async function scheduleHabitReminder(habit) {
  if (!habit.reminder || !habit.reminder.enabled) return [];

  let hour = 9;
  let minute = 0;

  if (habit.reminder.useCustomTime) {
    hour = habit.reminder.hour ?? 9;
    minute = habit.reminder.minute ?? 0;
  } else if (habit.executionTime && habit.executionTime.enabled) {
    hour = habit.executionTime.startHour;
    minute = habit.executionTime.startMinute;
  } else {
    hour = habit.reminder.hour ?? 9;
    minute = habit.reminder.minute ?? 0;
  }

  const ids = [];

  try {
    if (habit.frequency && habit.frequency.type === 'weekly' && Array.isArray(habit.frequency.days)) {
      // Programar un recordatorio recurrente para cada día de la semana configurado
      // En expo-notifications, weekday: 1 (Domingo) al 7 (Sábado)
      // En nuestra app, day es: 0 (Domingo) al 6 (Sábado)
      for (const day of habit.frequency.days) {
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: `${habit.icon || '✅'} ${habit.name}`,
            body: '¡No te olvides de completar tu hábito hoy!',
            sound: true,
          },
          trigger: {
            weekday: day + 1,
            hour,
            minute,
            repeats: true,
          },
        });
        ids.push(id);
      }
    } else {
      // Programar un recordatorio diario recurrente
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
      ids.push(id);
    }
  } catch (e) {
    console.warn('Error al programar recordatorio:', e);
  }

  return ids;
}

export async function cancelHabitReminder(notificationIdOrIds) {
  if (!notificationIdOrIds) return;
  const ids = Array.isArray(notificationIdOrIds) ? notificationIdOrIds : [notificationIdOrIds];
  for (const id of ids) {
    if (!id) continue;
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch (e) {
      // noop
    }
  }
}



