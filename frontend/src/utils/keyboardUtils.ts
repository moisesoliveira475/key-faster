import {
  DEFAULT_LAYOUT,
  getKeyboardLayout,
  isValidKeyboardLayout,
} from '../config/keyboardLayouts';
import type { KeyboardLayoutType } from '../types';

/**
 * Map a physical key to its character based on the keyboard layout
 */
export function mapKeyToChar(key: string, layout: KeyboardLayoutType): string {
  const keyboardLayout = getKeyboardLayout(layout);
  const lowerKey = key.toLowerCase();

  // Return the mapped character or the original key if not found
  return keyboardLayout.keyMapping[lowerKey] || key;
}

/**
 * Check if a typed character matches the expected character for the given layout
 */
export function isCharacterMatch(
  typedChar: string,
  expectedChar: string,
  layout: KeyboardLayoutType
): boolean {
  // Normalize both characters to lowercase for comparison
  const normalizedTyped = typedChar.toLowerCase();
  const normalizedExpected = expectedChar.toLowerCase();

  // Direct match
  if (normalizedTyped === normalizedExpected) {
    return true;
  }

  // Check if the typed character maps to the expected character in the layout
  const mappedChar = mapKeyToChar(normalizedTyped, layout);
  return mappedChar === normalizedExpected;
}

/**
 * Get the next expected character based on current position
 */
export function getExpectedChar(content: string, position: number): string | null {
  if (position >= content.length) {
    return null;
  }
  return content[position];
}

/**
 * Validate and sanitize keyboard layout selection
 */
export function validateKeyboardLayout(layout: string): KeyboardLayoutType {
  if (isValidKeyboardLayout(layout)) {
    return layout;
  }
  console.warn(`Invalid keyboard layout "${layout}", falling back to ${DEFAULT_LAYOUT}`);
  return DEFAULT_LAYOUT;
}

/**
 * Get keyboard layout from user preferences or browser
 */
export function getPreferredKeyboardLayout(
  userPreference?: KeyboardLayoutType
): KeyboardLayoutType {
  // Use user preference if valid
  if (userPreference && isValidKeyboardLayout(userPreference)) {
    return userPreference;
  }

  // Try to detect from browser (limited support)
  try {
    const navigatorLayout = (navigator as any).keyboard?.getLayoutMap?.();
    if (navigatorLayout) {
      // This is experimental and not widely supported
      // For now, just return default
      return DEFAULT_LAYOUT;
    }
  } catch (_error) {
    console.debug('Keyboard layout detection not supported');
  }

  return DEFAULT_LAYOUT;
}

/**
 * Switch keyboard layout and notify about the change
 */
export function switchKeyboardLayout(
  newLayout: KeyboardLayoutType,
  onLayoutChange?: (layout: KeyboardLayoutType) => void
): KeyboardLayoutType {
  const validatedLayout = validateKeyboardLayout(newLayout);

  if (onLayoutChange) {
    onLayoutChange(validatedLayout);
  }

  return validatedLayout;
}

/**
 * Get visual representation of a key for display
 */
export function getKeyDisplay(char: string): string {
  const specialKeys: Record<string, string> = {
    ' ': 'Space',
    '\n': 'Enter',
    '\t': 'Tab',
  };

  return specialKeys[char] || char;
}

/**
 * Check if a character is typeable (not a control character)
 */
export function isTypeableChar(char: string): boolean {
  // Allow letters, numbers, punctuation, and space
  // Exclude control characters
  const code = char.charCodeAt(0);
  return code >= 32 && code <= 126;
}

/**
 * Normalize text for typing practice
 * Removes or replaces characters that might cause issues
 */
export function normalizeTextForTyping(text: string): string {
  return text
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\t/g, '  ') // Replace tabs with spaces
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
    .trim();
}
