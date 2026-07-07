// ============================================================
// CreateHabitScreen.js
// Formulario para crear (o editar) un hábito: nombre, icono,
// color, frecuencia (diario / días específicos) y recordatorio.
// ============================================================
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING, RADIUS, HABIT_ICONS, WEEK_DAYS,
} from '../constants/theme';
import { useHabits } from '../context/HabitContext';
import { requestNotificationPermission } from '../utils/notifications';

export default function CreateHabitScreen({ navigation, route }) {
  const { addHabit, updateHabit, deleteHabit } = useHabits();
  const editingHabit = route.params?.habit;

  const [name, setName] = useState(editingHabit?.name || '');
  const [icon, setIcon] = useState(editingHabit?.icon || HABIT_ICONS[0]);
  const [color, setColor] = useState(editingHabit?.color || COLORS.habitPalette[0]);
  const [freqType, setFreqType] = useState(editingHabit?.frequency?.type || 'daily');
  const [days, setDays] = useState(editingHabit?.frequency?.days || [1, 2, 3, 4, 5]);
  const [reminderEnabled, setReminderEnabled] = useState(editingHabit?.reminder?.enabled || false);
  const [reminderTime, setReminderTime] = useState(() => {
    const d = new Date();
    if (editingHabit?.reminder) {
      d.setHours(editingHabit.reminder.hour, editingHabit.reminder.minute, 0, 0);
    } else {
      d.setHours(9, 0, 0, 0);
    }
    return d;
  });
  const [showTimePicker, setShowTimePicker] = useState(false);

  const toggleDay = (dayKey) => {
    setDays((prev) => (prev.includes(dayKey) ? prev.filter((d) => d !== dayKey) : [...prev, dayKey]));
  };

  const handleReminderToggle = async () => {
    if (!reminderEnabled) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        Alert.alert('Permiso necesario', 'Activá las notificaciones para recibir recordatorios.');
        return;
      }
    }
    setReminderEnabled((prev) => !prev);
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Falta el nombre', 'Ponele un nombre a tu hábito.');
      return;
    }

    const habitData = {
      name: name.trim(),
      icon,
      color,
      frequency: freqType === 'daily' ? { type: 'daily' } : { type: 'weekly', days },
      reminder: {
        enabled: reminderEnabled,
        hour: reminderTime.getHours(),
        minute: reminderTime.getMinutes(),
      },
    };

    if (editingHabit) {
      updateHabit({ ...editingHabit, ...habitData });
    } else {
      addHabit(habitData);
    }
    navigation.goBack();
  };

  const handleDelete = () => {
    Alert.alert('Eliminar hábito', '¿Seguro que querés eliminar este hábito y todo su historial?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          deleteHabit(editingHabit.id);
          navigation.popToTop();
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: SPACING.md }}>
      <Text style={styles.label}>Nombre del hábito</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Tomar agua"
        placeholderTextColor={COLORS.textLight}
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Icono</Text>
      <View style={styles.wrapRow}>
        {HABIT_ICONS.map((ic) => (
          <TouchableOpacity
            key={ic}
            style={[styles.iconOption, icon === ic && styles.iconOptionSelected]}
            onPress={() => setIcon(ic)}
          >
            <Text style={styles.iconOptionText}>{ic}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Color</Text>
      <View style={styles.wrapRow}>
        {COLORS.habitPalette.map((c) => (
          <TouchableOpacity
            key={c}
            style={[styles.colorDot, { backgroundColor: c }, color === c && styles.colorDotSelected]}
            onPress={() => setColor(c)}
          />
        ))}
      </View>

      <Text style={styles.label}>Frecuencia</Text>
      <View style={styles.segment}>
        <TouchableOpacity
          style={[styles.segmentBtn, freqType === 'daily' && styles.segmentBtnActive]}
          onPress={() => setFreqType('daily')}
        >
          <Text style={[styles.segmentText, freqType === 'daily' && styles.segmentTextActive]}>Todos los días</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentBtn, freqType === 'weekly' && styles.segmentBtnActive]}
          onPress={() => setFreqType('weekly')}
        >
          <Text style={[styles.segmentText, freqType === 'weekly' && styles.segmentTextActive]}>Días específicos</Text>
        </TouchableOpacity>
      </View>

      {freqType === 'weekly' && (
        <View style={styles.wrapRow}>
          {WEEK_DAYS.map((d) => (
            <TouchableOpacity
              key={d.key}
              style={[styles.dayOption, days.includes(d.key) && { backgroundColor: color }]}
              onPress={() => toggleDay(d.key)}
            >
              <Text style={[styles.dayOptionText, days.includes(d.key) && { color: COLORS.white }]}>{d.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.reminderRow}>
        <Text style={styles.label}>Recordatorio diario</Text>
        <TouchableOpacity
          style={[styles.toggle, reminderEnabled && { backgroundColor: color }]}
          onPress={handleReminderToggle}
        >
          <View style={[styles.toggleKnob, reminderEnabled && styles.toggleKnobActive]} />
        </TouchableOpacity>
      </View>

      {reminderEnabled && (
        <TouchableOpacity style={styles.timeBox} onPress={() => setShowTimePicker(true)}>
          <Text style={styles.timeText}>
            🔔 {reminderTime.getHours().toString().padStart(2, '0')}:{reminderTime.getMinutes().toString().padStart(2, '0')}
          </Text>
        </TouchableOpacity>
      )}

      {showTimePicker && (
        <DateTimePicker
          value={reminderTime}
          mode="time"
          is24Hour
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selected) => {
            setShowTimePicker(Platform.OS === 'ios');
            if (selected) setReminderTime(selected);
          }}
        />
      )}

      <TouchableOpacity style={[styles.saveBtn, { backgroundColor: color }]} onPress={handleSave}>
        <Text style={styles.saveBtnText}>{editingHabit ? 'Guardar cambios' : 'Crear hábito'}</Text>
      </TouchableOpacity>

      {editingHabit && (
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Text style={styles.deleteBtnText}>Eliminar hábito</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  iconOption: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconOptionSelected: { borderColor: COLORS.primary, borderWidth: 2, backgroundColor: COLORS.surfaceAlt },
  iconOptionText: { fontSize: FONT_SIZES.xl },
  colorDot: { width: 36, height: 36, borderRadius: RADIUS.full },
  colorDotSelected: { borderWidth: 3, borderColor: COLORS.text },
  segment: { flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: 4 },
  segmentBtn: { flex: 1, paddingVertical: SPACING.sm, borderRadius: RADIUS.sm, alignItems: 'center' },
  segmentBtnActive: { backgroundColor: COLORS.primary },
  segmentText: { color: COLORS.textSecondary, fontWeight: FONT_WEIGHTS.medium, fontSize: FONT_SIZES.sm },
  segmentTextActive: { color: COLORS.white },
  dayOption: {
    width: 40, height: 40, borderRadius: RADIUS.full, backgroundColor: COLORS.surface,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  dayOptionText: { color: COLORS.text, fontWeight: FONT_WEIGHTS.medium },
  reminderRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: SPACING.md,
  },
  toggle: {
    width: 50, height: 30, borderRadius: RADIUS.full, backgroundColor: COLORS.border, padding: 3, justifyContent: 'center',
  },
  toggleKnob: { width: 24, height: 24, borderRadius: RADIUS.full, backgroundColor: COLORS.white },
  toggleKnobActive: { transform: [{ translateX: 20 }] },
  timeBox: {
    marginTop: SPACING.sm, backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: SPACING.md, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  timeText: { fontSize: FONT_SIZES.lg, color: COLORS.text, fontWeight: FONT_WEIGHTS.semibold },
  saveBtn: {
    marginTop: SPACING.xl, paddingVertical: SPACING.md, borderRadius: RADIUS.md, alignItems: 'center',
  },
  saveBtnText: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: FONT_WEIGHTS.bold },
  deleteBtn: { marginTop: SPACING.md, paddingVertical: SPACING.md, alignItems: 'center', marginBottom: SPACING.xl },
  deleteBtnText: { color: COLORS.danger, fontWeight: FONT_WEIGHTS.semibold },
});
