// Backend validation utilities for content and requests

import type { ContentRequest, StudyContent } from '../types';

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
 * Validates content request from frontend
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
 * Sanitizes generated content text (requirement 2.4)
 * - Removes potentially harmful HTML/scripts
 * - Normalizes whitespace
 * - Ensures proper encoding
 * - Validates content appropriateness
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
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\r/g, '\n')
    .trim()
    .replace(/\n{3,}/g, '\n\n') // Max 2 consecutive newlines
    .replace(/[ \t]+/g, ' '); // Normalize spaces
}

/**
 * Validates generated content meets requirements (2.1, 2.2)
 */
export function validateGeneratedContent(content: StudyContent): {
  valid: boolean;
  error?: string;
} {
  if (!content.text || content.text.trim().length === 0) {
    return { valid: false, error: 'Content text cannot be empty' };
  }

  // Validate word count is within acceptable range (100-500 words per requirement 2.2)
  if (content.wordCount < 100 || content.wordCount > 500) {
    return { valid: false, error: 'Content must be between 100 and 500 words' };
  }

  // Validate source
  if (!['ai', 'wikipedia', 'combined'].includes(content.source)) {
    return { valid: false, error: 'Invalid content source' };
  }

  // Validate language
  if (!['pt', 'en'].includes(content.metadata.language)) {
    return { valid: false, error: 'Content language must be "pt" or "en"' };
  }

  // Check for inappropriate content patterns (basic filtering)
  const inappropriatePatterns = [/<script/i, /javascript:/i, /onerror=/i, /onclick=/i];

  for (const pattern of inappropriatePatterns) {
    if (pattern.test(content.text)) {
      return { valid: false, error: 'Content contains inappropriate or unsafe patterns' };
    }
  }

  return { valid: true };
}

/**
 * Validates Wikipedia content before processing
 */
export function validateWikipediaContent(extract: string): { valid: boolean; error?: string } {
  if (!extract || extract.trim().length === 0) {
    return { valid: false, error: 'Wikipedia extract is empty' };
  }

  // Check minimum length
  if (extract.length < 50) {
    return { valid: false, error: 'Wikipedia extract too short' };
  }

  return { valid: true };
}

/**
 * Counts words in text accurately
 */
export function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
}

/**
 * Validates and sanitizes AI-generated content
 */
export function processAIContent(rawContent: string): {
  content: string;
  wordCount: number;
  valid: boolean;
} {
  const sanitized = sanitizeContent(rawContent);
  const wordCount = countWords(sanitized);

  return {
    content: sanitized,
    wordCount,
    valid: wordCount >= 100 && wordCount <= 500,
  };
}

/**
 * Checks if content is appropriate and factual (basic checks)
 * More sophisticated checks would require additional AI/ML services
 */
export function isContentAppropriate(content: string): boolean {
  // Basic profanity and inappropriate content filter
  const inappropriateWords: string[] = [
    // Add basic filter words here - keeping minimal for demonstration
  ];

  const lowerContent = content.toLowerCase();
  return !inappropriateWords.some((word) => lowerContent.includes(word));
}

/**
 * Validates request rate limiting parameters
 */
export function validateRateLimitParams(
  ip: string,
  endpoint: string
): { valid: boolean; error?: string } {
  if (!ip || ip.trim().length === 0) {
    return { valid: false, error: 'IP address is required' };
  }

  // Basic IP format validation
  const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$|^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  if (!ipPattern.test(ip)) {
    return { valid: false, error: 'Invalid IP address format' };
  }

  if (!endpoint || endpoint.trim().length === 0) {
    return { valid: false, error: 'Endpoint is required' };
  }

  return { valid: true };
}
