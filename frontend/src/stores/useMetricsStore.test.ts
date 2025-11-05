import { beforeEach, describe, expect, it } from 'vitest';
import type { HistoricalSession } from '../types';
import { useMetricsStore } from './useMetricsStore';

describe('useMetricsStore - Historical Data Aggregation', () => {
  beforeEach(() => {
    // Reset store before each test
    useMetricsStore.getState().clearHistory();
  });

  describe('addSession and calculateStatistics', () => {
    it('should add session and update statistics', () => {
      const session: HistoricalSession = {
        sessionId: '1',
        theme: 'JavaScript',
        date: new Date(),
        wpm: 50,
        accuracy: 95,
        duration: 300,
        errorCount: 5,
        keyboardLayout: 'QWERTY',
      };

      useMetricsStore.getState().addSession(session);

      const state = useMetricsStore.getState();
      expect(state.sessionHistory.length).toBe(1);
      expect(state.totalSessions).toBe(1);
      expect(state.averageWPM).toBe(50);
      expect(state.averageAccuracy).toBe(95);
      expect(state.totalPracticeTime).toBe(300);
    });

    it('should calculate average across multiple sessions', () => {
      const sessions: HistoricalSession[] = [
        {
          sessionId: '1',
          theme: 'JavaScript',
          date: new Date(),
          wpm: 40,
          accuracy: 90,
          duration: 300,
          errorCount: 10,
          keyboardLayout: 'QWERTY',
        },
        {
          sessionId: '2',
          theme: 'Python',
          date: new Date(),
          wpm: 60,
          accuracy: 95,
          duration: 400,
          errorCount: 5,
          keyboardLayout: 'QWERTY',
        },
      ];

      sessions.forEach((session) => useMetricsStore.getState().addSession(session));

      const state = useMetricsStore.getState();
      expect(state.totalSessions).toBe(2);
      expect(state.averageWPM).toBe(50); // (40 + 60) / 2
      expect(state.averageAccuracy).toBe(92.5); // (90 + 95) / 2
      expect(state.totalPracticeTime).toBe(700); // 300 + 400
    });
  });

  describe('getSessionsByDateRange', () => {
    it('should filter sessions by date range', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const sessions: HistoricalSession[] = [
        {
          sessionId: '1',
          theme: 'Test',
          date: twoDaysAgo,
          wpm: 40,
          accuracy: 90,
          duration: 300,
          errorCount: 10,
          keyboardLayout: 'QWERTY',
        },
        {
          sessionId: '2',
          theme: 'Test',
          date: yesterday,
          wpm: 50,
          accuracy: 92,
          duration: 300,
          errorCount: 8,
          keyboardLayout: 'QWERTY',
        },
        {
          sessionId: '3',
          theme: 'Test',
          date: today,
          wpm: 60,
          accuracy: 95,
          duration: 300,
          errorCount: 5,
          keyboardLayout: 'QWERTY',
        },
      ];

      sessions.forEach((session) => useMetricsStore.getState().addSession(session));

      const filtered = useMetricsStore.getState().getSessionsByDateRange(yesterday, today);

      expect(filtered.length).toBe(2);
      expect(filtered.some((s) => s.sessionId === '2')).toBe(true);
      expect(filtered.some((s) => s.sessionId === '3')).toBe(true);
    });
  });

  describe('getSessionsByTheme', () => {
    it('should filter sessions by theme', () => {
      const sessions: HistoricalSession[] = [
        {
          sessionId: '1',
          theme: 'JavaScript',
          date: new Date(),
          wpm: 40,
          accuracy: 90,
          duration: 300,
          errorCount: 10,
          keyboardLayout: 'QWERTY',
        },
        {
          sessionId: '2',
          theme: 'Python',
          date: new Date(),
          wpm: 50,
          accuracy: 92,
          duration: 300,
          errorCount: 8,
          keyboardLayout: 'QWERTY',
        },
        {
          sessionId: '3',
          theme: 'JavaScript Advanced',
          date: new Date(),
          wpm: 60,
          accuracy: 95,
          duration: 300,
          errorCount: 5,
          keyboardLayout: 'QWERTY',
        },
      ];

      sessions.forEach((session) => useMetricsStore.getState().addSession(session));

      const filtered = useMetricsStore.getState().getSessionsByTheme('JavaScript');

      expect(filtered.length).toBe(2);
      expect(filtered.every((s) => s.theme.toLowerCase().includes('javascript'))).toBe(true);
    });
  });

  describe('getBestSession', () => {
    it('should return session with highest WPM and accuracy >= 90%', () => {
      const sessions: HistoricalSession[] = [
        {
          sessionId: '1',
          theme: 'Test',
          date: new Date(),
          wpm: 70,
          accuracy: 85,
          duration: 300,
          errorCount: 15,
          keyboardLayout: 'QWERTY',
        },
        {
          sessionId: '2',
          theme: 'Test',
          date: new Date(),
          wpm: 60,
          accuracy: 95,
          duration: 300,
          errorCount: 5,
          keyboardLayout: 'QWERTY',
        },
        {
          sessionId: '3',
          theme: 'Test',
          date: new Date(),
          wpm: 65,
          accuracy: 92,
          duration: 300,
          errorCount: 8,
          keyboardLayout: 'QWERTY',
        },
      ];

      sessions.forEach((session) => useMetricsStore.getState().addSession(session));

      const best = useMetricsStore.getState().getBestSession();

      expect(best?.sessionId).toBe('3'); // Highest WPM with accuracy >= 90%
    });

    it('should return highest WPM if no sessions have 90%+ accuracy', () => {
      const sessions: HistoricalSession[] = [
        {
          sessionId: '1',
          theme: 'Test',
          date: new Date(),
          wpm: 70,
          accuracy: 85,
          duration: 300,
          errorCount: 15,
          keyboardLayout: 'QWERTY',
        },
        {
          sessionId: '2',
          theme: 'Test',
          date: new Date(),
          wpm: 60,
          accuracy: 88,
          duration: 300,
          errorCount: 12,
          keyboardLayout: 'QWERTY',
        },
      ];

      sessions.forEach((session) => useMetricsStore.getState().addSession(session));

      const best = useMetricsStore.getState().getBestSession();

      expect(best?.sessionId).toBe('1'); // Highest WPM overall
    });

    it('should return null for empty history', () => {
      const best = useMetricsStore.getState().getBestSession();
      expect(best).toBeNull();
    });
  });

  describe('getRecentSessions', () => {
    it('should return most recent sessions', () => {
      const sessions: HistoricalSession[] = Array.from({ length: 10 }, (_, i) => ({
        sessionId: `${i}`,
        theme: 'Test',
        date: new Date(),
        wpm: 50 + i,
        accuracy: 90,
        duration: 300,
        errorCount: 5,
        keyboardLayout: 'QWERTY' as const,
      }));

      sessions.forEach((session) => useMetricsStore.getState().addSession(session));

      const recent = useMetricsStore.getState().getRecentSessions(5);

      expect(recent.length).toBe(5);
      // Most recent should be first (last added)
      expect(recent[0].sessionId).toBe('9');
    });
  });

  describe('clearOldSessions', () => {
    it('should remove sessions older than specified days', () => {
      const today = new Date();
      const tenDaysAgo = new Date(today);
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
      const fiveDaysAgo = new Date(today);
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

      const sessions: HistoricalSession[] = [
        {
          sessionId: '1',
          theme: 'Test',
          date: tenDaysAgo,
          wpm: 40,
          accuracy: 90,
          duration: 300,
          errorCount: 10,
          keyboardLayout: 'QWERTY',
        },
        {
          sessionId: '2',
          theme: 'Test',
          date: fiveDaysAgo,
          wpm: 50,
          accuracy: 92,
          duration: 300,
          errorCount: 8,
          keyboardLayout: 'QWERTY',
        },
        {
          sessionId: '3',
          theme: 'Test',
          date: today,
          wpm: 60,
          accuracy: 95,
          duration: 300,
          errorCount: 5,
          keyboardLayout: 'QWERTY',
        },
      ];

      sessions.forEach((session) => useMetricsStore.getState().addSession(session));

      const removedCount = useMetricsStore.getState().clearOldSessions(7);

      expect(removedCount).toBe(1);
      expect(useMetricsStore.getState().sessionHistory.length).toBe(2);
    });
  });

  describe('exportData and importData', () => {
    it('should export and import data correctly', () => {
      const sessions: HistoricalSession[] = [
        {
          sessionId: '1',
          theme: 'JavaScript',
          date: new Date(),
          wpm: 50,
          accuracy: 95,
          duration: 300,
          errorCount: 5,
          keyboardLayout: 'QWERTY',
        },
      ];

      sessions.forEach((session) => useMetricsStore.getState().addSession(session));

      const exportedData = useMetricsStore.getState().exportData();

      // Clear and import
      useMetricsStore.getState().clearHistory();
      expect(useMetricsStore.getState().sessionHistory.length).toBe(0);

      const success = useMetricsStore.getState().importData(exportedData);

      expect(success).toBe(true);
      expect(useMetricsStore.getState().sessionHistory.length).toBe(1);
      expect(useMetricsStore.getState().averageWPM).toBe(50);
    });

    it('should handle invalid import data', () => {
      const success = useMetricsStore.getState().importData('invalid json');
      expect(success).toBe(false);
    });
  });

  describe('trend calculations', () => {
    it('should show improvement trend in WPM', () => {
      const sessions: HistoricalSession[] = [
        {
          sessionId: '1',
          theme: 'Test',
          date: new Date(Date.now() - 86400000 * 2), // 2 days ago
          wpm: 40,
          accuracy: 90,
          duration: 300,
          errorCount: 10,
          keyboardLayout: 'QWERTY',
        },
        {
          sessionId: '2',
          theme: 'Test',
          date: new Date(Date.now() - 86400000), // 1 day ago
          wpm: 50,
          accuracy: 92,
          duration: 300,
          errorCount: 8,
          keyboardLayout: 'QWERTY',
        },
        {
          sessionId: '3',
          theme: 'Test',
          date: new Date(),
          wpm: 60,
          accuracy: 95,
          duration: 300,
          errorCount: 5,
          keyboardLayout: 'QWERTY',
        },
      ];

      sessions.forEach((session) => useMetricsStore.getState().addSession(session));

      const history = useMetricsStore.getState().sessionHistory;

      // Verify sessions are in order (newest first)
      expect(history[0].wpm).toBeGreaterThan(history[1].wpm);
      expect(history[1].wpm).toBeGreaterThan(history[2].wpm);
    });
  });
});
