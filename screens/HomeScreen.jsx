// ============================================================
// HomeScreen.js
// Pantalla principal: lista de hábitos del día con su racha
// y checkbox de completado.
// ============================================================
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING, RADIUS, SHADOW } from '../constants/theme';
import { useHabits } from '../context/HabitContext';
import HabitCard from '../components/HabitCard';

export default function HomeScreen({ navigation }) {
  const { habits, toggleToday } = useHabits();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Mis hábitos</Text>
          <Text style={styles.subtitle}>
            {habits.length === 0 ? 'Todavía no creaste ningún hábito' : `${habits.length} hábito(s) activos`}
          </Text>
        </View>
      </View>

      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <HabitCard
            habit={item}
            onPress={() => navigation.navigate('HabitDetail', { habitId: item.id })}
            onToggleToday={() => toggleToday(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🌱</Text>
            <Text style={styles.emptyText}>Creá tu primer hábito tocando el botón +</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateHabit')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.md },
  headerRow: { marginBottom: SPACING.md, marginTop: SPACING.sm },
  title: { fontSize: FONT_SIZES.xxl, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text },
  subtitle: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },
  list: { paddingBottom: 100 },
  empty: { alignItems: 'center', marginTop: SPACING.xxl },
  emptyEmoji: { fontSize: 48, marginBottom: SPACING.sm },
  emptyText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.md, textAlign: 'center' },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.lg,
    width: 58,
    height: 58,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.floating,
  },
  fabText: { color: COLORS.white, fontSize: FONT_SIZES.xxxl, marginTop: -2 },
});
