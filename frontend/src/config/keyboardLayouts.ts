import type { KeyboardLayout, KeyboardLayoutType } from '../types';

/**
 * Standard QWERTY keyboard layout
 * Most common layout used worldwide
 */
const QWERTY_LAYOUT: KeyboardLayout = {
  id: 'QWERTY',
  name: 'QWERTY',
  description: 'Standard QWERTY keyboard layout',
  keyMapping: {
    // Row 1 (numbers)
    '`': '`',
    '1': '1',
    '2': '2',
    '3': '3',
    '4': '4',
    '5': '5',
    '6': '6',
    '7': '7',
    '8': '8',
    '9': '9',
    '0': '0',
    '-': '-',
    '=': '=',
    // Row 2
    q: 'q',
    w: 'w',
    e: 'e',
    r: 'r',
    t: 't',
    y: 'y',
    u: 'u',
    i: 'i',
    o: 'o',
    p: 'p',
    '[': '[',
    ']': ']',
    '\\': '\\',
    // Row 3
    a: 'a',
    s: 's',
    d: 'd',
    f: 'f',
    g: 'g',
    h: 'h',
    j: 'j',
    k: 'k',
    l: 'l',
    ';': ';',
    "'": "'",
    // Row 4
    z: 'z',
    x: 'x',
    c: 'c',
    v: 'v',
    b: 'b',
    n: 'n',
    m: 'm',
    ',': ',',
    '.': '.',
    '/': '/',
    // Space
    ' ': ' ',
  },
};

/**
 * Dvorak Simplified Keyboard layout
 * Designed for efficiency and reduced finger movement
 */
const DVORAK_LAYOUT: KeyboardLayout = {
  id: 'DVORAK',
  name: 'Dvorak',
  description: 'Dvorak Simplified Keyboard layout',
  keyMapping: {
    // Row 1 (numbers) - same as QWERTY
    '`': '`',
    '1': '1',
    '2': '2',
    '3': '3',
    '4': '4',
    '5': '5',
    '6': '6',
    '7': '7',
    '8': '8',
    '9': '9',
    '0': '0',
    '[': '[',
    ']': ']',
    // Row 2 - Dvorak specific
    "'": "'",
    ',': ',',
    '.': '.',
    p: 'p',
    y: 'y',
    f: 'f',
    g: 'g',
    c: 'c',
    r: 'r',
    l: 'l',
    '/': '/',
    '=': '=',
    '\\': '\\',
    // Row 3 - Dvorak specific
    a: 'a',
    o: 'o',
    e: 'e',
    u: 'u',
    i: 'i',
    d: 'd',
    h: 'h',
    t: 't',
    n: 'n',
    s: 's',
    '-': '-',
    // Row 4 - Dvorak specific
    ';': ';',
    q: 'q',
    j: 'j',
    k: 'k',
    x: 'x',
    b: 'b',
    m: 'm',
    w: 'w',
    v: 'v',
    z: 'z',
    // Space
    ' ': ' ',
  },
};

/**
 * AZERTY keyboard layout
 * Common in French-speaking countries
 */
const AZERTY_LAYOUT: KeyboardLayout = {
  id: 'AZERTY',
  name: 'AZERTY',
  description: 'AZERTY keyboard layout (French)',
  keyMapping: {
    // Row 1 (numbers) - AZERTY specific
    '²': '²',
    '&': '&',
    é: 'é',
    '"': '"',
    "'": "'",
    '(': '(',
    '-': '-',
    è: 'è',
    _: '_',
    ç: 'ç',
    à: 'à',
    ')': ')',
    '=': '=',
    // Row 2 - AZERTY specific
    a: 'a',
    z: 'z',
    e: 'e',
    r: 'r',
    t: 't',
    y: 'y',
    u: 'u',
    i: 'i',
    o: 'o',
    p: 'p',
    '^': '^',
    $: '$',
    '*': '*',
    // Row 3 - AZERTY specific
    q: 'q',
    s: 's',
    d: 'd',
    f: 'f',
    g: 'g',
    h: 'h',
    j: 'j',
    k: 'k',
    l: 'l',
    m: 'm',
    ù: 'ù',
    // Row 4 - AZERTY specific
    w: 'w',
    x: 'x',
    c: 'c',
    v: 'v',
    b: 'b',
    n: 'n',
    ',': ',',
    ';': ';',
    ':': ':',
    '!': '!',
    // Space
    ' ': ' ',
  },
};

