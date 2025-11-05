# Zustand Stores Documentation

This directory contains the state management implementation using Zustand for the Typing Study App.

## Stores

### 1. useTypingSessionStore
Manages the current typing session state, including progress, errors, and real-time metrics.

**Usage:**
```typescript
import { useTypingSessionStore } from './stores';

function TypingComponent() {
  const { 
    currentSession, 
    isSessionActive, 
    startSession, 
    updateProgress,
    addError,
    endSession 
  } = useTypingSessionStore();

  // Start a new session
  const handleStart = () => {
    startSession(content, 'JavaScript', 'QWERTY');
  };

  // Update typing progress
  const handleInput = (position: number, text: string) => {
    updateProgress(position, text);
  };

  // End session
  const handleEnd = () => {
    endSession();
  };
}
```

### 2. usePreferencesStore
Manages user preferences like keyboard layout, themes, and settings.

**Usage:**
```typescript
import { usePreferencesStore } from './stores';

function SettingsComponent() {
  const { 
    keyboardLayout, 
    recentThemes,
    setKeyboardLayout,
    addRecentTheme 
  } = usePreferencesStore();

  // Change keyboard layout
  const handleLayoutChange = (layout: KeyboardLayoutType) => {
    setKeyboardLayout(layout);
  };

  // Add a theme to recent themes
  const handleThemeSelect = (theme: ThemeSelection) => {
    addRecentTheme(theme);
  };
}
```

### 3. useMetricsStore
Manages historical session data and statistics for progress tracking.

**Usage:**
```typescript
import { useMetricsStore } from './stores';

function MetricsComponent() {
  const { 
    sessionHistory, 
    averageWPM,
    averageAccuracy,
    addSession,
    getBestSession 
  } = useMetricsStore();

  // Add a completed session
  const handleSessionComplete = (session: HistoricalSession) => {
    addSession(session);
  };

  // Get best performance
  const bestSession = getBestSession();
}
```

## Persistence

The stores automatically persist data to local storage using the persistence utilities.

### Setup in App Component

```typescript
import { useEffect } from 'react';
import { initializeStores, usePersistence } from './stores';

function App() {
  // Initialize stores on mount
  useEffect(() => {
    initializeStores();
  }, []);

  // Auto-persist changes
  usePersistence();

  return <div>Your App</div>;
}
```

### Manual Persistence Control

If you need more control over persistence:

```typescript
import { 
  usePersistPreferences, 
  usePersistSessionHistory 
} from './stores';

function App() {
  // Only persist preferences
  usePersistPreferences();
  
  // Or only persist session history
  usePersistSessionHistory();
}
```

## Local Storage Utilities

### PreferencesStorage
Direct access to preferences storage:

```typescript
import { PreferencesStorage } from '../utils/localStorage';

// Save preferences
PreferencesStorage.save(preferences);

// Load preferences
const preferences = PreferencesStorage.load();

// Clear preferences
PreferencesStorage.clear();
```

### SessionHistoryStorage
Direct access to session history storage:

```typescript
import { SessionHistoryStorage } from '../utils/localStorage';

// Save all sessions
SessionHistoryStorage.save(sessions);

// Load all sessions
const sessions = SessionHistoryStorage.load();

// Add a single session
SessionHistoryStorage.add(session);

// Remove a session
SessionHistoryStorage.remove(sessionId);

// Clear all history
SessionHistoryStorage.clear();
```

## Data Migration

The app includes automatic data migration for schema updates:

```typescript
import { 
  runMigrations, 
  exportData, 
  importData,
  clearAllData 
} from '../utils/dataMigration';

// Migrations run automatically on app start
// But you can also run them manually:
runMigrations();

// Export data for backup
const jsonData = exportData();

// Import data from backup
const success = importData(jsonData);

// Clear all app data
clearAllData();
```

## Requirements Coverage

This implementation satisfies the following requirements:

- **Requirement 5.1**: Real-time WPM calculation and display (via useTypingSessionStore)
- **Requirement 6.1**: Real-time accuracy calculation (via useTypingSessionStore)
- **Requirement 7.1**: Store historical performance data (via useMetricsStore)
- **Requirement 1.3**: Save theme preferences for future sessions (via usePreferencesStore)
- **Requirement 7.2**: Display progress over time with historical data (via useMetricsStore)
