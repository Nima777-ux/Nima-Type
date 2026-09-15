import { FingerName, ErrorType } from '../types';

export const FINGER_NAMES: { id: FingerName; label: string; hand: 'left' | 'right' | 'thumb' }[] = [
  { id: 'left_pinky', label: 'L. Pinky', hand: 'left' },
  { id: 'left_ring', label: 'L. Ring', hand: 'left' },
  { id: 'left_middle', label: 'L. Middle', hand: 'left' },
  { id: 'left_index', label: 'L. Index', hand: 'left' },
  { id: 'thumb', label: 'Thumbs', hand: 'thumb' },
  { id: 'right_index', label: 'R. Index', hand: 'right' },
  { id: 'right_middle', label: 'R. Middle', hand: 'right' },
  { id: 'right_ring', label: 'R. Ring', hand: 'right' },
  { id: 'right_pinky', label: 'R. Pinky', hand: 'right' },
];

export const KEY_TO_FINGER: Record<string, FingerName> = {
  // Numbers & Symbols row
  'Digit1': 'left_pinky',
  'Backquote': 'left_pinky',
  'Digit2': 'left_ring',
  'Digit3': 'left_middle',
  'Digit4': 'left_index',
  'Digit5': 'left_index',
  'Digit6': 'right_index',
  'Digit7': 'right_index',
  'Digit8': 'right_middle',
  'Digit9': 'right_ring',
  'Digit0': 'right_pinky',
  'Minus': 'right_pinky',
  'Equal': 'right_pinky',
  'Backspace': 'right_pinky',

  // Top letter row
  'Tab': 'left_pinky',
  'KeyQ': 'left_pinky',
  'KeyW': 'left_ring',
  'KeyE': 'left_middle',
  'KeyR': 'left_index',
  'KeyT': 'left_index',
  'KeyY': 'right_index',
  'KeyU': 'right_index',
  'KeyI': 'right_middle',
  'KeyO': 'right_ring',
  'KeyP': 'right_pinky',
  'BracketLeft': 'right_pinky',
  'BracketRight': 'right_pinky',
  'Backslash': 'right_pinky',

  // Home letter row
  'CapsLock': 'left_pinky',
  'KeyA': 'left_pinky',
  'KeyS': 'left_ring',
  'KeyD': 'left_middle',
  'KeyF': 'left_index',
  'KeyG': 'left_index',
  'KeyH': 'right_index',
  'KeyJ': 'right_index',
  'KeyK': 'right_middle',
  'KeyL': 'right_ring',
  'Semicolon': 'right_pinky',
  'Quote': 'right_pinky',
  'Enter': 'right_pinky',

  // Bottom letter row
  'ShiftLeft': 'left_pinky',
  'KeyZ': 'left_pinky',
  'KeyX': 'left_ring',
  'KeyC': 'left_middle',
  'KeyV': 'left_index',
  'KeyB': 'left_index',
  'KeyN': 'right_index',
  'KeyM': 'right_index',
  'Comma': 'right_middle',
  'Period': 'right_ring',
  'Slash': 'right_pinky',
  'ShiftRight': 'right_pinky',

  // Modifiers & Space
  'Space': 'thumb',
  'AltLeft': 'thumb',
  'AltRight': 'thumb',
};

// Fallback lookup by lowercase character
export const CHAR_TO_FINGER: Record<string, FingerName> = {
  'q': 'left_pinky', 'a': 'left_pinky', 'z': 'left_pinky', '1': 'left_pinky', '`': 'left_pinky', '~': 'left_pinky', '!': 'left_pinky',
  'w': 'left_ring', 's': 'left_ring', 'x': 'left_ring', '2': 'left_ring', '@': 'left_ring',
  'e': 'left_middle', 'd': 'left_middle', 'c': 'left_middle', '3': 'left_middle', '#': 'left_middle',
  'r': 'left_index', 'f': 'left_index', 'v': 'left_index', 't': 'left_index', 'g': 'left_index', 'b': 'left_index', '4': 'left_index', '5': 'left_index', '$': 'left_index', '%': 'left_index',
  ' ': 'thumb',
  'y': 'right_index', 'h': 'right_index', 'n': 'right_index', 'u': 'right_index', 'j': 'right_index', 'm': 'right_index', '6': 'right_index', '7': 'right_index', '^': 'right_index', '&': 'right_index',
  'i': 'right_middle', 'k': 'right_middle', ',': 'right_middle', '<': 'right_middle', '8': 'right_middle', '*': 'right_middle',
  'o': 'right_ring', 'l': 'right_ring', '.': 'right_ring', '>': 'right_ring', '9': 'right_ring', '(': 'right_ring',
  'p': 'right_pinky', ';': 'right_pinky', ':': 'right_pinky', '/': 'right_pinky', '?': 'right_pinky', '\'': 'right_pinky', '"': 'right_pinky',
  '[': 'right_pinky', '{': 'right_pinky', ']': 'right_pinky', '}': 'right_pinky', '\\': 'right_pinky', '|': 'right_pinky',
  '0': 'right_pinky', ')': 'right_pinky', '-': 'right_pinky', '_': 'right_pinky', '=': 'right_pinky', '+': 'right_pinky',

  // Persian Standard (ISIRI 9147) keyboard layout mappings:
  'ض': 'left_pinky', 'ش': 'left_pinky', 'ظ': 'left_pinky',
  'ص': 'left_ring', 'س': 'left_ring', 'ط': 'left_ring',
  'ث': 'left_middle', 'ی': 'left_middle', 'ي': 'left_middle', 'ز': 'left_middle',
  'ق': 'left_index', 'ف': 'left_index', 'ب': 'left_index', 'ل': 'left_index', 'ر': 'left_index', 'ذ': 'left_index',
  'غ': 'right_index', 'ع': 'right_index', 'ت': 'right_index', 'ا': 'right_index', 'آ': 'right_index', 'د': 'right_index', 'ئ': 'right_index',
  'ه': 'right_middle', 'ن': 'right_middle', 'و': 'right_middle',
  'خ': 'right_ring', 'م': 'right_ring',
  'ح': 'right_pinky', 'ج': 'right_pinky', 'چ': 'right_pinky', 'پ': 'right_pinky', 'ک': 'right_pinky', 'گ': 'right_pinky', 'ژ': 'right_pinky',
  '،': 'right_middle', '؛': 'right_pinky', '؟': 'right_pinky', 'ـ': 'thumb', '\u200C': 'thumb', // Zero-width non-joiner
};

export function getFingerForKey(code?: string, key?: string): FingerName {
  if (code && KEY_TO_FINGER[code]) {
    return KEY_TO_FINGER[code];
  }
  if (key) {
    const lower = key.toLowerCase();
    if (CHAR_TO_FINGER[lower]) return CHAR_TO_FINGER[lower];
  }
  return 'right_index';
}

/**
 * Classifies error type between expected character and actual typed character
 */
export function classifyError(
  typed: string,
  expected: string,
  nextExpected?: string,
  prevExpected?: string
): ErrorType {
  // Case error (e.g. 'a' instead of 'A' or vice versa)
  if (typed.toLowerCase() === expected.toLowerCase()) {
    return 'case';
  }

  // Transposition error (swapped adjacent letter, e.g. typed next letter ahead of time)
  if (nextExpected && typed === nextExpected) {
    return 'transposition';
  }

  // Normal substitution error (wrong key entirely)
  return 'substitution';
}
