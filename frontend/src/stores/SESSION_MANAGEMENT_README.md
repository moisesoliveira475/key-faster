# Session Management and User Preferences System

## Overview

This document describes the session lifecycle management, auto-save functionality, session recovery, and user preferences system implemented for the Typing Study App.

## Features Implemented

### 1. Session Lifecycle Management

#### Auto-Save Functionality
- **Periodic Auto-Save**: Sessions are automatically saved every 30 seconds to localStorage
- **Event-Based Auto-Save**: Sessions are saved when:
  - Session starts
  - Session is paused
  - Session is resumed
  - Session ends
- **Recovery Key**: `typing_study_session_recovery`

#### Auto-Pause on Inactivity
- Automatically pauses the session after a configurable delay (default: 10 seconds)
- Timer resets on any typing activity
- Configurable through user preferences
- Can be disabled in settings

#### Session Recovery
- Detects interrupted sessions on app startup
- Prompts user to continue or discard the recovered session
- Preserves all session data:
  - Progress (current position, typed text)
  - Metrics (WPM, accuracy, errors)
  - Theme and keyboard layout
  - Timestamps

#### Session States
- **Active**: User is actively typing
- **Paused**: Session is paused (manually or auto-pause)
- **Ended**: Session completed normally
- **Recovered**: Session restored from interrupted state

### 2. User Preferences System

#### Preferences Stored
- Keyboard layout (QWERTY, DVORAK, AZERTY)
- Recent themes (up to 10)
- Error highlighting preference
- Auto-pause enabled/disabled
- Auto-pause delay (5-60 seconds)
- Language preference (pt/en)

#### Import/Export Functionality
- **Export**: Download all preferences as JSON file
- **Import**: Upload and restore preferences from JSON file
- **Format**: Human-readable JSON with metadata
- **Validation**: Automatic validation on import

### 3. Data Management

#### Storage Information
- View storage usage by category
- Track number of sessions stored
- Monitor total storage size

#### Data Cleanup Options
- **Clear Old Sessions**: Remove sessions older than X days
- **Clear by Theme**: Remove all sessions for a specific theme
- **Clear All History**: Remove all session history
- **Clear All Data**: Complete data wipe (preferences + history)

#### Privacy Controls
- **Anonymize Data**: Remove theme information while keeping metrics
- **Data Retention Policy**: Automatically clean old data
- **Local Storage Only**: All data stays in browser
- **No External Tracking**: No data sent to external servers

## Usage

### Initializing Stores

```typescript
import { initializeStores } from './stores/persistence';

// Call once when app starts
initializeStores();
```

### Using Persistence Hooks

```typescript
import { usePersistence } from './stores/persistence';

function App() {
  // Set up automatic persistence
  usePersistence();
  
  return <YourApp />;
}
```

### Session Lifecycle

```typescript
import { useTypingSessionStore } from './stores/useTypingSessionStore';

function TypingComponent() {
  const {
    startSession,
    endSession,
    pauseSession,
    resumeSession,
    updateProgress,
    currentSession,
    isSessionActive,
    isPaused,
  } = useTypingSessionStore();

  // Start a new session
  const handleStart = () => {
    startSession(content, theme, keyboardLayout);
  };

  // End session
  const handleEnd = () => {
    endSession();
  };

  // Pause/Resume
  const handlePause = () => {
    if (isPaused) {
      resumeSession();
    } else {
      pauseSession();
    }
  };

  // Update progress
  const handleTyping = (position: number, text: string) => {
    updateProgress(position, text);
  };
}
```

### Session Recovery

```typescript
import { useTypingSessionStore } from './stores/useTypingSessionStore';
import { SessionRecoveryPrompt } from './components/SessionRecoveryPrompt';

function App() {
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveredSession, setRecoveredSession] = useState(null);
  const { recoverSession, clearRecoveryData } = useTypingSessionStore();

  useEffect(() => {
    const session = recoverSession();
    if (session) {
      setRecoveredSession(session);
      setShowRecovery(true);
    }
  }, []);

  const handleRecover = () => {
    setShowRecovery(false);
    // Session is already loaded in store
  };

  const handleDiscard = () => {
    clearRecoveryData();
    setShowRecovery(false);
  };

  return (
    <>
      {showRecovery && recoveredSession && (
        <SessionRecoveryPrompt
          session={recoveredSession}
          onRecover={handleRecover}
          onDiscard={handleDiscard}
        />
      )}
      {/* Rest of app */}
    </>
  );
}
```

