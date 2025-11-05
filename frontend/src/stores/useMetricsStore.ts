import { create } from 'zustand';
import type { ErrorPattern, HistoricalSession } from '../types';

interface MetricsState {
  // Historical data
  sessionHistory: HistoricalSession[];
  errorPatterns: ErrorPattern[];

  // Statistics
  totalSessions: number;
  averageWPM: number;
  averageAccuracy: number;
  totalPracticeTime: number; // in seconds

  // Actions
  addSession: (session: HistoricalSession) => void;
  removeSession: (sessionId: string) => void;

  clearHistory: () => void;
  updateErrorPatterns: (patterns: ErrorPattern[]) => void;
  calculateStatistics: () => void;
  getSessionsByDateRange: (startDate: Date, endDate: Date) => HistoricalSession[];
  getSessionsByTheme: (theme: string) => HistoricalSession[];
  getBestSession: () => HistoricalSession | null;
  getRecentSessions: (count: number) => HistoricalSession[];

  // Import/Export
  exportData: () => string;
  importData: (data: string) => boolean;

  // Data cleanup
  clearOldSessions: (daysToKeep: number) => number;
  clearSessionsByTheme: (theme: string) => number;
}

export const useMetricsStore = create<MetricsState>((set, get) => ({
  sessionHistory: [],
  errorPatterns: [],
  totalSessions: 0,
  averageWPM: 0,
  averageAccuracy: 0,
  totalPracticeTime: 0,

  addSession: (session) => {
    const { sessionHistory } = get();
    const updatedHistory = [session, ...sessionHistory];

    set({ sessionHistory: updatedHistory });

    // Recalculate statistics after adding
    get().calculateStatistics();
  },

  removeSession: (sessionId) => {
    const { sessionHistory } = get();
    const updatedHistory = sessionHistory.filter((s) => s.sessionId !== sessionId);

    set({ sessionHistory: updatedHistory });

    // Recalculate statistics after removing
    get().calculateStatistics();
  },

  clearHistory: () => {
    set({
      sessionHistory: [],
      errorPatterns: [],
      totalSessions: 0,
      averageWPM: 0,
      averageAccuracy: 0,
      totalPracticeTime: 0,
    });
  },

  updateErrorPatterns: (patterns) => {
    set({ errorPatterns: patterns });
  },

  calculateStatistics: () => {
    const { sessionHistory } = get();

    if (sessionHistory.length === 0) {
      set({
        totalSessions: 0,
        averageWPM: 0,
        averageAccuracy: 0,
        totalPracticeTime: 0,
      });
      return;
    }

    const totalWPM = sessionHistory.reduce((sum, s) => sum + s.wpm, 0);
    const totalAccuracy = sessionHistory.reduce((sum, s) => sum + s.accuracy, 0);
    const totalTime = sessionHistory.reduce((sum, s) => sum + s.duration, 0);

    set({
      totalSessions: sessionHistory.length,
      averageWPM: Math.round(totalWPM / sessionHistory.length),
      averageAccuracy: Math.round((totalAccuracy / sessionHistory.length) * 100) / 100,
      totalPracticeTime: totalTime,
    });
  },

  getSessionsByDateRange: (startDate, endDate) => {
    const { sessionHistory } = get();
    return sessionHistory.filter((session) => {
      const sessionDate = new Date(session.date);
      return sessionDate >= startDate && sessionDate <= endDate;
    });
  },

  getSessionsByTheme: (theme) => {
    const { sessionHistory } = get();
    return sessionHistory.filter((session) =>
      session.theme.toLowerCase().includes(theme.toLowerCase())
    );
  },

  getBestSession: () => {
    const { sessionHistory } = get();
    if (sessionHistory.length === 0) return null;

    // Best session is determined by highest WPM with accuracy >= 90%
    const qualifiedSessions = sessionHistory.filter((s) => s.accuracy >= 90);

    if (qualifiedSessions.length === 0) {
      // If no sessions with 90%+ accuracy, return highest WPM
      return sessionHistory.reduce((best, current) => (current.wpm > best.wpm ? current : best));
    }

    return qualifiedSessions.reduce((best, current) => (current.wpm > best.wpm ? current : best));
  },

  getRecentSessions: (count) => {
    const { sessionHistory } = get();
    return sessionHistory.slice(0, count);
  },

  exportData: () => {
    const state = get();
    const exportData = {
      sessionHistory: state.sessionHistory,
      errorPatterns: state.errorPatterns,
      statistics: {
        totalSessions: state.totalSessions,
        averageWPM: state.averageWPM,
        averageAccuracy: state.averageAccuracy,
        totalPracticeTime: state.totalPracticeTime,
      },
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };

    return JSON.stringify(exportData, null, 2);
  },

  importData: (data: string) => {
    try {
      const importData = JSON.parse(data);

      // Validate the data structure
      if (!importData || typeof importData !== 'object') {
        console.error('Invalid import data format');
        return false;
      }

      // Convert date strings back to Date objects
      if (importData.sessionHistory) {
        importData.sessionHistory = importData.sessionHistory.map((session: any) => ({
          ...session,
          date: new Date(session.date),
        }));
      }

      // Apply imported data
      set({
        sessionHistory: importData.sessionHistory || [],
        errorPatterns: importData.errorPatterns || [],
      });

      // Recalculate statistics
      get().calculateStatistics();

      console.log('Data imported successfully');
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  },

  clearOldSessions: (daysToKeep: number) => {
    const { sessionHistory } = get();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const filteredSessions = sessionHistory.filter((session) => {
      const sessionDate = new Date(session.date);
      return sessionDate >= cutoffDate;
    });

    const removedCount = sessionHistory.length - filteredSessions.length;

    set({ sessionHistory: filteredSessions });
    get().calculateStatistics();

    console.log(`Removed ${removedCount} sessions older than ${daysToKeep} days`);
    return removedCount;
  },

  clearSessionsByTheme: (theme: string) => {
    const { sessionHistory } = get();
    const filteredSessions = sessionHistory.filter(
      (session) => !session.theme.toLowerCase().includes(theme.toLowerCase())
    );

    const removedCount = sessionHistory.length - filteredSessions.length;

    set({ sessionHistory: filteredSessions });
    get().calculateStatistics();

    console.log(`Removed ${removedCount} sessions with theme: ${theme}`);
    return removedCount;
  },
}));
