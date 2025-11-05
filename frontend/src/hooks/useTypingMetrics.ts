import { useEffect, useRef, useState } from 'react';
import { usePreferencesStore } from '../stores/usePreferencesStore';
import { useTypingSessionStore } from '../stores/useTypingSessionStore';
import { calculateRealTimeMetrics } from '../utils/metricsCalculator';

/**
 * Hook for managing real-time typing metrics and auto-pause functionality
 */
export const useTypingMetrics = () => {
  const { currentSession, isSessionActive, isPaused, updateMetrics, pauseSession } =
    useTypingSessionStore();

  const { autoPause, autoPauseDelay } = usePreferencesStore();

  const [lastKeystrokeTime, setLastKeystrokeTime] = useState<Date | null>(null);
  const metricsIntervalRef = useRef<number | null>(null);
  const autoPauseTimeoutRef = useRef<number | null>(null);

  // Update metrics every second
  useEffect(() => {
    if (!isSessionActive || isPaused || !currentSession) {
      if (metricsIntervalRef.current) {
        clearInterval(metricsIntervalRef.current);
        metricsIntervalRef.current = null;
      }
      return;
    }

    metricsIntervalRef.current = setInterval(() => {
      const metrics = calculateRealTimeMetrics(
        currentSession.userProgress.typedText,
        currentSession.content,
        currentSession.userProgress.errors,
        currentSession.startTime,
        isPaused
      );

      updateMetrics(metrics);
    }, 1000);

    return () => {
      if (metricsIntervalRef.current) {
        clearInterval(metricsIntervalRef.current);
      }
    };
  }, [isSessionActive, isPaused, currentSession, updateMetrics]);

  // Auto-pause functionality
  useEffect(() => {
    if (!autoPause || !isSessionActive || isPaused || !lastKeystrokeTime) {
      if (autoPauseTimeoutRef.current) {
        clearTimeout(autoPauseTimeoutRef.current);
        autoPauseTimeoutRef.current = null;
      }
      return;
    }

    // Clear existing timeout
    if (autoPauseTimeoutRef.current) {
      clearTimeout(autoPauseTimeoutRef.current);
    }

    // Set new timeout for auto-pause
    autoPauseTimeoutRef.current = setTimeout(() => {
      pauseSession();
    }, autoPauseDelay * 1000);

    return () => {
      if (autoPauseTimeoutRef.current) {
        clearTimeout(autoPauseTimeoutRef.current);
      }
    };
  }, [lastKeystrokeTime, autoPause, autoPauseDelay, isSessionActive, isPaused, pauseSession]);

  // Function to be called on each keystroke
  const recordKeystroke = () => {
    setLastKeystrokeTime(new Date());
  };

  // Calculate and return current metrics immediately
  const getCurrentMetrics = () => {
    if (!currentSession) return null;

    return calculateRealTimeMetrics(
      currentSession.userProgress.typedText,
      currentSession.content,
      currentSession.userProgress.errors,
      currentSession.startTime,
      isPaused
    );
  };

  return {
    recordKeystroke,
    getCurrentMetrics,
    lastKeystrokeTime,
  };
};