/**
 * Map of all available keyboard layouts
 */
export const KEYBOARD_LAYOUTS: Record<KeyboardLayoutType, KeyboardLayout> = {
  QWERTY: QWERTY_LAYOUT,
  DVORAK: DVORAK_LAYOUT,
  AZERTY: AZERTY_LAYOUT,
};

/**
 * Default keyboard layout
 */
export const DEFAULT_LAYOUT: KeyboardLayoutType = 'QWERTY';

/**
 * Get keyboard layout by type
 */
export function getKeyboardLayout(layoutType: KeyboardLayoutType): KeyboardLayout {
  return KEYBOARD_LAYOUTS[layoutType] || KEYBOARD_LAYOUTS[DEFAULT_LAYOUT];
}

/**
 * Get all available keyboard layouts
 */
export function getAllKeyboardLayouts(): KeyboardLayout[] {
  return Object.values(KEYBOARD_LAYOUTS);
}

/**
 * Detect keyboard layout based on key press patterns
 * This is a simplified detection - in practice, browser APIs don't provide reliable layout detection
 */
export function detectKeyboardLayout(): KeyboardLayoutType {
  // For now, return default layout
  // In a real implementation, this could use heuristics based on user typing patterns
  return DEFAULT_LAYOUT;
}

/**
 * Validate if a keyboard layout type is supported
 */
export function isValidKeyboardLayout(layout: string): layout is KeyboardLayoutType {
  return layout === 'QWERTY' || layout === 'DVORAK' || layout === 'AZERTY';
}

/**
 * Get the physical key position for a character in a given layout
 * Useful for visual keyboard preview
 */
export function getKeyPosition(
  char: string,
  _layout: KeyboardLayoutType
): { row: number; col: number } | null {
  const lowerChar = char.toLowerCase();

  // Define key positions (row, col) for QWERTY physical layout
  const positions: Record<string, { row: number; col: number }> = {
    // Row 0 (number row)
    '`': { row: 0, col: 0 },
    '1': { row: 0, col: 1 },
    '2': { row: 0, col: 2 },
    '3': { row: 0, col: 3 },
    '4': { row: 0, col: 4 },
    '5': { row: 0, col: 5 },
    '6': { row: 0, col: 6 },
    '7': { row: 0, col: 7 },
    '8': { row: 0, col: 8 },
    '9': { row: 0, col: 9 },
    '0': { row: 0, col: 10 },
    '-': { row: 0, col: 11 },
    '=': { row: 0, col: 12 },
    // Row 1
    q: { row: 1, col: 0 },
    w: { row: 1, col: 1 },
    e: { row: 1, col: 2 },
    r: { row: 1, col: 3 },
    t: { row: 1, col: 4 },
    y: { row: 1, col: 5 },
    u: { row: 1, col: 6 },
    i: { row: 1, col: 7 },
    o: { row: 1, col: 8 },
    p: { row: 1, col: 9 },
    '[': { row: 1, col: 10 },
    ']': { row: 1, col: 11 },
    '\\': { row: 1, col: 12 },
    // Row 2
    a: { row: 2, col: 0 },
    s: { row: 2, col: 1 },
    d: { row: 2, col: 2 },
    f: { row: 2, col: 3 },
    g: { row: 2, col: 4 },
    h: { row: 2, col: 5 },
    j: { row: 2, col: 6 },
    k: { row: 2, col: 7 },
    l: { row: 2, col: 8 },
    ';': { row: 2, col: 9 },
    "'": { row: 2, col: 10 },
    // Row 3
    z: { row: 3, col: 0 },
    x: { row: 3, col: 1 },
    c: { row: 3, col: 2 },
    v: { row: 3, col: 3 },
    b: { row: 3, col: 4 },
    n: { row: 3, col: 5 },
    m: { row: 3, col: 6 },
    ',': { row: 3, col: 7 },
    '.': { row: 3, col: 8 },
    '/': { row: 3, col: 9 },
    // Space bar
    ' ': { row: 4, col: 5 },
  };

  return positions[lowerChar] || null;
}
