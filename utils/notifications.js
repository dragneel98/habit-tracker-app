// ============================================================
// notifications.js
// Programación de recordatorios locales con expo-notifications.
// Incluye tolerancia a fallos para desarrollo en Expo Go.
// ============================================================
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

// Detecta si la app se ejecuta dentro del cliente genérico Expo Go
const isExpoGo = Constants.appOwnership === 'expo' || Constants.executionEnvironment === 'storeClient';

try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
} catch (e) {
  console.warn('[Notifications] No se pudo configurar el handler:', e.message);
}

export async function requestNotificationPermission() {
  if (isExpoGo) {
    console.log('[Notifications] Ejecutando en Expo Go: Omitiendo solicitud de permisos nativos.');
    return true;
  }

  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (e) {
    console.warn('[Notifications] Error al solicitar permisos:', e.message);
    return false;
  }
}

// Programa recordatorios para un hábito.
export async function scheduleHabitReminder(habit) {
  if (!habit.reminder || !habit.reminder.enabled) return [];

  if (isExpoGo) {
    console.log(`[Notifications] Expo Go detectado. Mock programado para "${habit.name}" sin bloquear la app.`);
    return ['mock-notification-id-' + Date.now()];
  }

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
    console.warn('[Notifications] Error al programar recordatorio:', e.message);
  }

  return ids;
}

export async function cancelHabitReminder(notificationIdOrIds) {
  if (!notificationIdOrIds) return;
  if (isExpoGo) return;

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



