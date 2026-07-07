# Gestor de Hábitos 📱

App de React Native (Expo) para crear y trackear hábitos, con calendario,
rachas, recordatorios y estadísticas.

## Estructura del proyecto

```
habit-tracker-app/
├── App.js                     # Punto de entrada
├── constants/
│   └── theme.js                # 🎨 TODA la paleta de colores, tamaños de
│                                #    fuente, spacing y radios de borde.
│                                #    Modificá este archivo para cambiar
│                                #    el look completo de la app.
├── context/
│   └── HabitContext.js         # Estado global (hábitos) + persistencia
├── navigation/
│   └── AppNavigator.js         # Tabs + Stacks de navegación
├── screens/
│   ├── HomeScreen.js           # Lista de hábitos del día
│   ├── CreateHabitScreen.js    # Crear/editar hábito
│   ├── HabitDetailScreen.js    # Calendario + racha + % cumplimiento
│   └── StatsScreen.js          # Estadísticas globales
├── components/
│   ├── HabitCard.js
│   ├── Calendar.js
│   └── ProgressBar.js
└── utils/
    ├── storage.js               # AsyncStorage
    ├── dates.js                 # Helpers de fechas
    ├── streaks.js                # Cálculo de rachas y % cumplimiento
    └── notifications.js          # Recordatorios locales (expo-notifications)
```

## Cómo correrla

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Iniciar Expo:
   ```bash
   npm start
   ```
3. Escanear el código QR con la app **Expo Go** (Android/iOS), o presionar
   `a` / `i` para abrir en emulador Android/iOS.

## Personalizar colores y tipografía

Todo vive en `constants/theme.js`:

- `COLORS` → paleta general de la app + paleta de colores para hábitos
- `FONT_SIZES` / `FONT_WEIGHTS` → escala tipográfica
- `SPACING` → espaciados consistentes (xs, sm, md, lg, xl, xxl)
- `RADIUS` → bordes redondeados
- `HABIT_ICONS` → emojis disponibles al crear un hábito
- `WEEK_DAYS` → etiquetas de días para hábitos con frecuencia semanal

Cambiando estos valores, se actualiza toda la app (no hay colores
"hardcodeados" sueltos en las pantallas).

## Funcionalidades incluidas

- ✅ Crear hábitos con nombre, icono, color y frecuencia (diaria o días
  específicos de la semana)
- ✅ Marcar el hábito como completado cada día desde la pantalla principal
- ✅ Calendario mensual por hábito (tocando un día se alterna su estado,
  útil para cargar historial pasado)
- ✅ Cálculo de racha actual y mejor racha histórica
- ✅ Recordatorios diarios con notificaciones locales (expo-notifications)
- ✅ Pantalla de estadísticas con resumen general y % de cumplimiento por
  hábito (últimos 30 días)
- ✅ Edición y eliminación de hábitos

## Notas técnicas

- La persistencia es local (AsyncStorage), no requiere backend.
- Las notificaciones usan `expo-notifications`; en Android es necesario
  un development build (o EAS Build) para notificaciones programadas en
  producción — en Expo Go funcionan para pruebas.
- Si preferís no usar Expo y usar React Native CLI puro, la única parte
  que cambia es la instalación de `expo-notifications`/`expo-status-bar`
  (reemplazar por `@notifee/react-native` o similar) y la config nativa
  de cada paquete.
