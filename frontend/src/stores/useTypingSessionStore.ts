import { create } from 'zustand';
import type { SessionMetrics, StudyContent, TypingError, UserSession } from '../types';

interface TypingSessionState {
  // Current session data
  currentSession: UserSession | null;
  isSessionActive: boolean;
  isPaused: boolean;
  lastAutoSave: Date | null;
  pauseTimer: number | null;
  autoSaveTimer: number | null;

  // Actions
  startSession: (content: StudyContent, theme: string, keyboardLayout: string) => void;
  endSession: () => void;
  pauseSession: () => void;
  resumeSession: () => void;
  updateProgress: (position: number, typedText: string) => void;
  addError: (error: TypingError) => void;
  updateMetrics: (metrics: Partial<SessionMetrics>) => void;
  resetSession: () => void;
  autoSaveSession: () => void;
  recoverSession: () => UserSession | null;
  clearRecoveryData: () => void;
  setupAutoPause: (delay: number) => void;
  clearAutoPause: () => void;
  setupAutoSave: () => void;
  clearAutoSave: () => void;
}

const initialMetrics: SessionMetrics = {
  wpm: 0,
  averageWPM: 0,
  accuracy: 100,
  totalCharacters: 0,
  correctCharacters: 0,
  errorCount: 0,
  timeElapsed: 0,
  keystrokesPerMinute: 0,
};

const RECOVERY_KEY = 'typing_study_session_recovery';
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