### User Preferences

```typescript
import { usePreferencesStore } from './stores/usePreferencesStore';

function Settings() {
  const {
    keyboardLayout,
    setKeyboardLayout,
    highlightErrors,
    setHighlightErrors,
    autoPause,
    setAutoPause,
    autoPauseDelay,
    setAutoPauseDelay,
    exportPreferences,
    importPreferences,
  } = usePreferencesStore();

  // Export preferences
  const handleExport = () => {
    const data = exportPreferences();
    // Download or display data
  };

  // Import preferences
  const handleImport = (jsonString: string) => {
    const success = importPreferences(jsonString);
    if (success) {
      alert('Preferences imported successfully!');
    }
  };
}
```

### Data Management

```typescript
import {
  exportAllData,
  importAllData,
  downloadDataAsFile,
  importDataFromFile,
  clearAllData,
  getStorageInfo,
  formatBytes,
  anonymizeSessionData,
  applyDataRetentionPolicy,
} from './utils/dataManagement';

// Export all data
const handleExport = () => {
  downloadDataAsFile('my-backup.json');
};

// Import from file
const handleImport = async (file: File) => {
  const result = await importDataFromFile(file);
  if (result.success) {
    console.log('Import successful');
  } else {
    console.error('Import failed:', result.errors);
  }
};

// Get storage info
const info = getStorageInfo();
console.log(`Using ${formatBytes(info.totalSize)} of storage`);

// Apply retention policy (keep last 90 days)
const removed = applyDataRetentionPolicy(90);
console.log(`Removed ${removed} old sessions`);

// Anonymize data
anonymizeSessionData();

// Clear everything
clearAllData();
```

## Components

### SettingsPanel
Full-featured settings UI with three tabs:
- **General**: Language, error highlighting, auto-pause settings
- **Data Management**: Export/import, storage info, cleanup tools
- **Privacy**: Anonymization, retention policy, privacy controls

### SessionRecoveryPrompt
Modal dialog for session recovery with:
- Session details display
- Continue or discard options
- Visual feedback

## Storage Keys

- `typing_study_preferences` - User preferences
- `typing_study_session_history` - Historical sessions
- `typing_study_session_recovery` - Current/interrupted session
- `typing_study_schema_version` - Data schema version

## Data Format

### Preferences Export Format
```json
{
  "keyboardLayout": "QWERTY",
  "recentThemes": [...],
  "highlightErrors": true,
  "autoPause": true,
  "autoPauseDelay": 10,
  "language": "pt",
  "exportedAt": "2025-10-13T...",
  "version": "1.0"
}
```

### Complete Data Export Format
```json
{
  "preferences": {...},
  "metrics": {
    "sessionHistory": [...],
    "errorPatterns": [...],
    "statistics": {...}
  },
  "exportedAt": "2025-10-13T...",
  "version": "1.0",
  "appName": "Typing Study App"
}
```

## Best Practices

1. **Always call `initializeStores()` on app startup** to load saved data and recover sessions
2. **Use `usePersistence()` hook in root component** for automatic data persistence
3. **Provide clear UI feedback** for import/export operations
4. **Validate imported data** before applying to stores
5. **Confirm destructive actions** (clear data, anonymize) with user
6. **Handle errors gracefully** in import/export operations
7. **Test session recovery** by refreshing during active session

## Requirements Satisfied

- ✅ **Requirement 5.4**: Auto-pause after 10 seconds of inactivity
- ✅ **Requirement 7.1**: Store historical performance data
- ✅ **Requirement 7.2**: Data persistence and recovery
- ✅ **Requirement 1.3**: Save theme preferences for future sessions
- ✅ **Requirement 4.3**: Persist keyboard layout selection

## Future Enhancements

- Cloud sync for cross-device data
- Automatic backup scheduling
- Data compression for large histories
- Advanced filtering for session history
- Export to CSV for analysis
- Encrypted data export option
