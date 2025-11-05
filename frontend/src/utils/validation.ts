// Validation utilities for user input and session data

import type { ContentRequest, SessionMetrics, UserSession } from '../types';

/**
 * Validates theme input according to requirements (1.4)
 * - Maximum 100 characters
 * - Accepts Portuguese and English characters
 * - No special characters that could cause issues
 */
export function validateTheme(theme: string): { valid: boolean; error?: string } {
  if (!theme || theme.trim().length === 0) {
    return { valid: false, error: 'Theme cannot be empty' };
  }

  if (theme.length > 100) {
    return { valid: false, error: 'Theme must be 100 characters or less' };
  }

  // Allow alphanumeric, spaces, and common punctuation in PT/EN
  const validPattern = /^[a-zA-ZÀ-ÿ0-9\s\-.,!?()]+$/;
  if (!validPattern.test(theme)) {
    return { valid: false, error: 'Theme contains invalid characters' };
  }

  return { valid: true };
}

/**
 * Sanitizes theme input by removing potentially harmful content
 */
export function sanitizeTheme(theme: string): string {
  return theme
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .slice(0, 100); // Enforce max length
}

/**
 * Validates content request parameters
 */
export function validateContentRequest(request: ContentRequest): {
  valid: boolean;
  error?: string;
} {
  const themeValidation = validateTheme(request.theme);
  if (!themeValidation.valid) {
    return themeValidation;
  }

  if (request.length < 100 || request.length > 500) {
    return { valid: false, error: 'Content length must be between 100 and 500 words' };
  }

  if (!['pt', 'en'].includes(request.language)) {
    return { valid: false, error: 'Language must be "pt" or "en"' };
  }

  if (request.difficulty && !['easy', 'medium', 'hard'].includes(request.difficulty)) {
    return { valid: false, error: 'Difficulty must be "easy", "medium", or "hard"' };
  }

  return { valid: true };
}

/**
 * Sanitizes generated content text
 * - Removes potentially harmful HTML/scripts
 * - Normalizes whitespace
 * - Ensures proper encoding
 */
export function sanitizeContent(content: string): string {
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim()
    .replace(/\s+/g, ' '); // Normalize whitespace
}

/**
 * Validates session metrics for consistency
 */
export function validateSessionMetrics(metrics: SessionMetrics): {
  valid: boolean;
  error?: string;
} {
  if (metrics.wpm < 0 || metrics.averageWPM < 0) {
    return { valid: false, error: 'WPM values cannot be negative' };
  }

  if (metrics.accuracy < 0 || metrics.accuracy > 100) {
    return { valid: false, error: 'Accuracy must be between 0 and 100' };
  }

  if (metrics.correctCharacters > metrics.totalCharacters) {
    return { valid: false, error: 'Correct characters cannot exceed total characters' };
  }

  if (metrics.errorCount < 0) {
    return { valid: false, error: 'Error count cannot be negative' };
  }

  if (metrics.timeElapsed < 0) {
    return { valid: false, error: 'Time elapsed cannot be negative' };
  }

  return { valid: true };
}

/**
 * Validates user session data structure
 */
export function validateUserSession(session: UserSession): { valid: boolean; error?: string } {
  if (!session.sessionId || session.sessionId.trim().length === 0) {
    return { valid: false, error: 'Session ID is required' };
  }

  const themeValidation = validateTheme(session.theme);
  if (!themeValidation.valid) {
    return themeValidation;
  }

  if (!['QWERTY', 'DVORAK', 'AZERTY'].includes(session.keyboardLayout)) {
    return { valid: false, error: 'Invalid keyboard layout' };
  }

  if (session.endTime && session.endTime < session.startTime) {
    return { valid: false, error: 'End time cannot be before start time' };
  }

  const metricsValidation = validateSessionMetrics(session.metrics);
  if (!metricsValidation.valid) {
    return metricsValidation;
  }

  return { valid: true };
}

/**
 * Validates user input character during typing
 * Returns whether the character is valid for typing practice
 */
export function validateTypingInput(char: string): boolean {
  // Allow printable ASCII characters and common accented characters
  const validPattern = /^[\x20-\x7E\u00C0-\u00FF]$/;
  return validPattern.test(char);
}

/**
 * Sanitizes user preferences data
 */
export function sanitizeUserPreferences(preferences: any): any {
  return {
    keyboardLayout: ['QWERTY', 'DVORAK', 'AZERTY'].includes(preferences.keyboardLayout)
      ? preferences.keyboardLayout
      : 'QWERTY',
    recentThemes: Array.isArray(preferences.recentThemes)
      ? preferences.recentThemes.slice(0, 10).map((theme: any) => ({
          ...theme,
          name: sanitizeTheme(theme.name || ''),
        }))
      : [],
    highlightErrors: Boolean(preferences.highlightErrors),
    autoPause: Boolean(preferences.autoPause),
    autoPauseDelay: Math.max(5, Math.min(60, Number(preferences.autoPauseDelay) || 10)),
    language: ['pt', 'en'].includes(preferences.language) ? preferences.language : 'pt',
  };
}