export const useTypingSessionStore = create<TypingSessionState>((set, get) => ({
  currentSession: null,
  isSessionActive: false,
  isPaused: false,
  lastAutoSave: null,
  pauseTimer: null,
  autoSaveTimer: null,

  startSession: (content, theme, keyboardLayout) => {
    const { clearAutoPause, clearAutoSave } = get();

    // Clear any existing timers
    clearAutoPause();
    clearAutoSave();

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

    const newSession: UserSession = {
      sessionId,
      theme,
      keyboardLayout: keyboardLayout as any,
      startTime: new Date(),
      isActive: true,
      content: content.text,
      userProgress: {
        currentPosition: 0,
        typedText: '',
        errors: [],
      },
      metrics: { ...initialMetrics },
    };

    set({
      currentSession: newSession,
      isSessionActive: true,
      isPaused: false,
    });

    // Setup auto-save for the new session
    get().setupAutoSave();

    // Auto-save immediately on start
    get().autoSaveSession();
  },

  endSession: () => {
    const { currentSession, clearAutoPause, clearAutoSave, clearRecoveryData } = get();
    if (!currentSession) return;

    // Clear timers
    clearAutoPause();
    clearAutoSave();

    const endedSession: UserSession = {
      ...currentSession,
      endTime: new Date(),
      isActive: false,
    };

    set({
      currentSession: endedSession,
      isSessionActive: false,
      isPaused: false,
    });

    // Clear recovery data since session ended normally
    clearRecoveryData();
  },

  pauseSession: () => {
    const { clearAutoPause, autoSaveSession } = get();

    // Clear any existing pause timer
    clearAutoPause();

    set({ isPaused: true });

    // Auto-save when pausing
    autoSaveSession();
  },

  resumeSession: () => {
    const { setupAutoPause, autoSaveSession } = get();

    set({ isPaused: false });

    // Reset auto-pause timer
    setupAutoPause(10); // Default 10 seconds

    // Auto-save when resuming
    autoSaveSession();
  },

  updateProgress: (position, typedText) => {
    const { currentSession, setupAutoPause } = get();
    if (!currentSession) return;

    set({
      currentSession: {
        ...currentSession,
        userProgress: {
          ...currentSession.userProgress,
          currentPosition: position,
          typedText,
        },
      },
    });

    // Reset auto-pause timer on activity
    setupAutoPause(10); // Default 10 seconds
  },

  addError: (error) => {
    const { currentSession } = get();
    if (!currentSession) return;

    set({
      currentSession: {
        ...currentSession,
        userProgress: {
          ...currentSession.userProgress,
          errors: [...currentSession.userProgress.errors, error],
        },
        metrics: {
          ...currentSession.metrics,
          errorCount: currentSession.metrics.errorCount + 1,
        },
      },
    });
  },

  updateMetrics: (metrics) => {
    const { currentSession } = get();
    if (!currentSession) return;

    set({
      currentSession: {
        ...currentSession,
        metrics: {
          ...currentSession.metrics,
          ...metrics,
        },
      },
    });
  },

  resetSession: () => {
    const { clearAutoPause, clearAutoSave, clearRecoveryData } = get();

    // Clear all timers
    clearAutoPause();
    clearAutoSave();

    set({
      currentSession: null,
      isSessionActive: false,
      isPaused: false,
    });

    // Clear recovery data
    clearRecoveryData();
  },

  autoSaveSession: () => {
    const { currentSession } = get();
    if (!currentSession || !currentSession.isActive) return;

    try {
      // Save session to localStorage for recovery
      const sessionData = {
        ...currentSession,
        startTime: currentSession.startTime.toISOString(),
        endTime: currentSession.endTime?.toISOString(),
        userProgress: {
          ...currentSession.userProgress,
          errors: currentSession.userProgress.errors.map((error) => ({
            ...error,
            timestamp: error.timestamp.toISOString(),
          })),
        },
      };

      localStorage.setItem(RECOVERY_KEY, JSON.stringify(sessionData));
      set({ lastAutoSave: new Date() });

      console.log('Session auto-saved at', new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Failed to auto-save session:', error);
    }
  },

  recoverSession: () => {
    try {
      const savedData = localStorage.getItem(RECOVERY_KEY);
      if (!savedData) return null;

      const sessionData = JSON.parse(savedData);

      // Convert ISO strings back to Date objects
      const recoveredSession: UserSession = {
        ...sessionData,
        startTime: new Date(sessionData.startTime),
        endTime: sessionData.endTime ? new Date(sessionData.endTime) : undefined,
        userProgress: {
          ...sessionData.userProgress,
          errors: sessionData.userProgress.errors.map((error: any) => ({
            ...error,
            timestamp: new Date(error.timestamp),
          })),
        },
      };

      // Only recover if session was active
      if (recoveredSession.isActive) {
        set({
          currentSession: recoveredSession,
          isSessionActive: true,
          isPaused: false,
        });

        // Setup auto-save for recovered session
        get().setupAutoSave();

        console.log('Session recovered successfully');
        return recoveredSession;
      }

      return null;
    } catch (error) {
      console.error('Failed to recover session:', error);
      return null;
    }
  },

  clearRecoveryData: () => {
    try {
      localStorage.removeItem(RECOVERY_KEY);
    } catch (error) {
      console.error('Failed to clear recovery data:', error);
    }
  },

  setupAutoPause: (delay: number) => {
    const { pauseTimer, pauseSession, isPaused } = get();

    // Don't setup if already paused
    if (isPaused) return;

    // Clear existing timer
    if (pauseTimer) {
      clearTimeout(pauseTimer);
    }

    // Setup new timer
    const timer = setTimeout(() => {
      pauseSession();
      console.log('Session auto-paused due to inactivity');
    }, delay * 1000);

    set({ pauseTimer: timer });
  },

  clearAutoPause: () => {
    const { pauseTimer } = get();
    if (pauseTimer) {
      clearTimeout(pauseTimer);
      set({ pauseTimer: null });
    }
  },

  setupAutoSave: () => {
    const { clearAutoSave, autoSaveSession } = get();

    // Clear existing timer
    clearAutoSave();

    // Setup periodic auto-save
    const timer = setInterval(() => {
      autoSaveSession();
    }, AUTO_SAVE_INTERVAL);

    set({ autoSaveTimer: timer });
  },

  clearAutoSave: () => {
    const { autoSaveTimer } = get();
    if (autoSaveTimer) {
      clearInterval(autoSaveTimer);
      set({ autoSaveTimer: null });
    }
  },
}));
