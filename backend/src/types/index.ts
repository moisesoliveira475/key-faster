// Core Data Models for Typing Study App - Backend

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
  userId?: string;
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
 * Content generation request from frontend
 */
export interface ContentRequest {
  theme: string;
  length: number;
  language: 'pt' | 'en';
  difficulty?: 'easy' | 'medium' | 'hard';
}

/**
 * Generated content from AI service
 */
export interface GeneratedContent {
  text: string;
  source: 'ai';
  wordCount: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

/**
 * Wikipedia content fetch result
 */
export interface WikipediaContent {
  title: string;
  extract: string;
  url: string;
  wordCount: number;
}

/**
 * Content service response
 */
export interface ContentResponse {
  content: StudyContent;
  success: boolean;
  error?: string;
}
