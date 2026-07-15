// ============================================================
// HabitCard.js
// Tarjeta de hábito para la pantalla principal: nombre, icono,
// racha actual y checkbox para marcar el día de hoy.
// ============================================================
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING, RADIUS, SHADOW } from '../constants/theme';
import { calculateStreaks, isScheduledDay } from '../utils/streaks';
import { todayKey, isWithinExecutionWindow } from '../utils/dates';

export default function HabitCard({ habit, onPress, onToggleToday }) {
  const { current } = calculateStreaks(habit);
  const doneToday = !!habit.completions?.[todayKey()];

  const today = new Date();
  const isScheduledToday = isScheduledDay(habit, today);
  const isTimeValid = isWithinExecutionWindow(habit, today);
  const isLocked = !doneToday && (!isScheduledToday || !isTimeValid);

  // Formatear texto de días y horas
  const getDaysString = () => {
    if (!habit.frequency || habit.frequency.type === 'daily') return 'Todos los días';
    const dayLabels = {
      0: 'Dom', 1: 'Lun', 2: 'Mar', 3: 'Mié', 4: 'Jue', 5: 'Vie', 6: 'Sáb'
    };
    return habit.frequency.days.map(d => dayLabels[d]).join(', ');
  };

  const pad = (n) => String(n).padStart(2, '0');
  const timeStr = habit.executionTime?.enabled
    ? ` • 🕒 ${pad(habit.executionTime.startHour)}:${pad(habit.executionTime.startMinute)} - ${pad(habit.executionTime.endHour)}:${pad(habit.executionTime.endMinute)}`
    : '';
  const scheduleText = `${getDaysString()}${timeStr}`;

  // Determinar texto y color de estado
  let statusText = '✨ Disponible hoy';
  let statusColor = COLORS.success;
  
  if (doneToday) {
    statusText = '🎉 ¡Completado hoy!';
    statusColor = COLORS.primary;
  } else if (!isScheduledToday) {
    statusText = '🔒 No programado hoy';
    statusColor = COLORS.textSecondary;
  } else if (!isTimeValid) {
    statusText = '🔒 Fuera de horario';
    statusColor = COLORS.danger;
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.iconWrap, { backgroundColor: habit.color + '22' }]}>
        <Text style={styles.icon}>{habit.icon}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{habit.name}</Text>
        <Text style={styles.streak}>🔥 {current} {current === 1 ? 'día' : 'días'} de racha</Text>
        <Text style={styles.schedule} numberOfLines={1}>{scheduleText}</Text>
        <Text style={[styles.status, { color: statusColor }]}>{statusText}</Text>
      </View>

      <TouchableOpacity
        style={[
          styles.checkbox,
          { borderColor: isLocked ? COLORS.border : habit.color },
          doneToday && { backgroundColor: habit.color },
          isLocked && { backgroundColor: COLORS.background },
        ]}
        onPress={onToggleToday}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        {doneToday && <Text style={styles.check}>✓</Text>}
        {!doneToday && isLocked && <Text style={styles.lock}>🔒</Text>}
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOW.card,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  icon: { fontSize: FONT_SIZES.xl },
  info: { flex: 1 },
  name: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
  },
  streak: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  schedule: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    marginTop: 2,
  },
  status: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
    marginTop: 4,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: { color: COLORS.white, fontWeight: FONT_WEIGHTS.bold },
  lock: { fontSize: 12 },
});

