import type { StudyContent } from '../types';

/**
 * Content processing utilities for formatting and preparing content for typing practice
 */

export interface ProcessedContent {
  original: string;
  formatted: string;
  wordCount: number;
  characterCount: number;
  estimatedTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  difficultyScore: number;
}

/**
 * Process and format content for typing practice
 */
export function processContent(content: StudyContent): ProcessedContent {
  const formatted = formatTextForTyping(content.text);
  const wordCount = countWords(formatted);
  const characterCount = formatted.length;
  const difficulty = calculateDifficulty(formatted, wordCount);
  const estimatedTime = calculateEstimatedTime(wordCount);

  return {
    original: content.text,
    formatted,
    wordCount,
    characterCount,
    estimatedTime,
    difficulty: difficulty.level,
    difficultyScore: difficulty.score,
  };
}

/**
 * Format text for typing practice
 * - Remove extra whitespace
 * - Normalize line breaks
 * - Remove special formatting characters
 */
export function formatTextForTyping(text: string): string {
  return text
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\n\s*\n/g, '\n\n') // Normalize paragraph breaks
    .trim();
}

/**
 * Count words in text
 */
export function countWords(text: string): number {
  return text.split(/\s+/).filter((word) => word.length > 0).length;
}

/**
 * Calculate difficulty based on text characteristics
 */
export function calculateDifficulty(
  text: string,
  wordCount: number
): { level: 'easy' | 'medium' | 'hard'; score: number } {
  // Factors that affect difficulty
  const avgWordLength = text.replace(/\s/g, '').length / wordCount;
  const specialCharCount = (text.match(/[^a-zA-Z0-9\s]/g) || []).length;
  const specialCharRatio = specialCharCount / text.length;
  const uppercaseRatio = (text.match(/[A-Z]/g) || []).length / text.length;
  const numberCount = (text.match(/[0-9]/g) || []).length;

  // Calculate difficulty score (0-100)
  let score = 0;

  // Word length factor (0-30 points)
  if (avgWordLength < 4) score += 0;
  else if (avgWordLength < 5) score += 10;
  else if (avgWordLength < 6) score += 20;
  else score += 30;

  // Special characters factor (0-25 points)
  score += Math.min(specialCharRatio * 100, 25);

  // Uppercase factor (0-15 points)
  score += Math.min(uppercaseRatio * 50, 15);

  // Numbers factor (0-15 points)
  score += Math.min((numberCount / text.length) * 100, 15);

  // Text length factor (0-15 points)
  if (wordCount > 400) score += 15;
  else if (wordCount > 250) score += 10;
  else if (wordCount > 150) score += 5;

  // Determine level
  let level: 'easy' | 'medium' | 'hard';
  if (score < 30) level = 'easy';
  else if (score < 60) level = 'medium';
  else level = 'hard';

  return { level, score: Math.round(score) };
}

/**
 * Calculate estimated typing time based on word count
 * Assumes average typing speed of 40 WPM
 */
export function calculateEstimatedTime(wordCount: number, averageWPM: number = 40): number {
  return Math.ceil(wordCount / averageWPM);
}

/**
 * Get difficulty color for UI display
 */
export function getDifficultyColor(difficulty: 'easy' | 'medium' | 'hard'): string {
  switch (difficulty) {
    case 'easy':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'medium':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'hard':
      return 'text-red-600 bg-red-50 border-red-200';
  }
}

/**
 * Get difficulty label for display
 */
export function getDifficultyLabel(difficulty: 'easy' | 'medium' | 'hard'): string {
  switch (difficulty) {
    case 'easy':
      return 'Easy';
    case 'medium':
      return 'Medium';
    case 'hard':
      return 'Hard';
  }
}

/**
 * Truncate text to a specific word count
 */
export function truncateToWordCount(text: string, maxWords: number): string {
  const words = text.split(/\s+/);
  if (words.length <= maxWords) return text;

  return `${words.slice(0, maxWords).join(' ')}...`;
}

/**
 * Extract preview text (first N words)
 */
export function getPreviewText(text: string, wordCount: number = 20): string {
  return truncateToWordCount(text, wordCount);
}
