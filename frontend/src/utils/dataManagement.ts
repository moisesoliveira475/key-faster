import { useMetricsStore } from '../stores/useMetricsStore';
import { usePreferencesStore } from '../stores/usePreferencesStore';
import { PreferencesStorage, SessionHistoryStorage } from './localStorage';

/**
 * Complete user data export including preferences and session history
 */
export function exportAllData(): string {
  const preferencesStore = usePreferencesStore.getState();
  const metricsStore = useMetricsStore.getState();

  const completeExport = {
    preferences: JSON.parse(preferencesStore.exportPreferences()),
    metrics: JSON.parse(metricsStore.exportData()),
    exportedAt: new Date().toISOString(),
    version: '1.0',
    appName: 'Typing Study App',
  };

  return JSON.stringify(completeExport, null, 2);
}

/**
 * Import complete user data from JSON string
 */
export function importAllData(data: string): { success: boolean; errors: string[] } {
  const errors: string[] = [];

  try {
    const importData = JSON.parse(data);

    // Validate structure
    if (!importData || typeof importData !== 'object') {
      return { success: false, errors: ['Invalid data format'] };
    }

    // Import preferences
    if (importData.preferences) {
      const preferencesSuccess = usePreferencesStore
        .getState()
        .importPreferences(JSON.stringify(importData.preferences));

      if (!preferencesSuccess) {
        errors.push('Failed to import preferences');
      }
    }

    // Import metrics
    if (importData.metrics) {
      const metricsSuccess = useMetricsStore
        .getState()
        .importData(JSON.stringify(importData.metrics));

      if (!metricsSuccess) {
        errors.push('Failed to import metrics');
      }
    }

    return {
      success: errors.length === 0,
      errors,
    };
  } catch (error) {
    return {
      success: false,
      errors: [`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
    };
  }
}

/**
 * Download data as a JSON file
 */
export function downloadDataAsFile(filename: string = 'typing-study-data.json'): void {
  try {
    const data = exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    console.log('Data exported successfully');
  } catch (error) {
    console.error('Failed to download data:', error);
    throw error;
  }
}

/**
 * Import data from a file
 */
export function importDataFromFile(file: File): Promise<{ success: boolean; errors: string[] }> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = event.target?.result as string;
        const result = importAllData(data);
        resolve(result);
      } catch (error) {
        resolve({
          success: false,
          errors: [
            `Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`,
          ],
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        errors: ['Failed to read file'],
      });
    };

    reader.readAsText(file);
  });
}

/**
 * Clear all user data (preferences and session history)
 */
export function clearAllData(): void {
  // Clear stores
  usePreferencesStore.getState().resetPreferences();
  useMetricsStore.getState().clearHistory();

  // Clear local storage
  PreferencesStorage.clear();
  SessionHistoryStorage.clear();

  console.log('All user data cleared');
}

/**
 * Get storage usage information
 */
export function getStorageInfo(): {
  preferencesSize: number;
  sessionHistorySize: number;
  totalSize: number;
  sessionCount: number;
} {
  const preferencesData = localStorage.getItem('typing_study_preferences') || '';
  const sessionHistoryData = localStorage.getItem('typing_study_session_history') || '';

  const preferencesSize = new Blob([preferencesData]).size;
  const sessionHistorySize = new Blob([sessionHistoryData]).size;

  const sessionHistory = useMetricsStore.getState().sessionHistory;

  return {
    preferencesSize,
    sessionHistorySize,
    totalSize: preferencesSize + sessionHistorySize,
    sessionCount: sessionHistory.length,
  };
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Math.round((bytes / k ** i) * 100) / 100} ${sizes[i]}`;
}

/**
 * Privacy controls - anonymize session data
 */
export function anonymizeSessionData(): void {
  const metricsStore = useMetricsStore.getState();
  const sessions = metricsStore.sessionHistory;

  // Remove theme information (could be personally identifying)
  const anonymizedSessions = sessions.map((session) => ({
    ...session,
    theme: 'Anonymous Theme',
  }));

  // Clear and re-add anonymized sessions
  metricsStore.clearHistory();
  anonymizedSessions.forEach((session) => metricsStore.addSession(session));

  console.log('Session data anonymized');
}

/**
 * Data retention policy - keep only recent data
 */
export function applyDataRetentionPolicy(daysToKeep: number = 90): number {
  const metricsStore = useMetricsStore.getState();
  return metricsStore.clearOldSessions(daysToKeep);
}
