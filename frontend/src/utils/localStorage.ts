import type { HistoricalSession, UserPreferences } from '../types';

// Storage keys
const STORAGE_KEYS = {
  PREFERENCES: 'typing_study_preferences',
  SESSION_HISTORY: 'typing_study_session_history',
  SCHEMA_VERSION: 'typing_study_schema_version',
} as const;

/**
 * Storage utility for user preferences
 */
export const PreferencesStorage = {
  /**
   * Save user preferences to local storage
   */
  save: (preferences: UserPreferences): void => {
    try {
      const data = JSON.stringify(preferences);
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, data);
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  },

  /**
   * Load user preferences from local storage
   */
  load: (): UserPreferences | null => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      if (!data) return null;

      const preferences = JSON.parse(data);

      // Convert date strings back to Date objects for recentThemes
      if (preferences.recentThemes) {
        preferences.recentThemes = preferences.recentThemes.map((theme: any) => ({
          ...theme,
          lastUsed: theme.lastUsed ? new Date(theme.lastUsed) : undefined,
        }));
      }

      return preferences;
    } catch (error) {
      console.error('Failed to load preferences:', error);
      return null;
    }
  },

  /**
   * Clear user preferences from local storage
   */
  clear: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEYS.PREFERENCES);
    } catch (error) {
      console.error('Failed to clear preferences:', error);
    }
  },
};

/**
 * Storage utility for session history
 */
export const SessionHistoryStorage = {
  /**
   * Save session history to local storage
   */
  save: (sessions: HistoricalSession[]): void => {
    try {
      const data = JSON.stringify(sessions);
      localStorage.setItem(STORAGE_KEYS.SESSION_HISTORY, data);
    } catch (error) {
      console.error('Failed to save session history:', error);
    }
  },

  /**
   * Load session history from local storage
   */
  load: (): HistoricalSession[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSION_HISTORY);
      if (!data) return [];

      const sessions = JSON.parse(data);

      // Convert date strings back to Date objects
      return sessions.map((session: any) => ({
        ...session,
        date: new Date(session.date),
      }));
    } catch (error) {
      console.error('Failed to load session history:', error);
      return [];
    }
  },

  /**
   * Add a single session to history
   */
  add: (session: HistoricalSession): void => {
    try {
      const sessions = SessionHistoryStorage.load();
      sessions.unshift(session); // Add to beginning

      // Keep only the last 100 sessions to prevent storage bloat
      const trimmedSessions = sessions.slice(0, 100);

      SessionHistoryStorage.save(trimmedSessions);
    } catch (error) {
      console.error('Failed to add session to history:', error);
    }
  },

  /**
   * Remove a session from history by ID
   */
  remove: (sessionId: string): void => {
    try {
      const sessions = SessionHistoryStorage.load();
      const filtered = sessions.filter((s) => s.sessionId !== sessionId);
      SessionHistoryStorage.save(filtered);
    } catch (error) {
      console.error('Failed to remove session from history:', error);
    }
  },

  /**
   * Clear all session history
   */
  clear: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEYS.SESSION_HISTORY);
    } catch (error) {
      console.error('Failed to clear session history:', error);
    }
  },
};
