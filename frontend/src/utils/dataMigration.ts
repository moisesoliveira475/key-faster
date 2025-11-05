import type { HistoricalSession, UserPreferences } from '../types';

// Storage keys
const STORAGE_KEYS = {
  SCHEMA_VERSION: 'typing_study_schema_version',
  PREFERENCES: 'typing_study_preferences',
  SESSION_HISTORY: 'typing_study_session_history',
} as const;

// Current schema version
const CURRENT_SCHEMA_VERSION = 1;

/**
 * Default preferences for new users or after migration failures
 */
const DEFAULT_PREFERENCES: UserPreferences = {
  keyboardLayout: 'QWERTY',
  recentThemes: [],
  highlightErrors: true,
  autoPause: true,
  autoPauseDelay: 10,
  language: 'pt',
};

/**
 * Get the current schema version from local storage
 */
function getStoredSchemaVersion(): number {
  try {
    const version = localStorage.getItem(STORAGE_KEYS.SCHEMA_VERSION);
    return version ? parseInt(version, 10) : 0;
  } catch {
    return 0;
  }
}

/**
 * Set the schema version in local storage
 */
function setSchemaVersion(version: number): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SCHEMA_VERSION, version.toString());
  } catch (error) {
    console.error('Failed to set schema version:', error);
  }
}

/**
 * Migration from version 0 (no version) to version 1
 */
function migrateV0ToV1(): void {
  console.log('Migrating data from v0 to v1...');

  try {
    // Check if old data exists and migrate if needed
    const oldPreferences = localStorage.getItem(STORAGE_KEYS.PREFERENCES);

    if (oldPreferences) {
      const parsed = JSON.parse(oldPreferences);

      // Ensure all required fields exist
      const migratedPreferences: UserPreferences = {
        keyboardLayout: parsed.keyboardLayout || DEFAULT_PREFERENCES.keyboardLayout,
        recentThemes: parsed.recentThemes || DEFAULT_PREFERENCES.recentThemes,
        highlightErrors: parsed.highlightErrors ?? DEFAULT_PREFERENCES.highlightErrors,
        autoPause: parsed.autoPause ?? DEFAULT_PREFERENCES.autoPause,
        autoPauseDelay: parsed.autoPauseDelay || DEFAULT_PREFERENCES.autoPauseDelay,
        language: parsed.language || DEFAULT_PREFERENCES.language,
      };

      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(migratedPreferences));
    }

    // Migrate session history if needed
    const oldHistory = localStorage.getItem(STORAGE_KEYS.SESSION_HISTORY);

    if (oldHistory) {
      const parsed = JSON.parse(oldHistory);

      // Ensure all sessions have required fields
      const migratedHistory: HistoricalSession[] = parsed.map((session: any) => ({
        sessionId: session.sessionId || `migrated_${Date.now()}_${Math.random()}`,
        theme: session.theme || 'Unknown',
        date: session.date ? new Date(session.date) : new Date(),
        wpm: session.wpm || 0,
        accuracy: session.accuracy || 0,
        duration: session.duration || 0,
        errorCount: session.errorCount || 0,
        keyboardLayout: session.keyboardLayout || 'QWERTY',
      }));

      localStorage.setItem(STORAGE_KEYS.SESSION_HISTORY, JSON.stringify(migratedHistory));
    }

    console.log('Migration v0 to v1 completed successfully');
  } catch (error) {
    console.error('Migration v0 to v1 failed:', error);
    // On migration failure, clear corrupted data
    localStorage.removeItem(STORAGE_KEYS.PREFERENCES);
    localStorage.removeItem(STORAGE_KEYS.SESSION_HISTORY);
  }
}

/**
 * Run all necessary migrations based on current schema version
 */
export function runMigrations(): void {
  const currentVersion = getStoredSchemaVersion();

  if (currentVersion === CURRENT_SCHEMA_VERSION) {
    // Already on latest version
    return;
  }

  console.log(`Running migrations from v${currentVersion} to v${CURRENT_SCHEMA_VERSION}`);

  // Run migrations sequentially
  if (currentVersion < 1) {
    migrateV0ToV1();
  }

  // Future migrations would go here:
  // if (currentVersion < 2) {
  //   migrateV1ToV2();
  // }

  // Update schema version
  setSchemaVersion(CURRENT_SCHEMA_VERSION);
}

/**
 * Check if local storage is available
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get storage usage information
 */
export function getStorageInfo(): {
  used: number;
  available: boolean;
  preferencesSize: number;
  historySize: number;
} {
  if (!isLocalStorageAvailable()) {
    return {
      used: 0,
      available: false,
      preferencesSize: 0,
      historySize: 0,
    };
  }

  try {
    const preferences = localStorage.getItem(STORAGE_KEYS.PREFERENCES) || '';
    const history = localStorage.getItem(STORAGE_KEYS.SESSION_HISTORY) || '';

    // Calculate sizes in bytes
    const preferencesSize = new Blob([preferences]).size;
    const historySize = new Blob([history]).size;
    const totalSize = preferencesSize + historySize;

    return {
      used: totalSize,
      available: true,
      preferencesSize,
      historySize,
    };
  } catch (error) {
    console.error('Failed to get storage info:', error);
    return {
      used: 0,
      available: true,
      preferencesSize: 0,
      historySize: 0,
    };
  }
}

/**
 * Clear all app data from local storage
 */
export function clearAllData(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.PREFERENCES);
    localStorage.removeItem(STORAGE_KEYS.SESSION_HISTORY);
    localStorage.removeItem(STORAGE_KEYS.SCHEMA_VERSION);
    console.log('All app data cleared');
  } catch (error) {
    console.error('Failed to clear all data:', error);
  }
}

/**
 * Export all data as JSON for backup
 */
export function exportData(): string {
  try {
    const preferences = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    const history = localStorage.getItem(STORAGE_KEYS.SESSION_HISTORY);

    const exportData = {
      version: CURRENT_SCHEMA_VERSION,
      exportDate: new Date().toISOString(),
      preferences: preferences ? JSON.parse(preferences) : null,
      sessionHistory: history ? JSON.parse(history) : [],
    };

    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('Failed to export data:', error);
    throw new Error('Failed to export data');
  }
}

/**
 * Import data from JSON backup
 */
export function importData(jsonData: string): boolean {
  try {
    const data = JSON.parse(jsonData);

    // Validate data structure
    if (!data.version || !data.exportDate) {
      throw new Error('Invalid data format');
    }

    // Import preferences
    if (data.preferences) {
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(data.preferences));
    }

    // Import session history
    if (data.sessionHistory) {
      localStorage.setItem(STORAGE_KEYS.SESSION_HISTORY, JSON.stringify(data.sessionHistory));
    }

    // Set schema version
    setSchemaVersion(data.version);

    // Run migrations if imported version is older
    if (data.version < CURRENT_SCHEMA_VERSION) {
      runMigrations();
    }

    console.log('Data imported successfully');
    return true;
  } catch (error) {
    console.error('Failed to import data:', error);
    return false;
  }
}
