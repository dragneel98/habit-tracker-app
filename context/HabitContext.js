// ============================================================
// HabitContext.js
// Estado global de la app: lista de hábitos + acciones para
// crear, editar, borrar y marcar como completado. Persiste todo
// en AsyncStorage automáticamente.
// ============================================================
import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { loadHabits, saveHabits } from '../utils/storage';
import { todayKey } from '../utils/dates';
import { scheduleHabitReminder, cancelHabitReminder } from '../utils/notifications';

const HabitContext = createContext(null);

const initialState = {
  habits: [],
  loaded: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, habits: action.payload, loaded: true };
    case 'ADD_HABIT':
      return { ...state, habits: [action.payload, ...state.habits] };
    case 'UPDATE_HABIT':
      return {
        ...state,
        habits: state.habits.map((h) => (h.id === action.payload.id ? action.payload : h)),
      };
    case 'DELETE_HABIT':
      return { ...state, habits: state.habits.filter((h) => h.id !== action.payload) };
    case 'TOGGLE_COMPLETION': {
      const { habitId, dateKey } = action.payload;
      return {
        ...state,
        habits: state.habits.map((h) => {
          if (h.id !== habitId) return h;
          const completions = { ...h.completions };
          if (completions[dateKey]) {
            delete completions[dateKey];
          } else {
            completions[dateKey] = true;
          }
          return { ...h, completions };
        }),
      };
    }
    default:
      return state;
  }
}

export function HabitProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    (async () => {
      const habits = await loadHabits();
      dispatch({ type: 'HYDRATE', payload: habits });
    })();
  }, []);

  useEffect(() => {
    if (state.loaded) {
      saveHabits(state.habits);
    }
  }, [state.habits, state.loaded]);

  const addHabit = async (habit) => {
    const newHabit = {
      id: Date.now().toString(),
      name: habit.name,
      icon: habit.icon,
      color: habit.color,
      frequency: habit.frequency, // { type: 'daily' } | { type: 'weekly', days: [1,3,5] }
      reminder: habit.reminder,   // { enabled, hour, minute }
      completions: {},
      createdAt: new Date().toISOString(),
      notificationId: null,
    };

    if (newHabit.reminder?.enabled) {
      newHabit.notificationId = await scheduleHabitReminder(newHabit);
    }

    dispatch({ type: 'ADD_HABIT', payload: newHabit });
  };

  const updateHabit = async (habit) => {
    if (habit.notificationId) {
      await cancelHabitReminder(habit.notificationId);
      habit.notificationId = null;
    }
    if (habit.reminder?.enabled) {
      habit.notificationId = await scheduleHabitReminder(habit);
    }
    dispatch({ type: 'UPDATE_HABIT', payload: habit });
  };

  const deleteHabit = async (habitId) => {
    const habit = state.habits.find((h) => h.id === habitId);
    if (habit?.notificationId) {
      await cancelHabitReminder(habit.notificationId);
    }
    dispatch({ type: 'DELETE_HABIT', payload: habitId });
  };

  const toggleToday = (habitId) => {
    dispatch({ type: 'TOGGLE_COMPLETION', payload: { habitId, dateKey: todayKey() } });
  };

  const toggleDate = (habitId, dateKey) => {
    dispatch({ type: 'TOGGLE_COMPLETION', payload: { habitId, dateKey } });
  };

  return (
    <HabitContext.Provider
      value={{
        habits: state.habits,
        loaded: state.loaded,
        addHabit,
        updateHabit,
        deleteHabit,
        toggleToday,
        toggleDate,
      }}
    >
      {children}
    </HabitContext.Provider>
  );
}

export function useHabits() {
  const ctx = useContext(HabitContext);
  if (!ctx) throw new Error('useHabits debe usarse dentro de <HabitProvider>');
  return ctx;
}
