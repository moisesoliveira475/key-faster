import { useEffect } from 'react';
import { isLocalStorageAvailable, runMigrations } from '../utils/dataMigration';
import { PreferencesStorage, SessionHistoryStorage } from '../utils/localStorage';
import { useMetricsStore } from './useMetricsStore';
import { usePreferencesStore } from './usePreferencesStore';
import { useTypingSessionStore } from './useTypingSessionStore';

/**
 * Initialize stores with data from local storage
 * Should be called once when the app starts
 */
export function initializeStores(): void {
  // Check if local storage is available
  if (!isLocalStorageAvailable()) {
    console.warn('Local storage is not available. Data will not be persisted.');
    return;
  }

  // Run any necessary data migrations
  runMigrations();

  // Load preferences
  const savedPreferences = PreferencesStorage.load();
  if (savedPreferences) {
    const preferencesStore = usePreferencesStore.getState();

    // Update store with saved preferences
    preferencesStore.setKeyboardLayout(savedPreferences.keyboardLayout);
    preferencesStore.setHighlightErrors(savedPreferences.highlightErrors);
    preferencesStore.setAutoPause(savedPreferences.autoPause);
    preferencesStore.setAutoPauseDelay(savedPreferences.autoPauseDelay);
    preferencesStore.setLanguage(savedPreferences.language);

    // Load recent themes
    savedPreferences.recentThemes.forEach((theme) => {
      preferencesStore.addRecentTheme(theme);
    });
  }

  // Load session history
  const savedHistory = SessionHistoryStorage.load();
  if (savedHistory.length > 0) {
    const metricsStore = useMetricsStore.getState();

    // Add all sessions to the store
    savedHistory.forEach((session) => {
      metricsStore.addSession(session);
    });
  }

  // Attempt to recover interrupted session
  const typingSessionStore = useTypingSessionStore.getState();
  const recoveredSession = typingSessionStore.recoverSession();

  if (recoveredSession) {
    console.log('Recovered interrupted session:', recoveredSession.sessionId);
    // Optionally show a notification to the user about recovery
  }
}

/**
 * Hook to automatically persist preferences changes
 */
export function usePersistPreferences(): void {
  const preferences = usePreferencesStore();

  useEffect(() => {
    // Save preferences whenever they change
    PreferencesStorage.save({
      keyboardLayout: preferences.keyboardLayout,
      recentThemes: preferences.recentThemes,
      highlightErrors: preferences.highlightErrors,
      autoPause: preferences.autoPause,
      autoPauseDelay: preferences.autoPauseDelay,
      language: preferences.language,
    });
  }, [
    preferences.keyboardLayout,
    preferences.recentThemes,
    preferences.highlightErrors,
    preferences.autoPause,
    preferences.autoPauseDelay,
    preferences.language,
  ]);
}

/**
 * Hook to automatically persist session history changes
 */
export function usePersistSessionHistory(): void {
  const sessionHistory = useMetricsStore((state) => state.sessionHistory);

  useEffect(() => {
    // Save session history whenever it changes
    SessionHistoryStorage.save(sessionHistory);
  }, [sessionHistory]);
}

/**
 * Hook to automatically persist current session changes
 */
export function usePersistCurrentSession(): void {
  const currentSession = useTypingSessionStore((state) => state.currentSession);
  const autoSaveSession = useTypingSessionStore((state) => state.autoSaveSession);

  useEffect(() => {
    // Auto-save whenever session changes
    if (currentSession?.isActive) {
      autoSaveSession();
    }
  }, [currentSession, autoSaveSession]);
}

/**
 * Hook to set up all persistence
 * Use this in your root App component
 */
export function usePersistence(): void {
  usePersistPreferences();
  usePersistSessionHistory();
  usePersistCurrentSession();
}
