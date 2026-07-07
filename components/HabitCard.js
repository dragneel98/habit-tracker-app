// ============================================================
// HabitCard.js
// Tarjeta de hábito para la pantalla principal: nombre, icono,
// racha actual y checkbox para marcar el día de hoy.
// ============================================================
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING, RADIUS, SHADOW } from '../constants/theme';
import { calculateStreaks } from '../utils/streaks';
import { todayKey } from '../utils/dates';

export default function HabitCard({ habit, onPress, onToggleToday }) {
  const { current } = calculateStreaks(habit);
  const doneToday = !!habit.completions?.[todayKey()];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.iconWrap, { backgroundColor: habit.color + '22' }]}>
        <Text style={styles.icon}>{habit.icon}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{habit.name}</Text>
        <Text style={styles.streak}>🔥 {current} {current === 1 ? 'día' : 'días'} de racha</Text>
      </View>

      <TouchableOpacity
        style={[
          styles.checkbox,
          { borderColor: habit.color },
          doneToday && { backgroundColor: habit.color },
        ]}
        onPress={onToggleToday}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        {doneToday && <Text style={styles.check}>✓</Text>}
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
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: { color: COLORS.white, fontWeight: FONT_WEIGHTS.bold },
});
