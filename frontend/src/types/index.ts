// Core Data Models for Typing Study App

/**
 * Represents a typing error made during a session
 */
export interface TypingError {
  position: number;
  expectedChar: string;
  typedChar: string;
  timestamp: Date;
  corrected: boolean;
}

/**
 * Pattern of errors identified during analysis
 */
export interface ErrorPattern {
  errorType: 'substitution' | 'omission' | 'insertion';
  frequency: number;
  commonMistakes: { expected: string; typed: string; count: number }[];
}

/**
 * Real-time and cumulative metrics for a typing session
 */
export interface SessionMetrics {
  wpm: number;
  averageWPM: number;
  accuracy: number;
  totalCharacters: number;
  correctCharacters: number;
  errorCount: number;
  timeElapsed: number; // in seconds
  keystrokesPerMinute: number;
}

/**
 * Content generated or fetched for typing practice
 */
export interface StudyContent {
  id: string;
  theme: string;
  text: string;
  source: 'ai' | 'wikipedia' | 'combined';
  difficulty: number;
  wordCount: number;
  estimatedTime: number; // in minutes
  createdAt: Date;
  metadata: {
    aiModel?: string;
    wikipediaArticle?: string;
    language: string;
  };
}

/**
 * Complete user typing session with progress and metrics
 */
export interface UserSession {
  sessionId: string;
  userId?: string; // Optional for guest users
  theme: string;
  keyboardLayout: KeyboardLayoutType;
  startTime: Date;
  endTime?: Date;
  isActive: boolean;
  content: string;
  userProgress: {
    currentPosition: number;
    typedText: string;
    errors: TypingError[];
  };
  metrics: SessionMetrics;
}

/**
 * Supported keyboard layout types
 */
export type KeyboardLayoutType = 'QWERTY' | 'DVORAK' | 'AZERTY';

/**
 * Keyboard layout configuration
 */
export interface KeyboardLayout {
  id: KeyboardLayoutType;
  name: string;
  description: string;
  keyMapping: Record<string, string>;
}

/**
 * Theme selection and management
 */
export interface ThemeSelection {
  id: string;
  name: string;
  category?: string;
  isCustom: boolean;
  lastUsed?: Date;
  usageCount: number;
}

/**
 * User preferences stored locally
 */
export interface UserPreferences {
  keyboardLayout: KeyboardLayoutType;
  recentThemes: ThemeSelection[];
  highlightErrors: boolean;
  autoPause: boolean;
  autoPauseDelay: number; // in seconds
  language: 'pt' | 'en';
}

/**
 * Historical session data for progress tracking
 */
export interface HistoricalSession {
  sessionId: string;
  theme: string;
  date: Date;
  wpm: number;
  accuracy: number;
  duration: number; // in seconds
  errorCount: number;
  keyboardLayout: KeyboardLayoutType;
}

/**
 * Content generation request
 */
export interface ContentRequest {
  theme: string;
  length: number; // word count
  language: 'pt' | 'en';
  difficulty?: 'easy' | 'medium' | 'hard';
}

/**
 * Content generation response from backend
 */
export interface ContentResponse {
  content: StudyContent;
  success: boolean;
  error?: string;
}
