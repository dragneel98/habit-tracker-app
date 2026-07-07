// ============================================================
// streaks.js
// Cálculo de rachas (streak actual y mejor racha) y estadísticas
// básicas a partir del objeto `completions` de un hábito:
// completions = { '2026-07-06': true, '2026-07-05': true, ... }
// ============================================================
import { toKey, addDays } from './dates';

// Determina si una fecha dada corresponde a un día "activo" según
// la frecuencia del hábito (diario o días específicos de la semana).
export function isScheduledDay(habit, date) {
  if (!habit.frequency || habit.frequency.type === 'daily') return true;
  if (habit.frequency.type === 'weekly') {
    return habit.frequency.days.includes(date.getDay());
  }
  return true;
}

export function calculateStreaks(habit) {
  const completions = habit.completions || {};
  let current = 0;
  let best = 0;
  let running = 0;

  // Recorremos hacia atrás desde hoy para la racha actual
  let cursor = new Date();
  // Si hoy todavía no se completó pero es día programado, no rompe la racha
  // (se evalúa a partir de ayer en ese caso)
  const todayScheduled = isScheduledDay(habit, cursor);
  const todayDone = !!completions[toKey(cursor)];
  if (todayScheduled && !todayDone) {
    cursor = addDays(cursor, -1);
  }

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (isScheduledDay(habit, cursor)) {
      const key = toKey(cursor);
      if (completions[key]) {
        current++;
      } else {
        break;
      }
    }
    cursor = addDays(cursor, -1);
    // límite de seguridad: no ir más allá de 2 años atrás
    if (new Date() - cursor > 1000 * 60 * 60 * 24 * 730) break;
  }

  // Mejor racha histórica: recorremos todas las fechas completadas ordenadas
  const doneDates = Object.keys(completions)
    .filter((k) => completions[k])
    .sort();

  let prevDate = null;
  doneDates.forEach((key) => {
    const d = new Date(key + 'T00:00:00');
    if (prevDate && isConsecutiveScheduled(habit, prevDate, d)) {
      running++;
    } else {
      running = 1;
    }
    best = Math.max(best, running);
    prevDate = d;
  });

  return { current, best: Math.max(best, current) };
}

function isConsecutiveScheduled(habit, prevDate, date) {
  // Avanza desde prevDate+1 hasta date y verifica que todos los días
  // programados intermedios (si los hay) coincidan con `date` inmediato
  let cursor = addDays(prevDate, 1);
  while (cursor < date) {
    if (isScheduledDay(habit, cursor)) return false; // había un día programado sin completar
    cursor = addDays(cursor, 1);
  }
  return toKey(cursor) === toKey(date);
}

export function completionRate(habit, days = 30) {
  const completions = habit.completions || {};
  let scheduled = 0;
  let done = 0;
  let cursor = new Date();
  for (let i = 0; i < days; i++) {
    if (isScheduledDay(habit, cursor)) {
      scheduled++;
      if (completions[toKey(cursor)]) done++;
    }
    cursor = addDays(cursor, -1);
  }
  if (scheduled === 0) return 0;
  return Math.round((done / scheduled) * 100);
}
