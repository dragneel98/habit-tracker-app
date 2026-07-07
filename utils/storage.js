// ============================================================
// storage.js
// Wrapper simple sobre AsyncStorage para persistir los hábitos.
// ============================================================
import AsyncStorage from '@react-native-async-storage/async-storage';

const HABITS_KEY = '@habit_tracker/habits';

export async function loadHabits() {
  try {
    const raw = await AsyncStorage.getItem(HABITS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('Error cargando hábitos', e);
    return [];
  }
}

export async function saveHabits(habits) {
  try {
    await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(habits));
  } catch (e) {
    console.warn('Error guardando hábitos', e);
  }
}
