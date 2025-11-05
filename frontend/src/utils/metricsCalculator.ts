import type { SessionMetrics, TypingError } from '../types';

/**
 * Calculate Words Per Minute (WPM)
 * Standard: 1 word = 5 characters
 */
export const calculateWPM = (charactersTyped: number, timeElapsedSeconds: number): number => {
  if (timeElapsedSeconds === 0) return 0;

  const minutes = timeElapsedSeconds / 60;
  const words = charactersTyped / 5;
  const wpm = Math.round(words / minutes);

  return Math.max(0, wpm);
};

/**
 * Calculate typing accuracy as a percentage
 */
export const calculateAccuracy = (correctCharacters: number, totalCharacters: number): number => {
  if (totalCharacters === 0) return 100;

  const accuracy = (correctCharacters / totalCharacters) * 100;
  return Math.round(accuracy * 100) / 100; // Round to 2 decimal places
};

/**
 * Calculate keystrokes per minute
 */
export const calculateKeystrokesPerMinute = (
  totalKeystrokes: number,
  timeElapsedSeconds: number
): number => {
  if (timeElapsedSeconds === 0) return 0;

  const minutes = timeElapsedSeconds / 60;
  const kpm = Math.round(totalKeystrokes / minutes);

  return Math.max(0, kpm);
};

/**
 * Calculate real-time metrics for a typing session
 */
export const calculateRealTimeMetrics = (
  typedText: string,
  _expectedText: string,
  errors: TypingError[],
  startTime: Date,
  _isPaused: boolean = false
): SessionMetrics => {
  const now = new Date();
  const timeElapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);

  const totalCharacters = typedText.length;
  const correctCharacters = totalCharacters - errors.filter((e) => !e.corrected).length;
  const errorCount = errors.length;

  const wpm = calculateWPM(totalCharacters, timeElapsed);
  const accuracy = calculateAccuracy(correctCharacters, totalCharacters);
  const keystrokesPerMinute = calculateKeystrokesPerMinute(totalCharacters, timeElapsed);

  // Calculate average WPM (same as current for now, can be enhanced with historical data)
  const averageWPM = wpm;

  return {
    wpm,
    averageWPM,
    accuracy,
    totalCharacters,
    correctCharacters,
    errorCount,
    timeElapsed,
    keystrokesPerMinute,
  };
};

/**
 * Format time in seconds to MM:SS format
 */
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Calculate net WPM (accounting for errors)
 */
export const calculateNetWPM = (
  charactersTyped: number,
  errorCount: number,
  timeElapsedSeconds: number
): number => {
  if (timeElapsedSeconds === 0) return 0;

  const minutes = timeElapsedSeconds / 60;
  const words = charactersTyped / 5;
  const errorPenalty = errorCount / 5; // Each error counts as 1 character, or 0.2 words
  const netWords = Math.max(0, words - errorPenalty);
  const netWPM = Math.round(netWords / minutes);

  return Math.max(0, netWPM);
};
