/**
 * Optimized store hooks with shallow comparison
 * Prevents unnecessary re-renders when using Zustand stores
 */

import { useCallback } from 'react';
import { useMetricsStore } from '../stores/useMetricsStore';
import { usePreferencesStore } from '../stores/usePreferencesStore';
import { useTypingSessionStore } from '../stores/useTypingSessionStore';

/**
 * Optimized hook for typing session store
 * Only re-renders when selected values actually change
 */
export function useOptimizedTypingSession() {
  const currentSession = useTypingSessionStore(useCallback((state) => state.currentSession, []));
  const isSessionActive = useTypingSessionStore(useCallback((state) => state.isSessionActive, []));
  const isPaused = useTypingSessionStore(useCallback((state) => state.isPaused, []));

  const startSession = useTypingSessionStore(useCallback((state) => state.startSession, []));
  const endSession = useTypingSessionStore(useCallback((state) => state.endSession, []));
  const pauseSession = useTypingSessionStore(useCallback((state) => state.pauseSession, []));
  const resumeSession = useTypingSessionStore(useCallback((state) => state.resumeSession, []));
  const updateProgress = useTypingSessionStore(useCallback((state) => state.updateProgress, []));
  const addError = useTypingSessionStore(useCallback((state) => state.addError, []));
  const updateMetrics = useTypingSessionStore(useCallback((state) => state.updateMetrics, []));

  return {
    currentSession,
    isSessionActive,
    isPaused,
    startSession,
    endSession,
    pauseSession,
    resumeSession,
    updateProgress,
    addError,
    updateMetrics,
  };
}

/**
 * Optimized hook for metrics store
 * Only re-renders when selected values actually change
 */
export function useOptimizedMetrics() {
  const sessionHistory = useMetricsStore(useCallback((state) => state.sessionHistory, []));
  const averageWPM = useMetricsStore(useCallback((state) => state.averageWPM, []));
  const averageAccuracy = useMetricsStore(useCallback((state) => state.averageAccuracy, []));
  const totalSessions = useMetricsStore(useCallback((state) => state.totalSessions, []));
  const totalPracticeTime = useMetricsStore(useCallback((state) => state.totalPracticeTime, []));

  const addSession = useMetricsStore(useCallback((state) => state.addSession, []));
  const getBestSession = useMetricsStore(useCallback((state) => state.getBestSession, []));
  const getRecentSessions = useMetricsStore(useCallback((state) => state.getRecentSessions, []));

  return {
    sessionHistory,
    averageWPM,
    averageAccuracy,
    totalSessions,
    totalPracticeTime,
    addSession,
    getBestSession,
    getRecentSessions,
  };
}

/**
 * Optimized hook for preferences store
 * Only re-renders when selected values actually change
 */
export function useOptimizedPreferences() {
  const keyboardLayout = usePreferencesStore(useCallback((state) => state.keyboardLayout, []));
  const highlightErrors = usePreferencesStore(useCallback((state) => state.highlightErrors, []));
  const autoPauseDelay = usePreferencesStore(useCallback((state) => state.autoPauseDelay, []));
  const recentThemes = usePreferencesStore(useCallback((state) => state.recentThemes, []));

  const setKeyboardLayout = usePreferencesStore(
    useCallback((state) => state.setKeyboardLayout, [])
  );
  const setHighlightErrors = usePreferencesStore(
    useCallback((state) => state.setHighlightErrors, [])
  );
  const setAutoPauseDelay = usePreferencesStore(
    useCallback((state) => state.setAutoPauseDelay, [])
  );
  const addRecentTheme = usePreferencesStore(useCallback((state) => state.addRecentTheme, []));

  return {
    keyboardLayout,
    highlightErrors,
    autoPauseDelay,
    recentThemes,
    setKeyboardLayout,
    setHighlightErrors,
    setAutoPauseDelay,
    addRecentTheme,
  };
}

/**
 * Hook to get only current session metrics (most frequently updated)
 * Optimized for real-time updates during typing
 */
export function useCurrentMetrics() {
  return useTypingSessionStore(useCallback((state) => state.currentSession?.metrics, []));
}

/**
 * Hook to get only session status (active/paused)
 * Optimized for components that only need status
 */
export function useSessionStatus() {
  const isSessionActive = useTypingSessionStore(useCallback((state) => state.isSessionActive, []));
  const isPaused = useTypingSessionStore(useCallback((state) => state.isPaused, []));

  return { isSessionActive, isPaused };
}
