// ============================================================
// dates.js
// Helpers de fechas en formato 'YYYY-MM-DD' (clave usada para
// marcar completions y evitar problemas de timezone/Date object).
// ============================================================

export function todayKey() {
  return toKey(new Date());
}

export function toKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(date, amount) {
  const d = new Date(date);
  d.setDate(d.getDate() + amount);
  return d;
}

export function isSameDay(a, b) {
  return toKey(a) === toKey(b);
}

// Devuelve un array de las celdas del mes (con padding) para armar el calendario
export function getMonthMatrix(year, month) {
  // month: 0-11
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay(); // 0 = domingo
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
