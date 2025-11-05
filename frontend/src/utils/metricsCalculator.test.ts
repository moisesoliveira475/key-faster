import { describe, expect, it } from 'vitest';
import type { TypingError } from '../types';
import {
  calculateAccuracy,
  calculateKeystrokesPerMinute,
  calculateNetWPM,
  calculateRealTimeMetrics,
  calculateWPM,
  formatTime,
} from './metricsCalculator';

describe('metricsCalculator', () => {
  describe('calculateWPM', () => {
    it('should calculate WPM correctly for standard typing', () => {
      // 50 characters in 60 seconds = 10 words/minute (5 chars = 1 word)
      expect(calculateWPM(50, 60)).toBe(10);
    });

    it('should calculate WPM for faster typing', () => {
      // 100 characters in 30 seconds = 40 WPM
      expect(calculateWPM(100, 30)).toBe(40);
    });

    it('should return 0 when time elapsed is 0', () => {
      expect(calculateWPM(50, 0)).toBe(0);
    });

    it('should handle fractional minutes correctly', () => {
      // 75 characters in 45 seconds (0.75 minutes) = 20 WPM
      expect(calculateWPM(75, 45)).toBe(20);
    });

    it('should never return negative WPM', () => {
      expect(calculateWPM(0, 60)).toBe(0);
    });
  });

  describe('calculateAccuracy', () => {
    it('should calculate 100% accuracy for perfect typing', () => {
      expect(calculateAccuracy(50, 50)).toBe(100);
    });

    it('should calculate accuracy with errors', () => {
      // 45 correct out of 50 total = 90%
      expect(calculateAccuracy(45, 50)).toBe(90);
    });

    it('should return 100% when no characters typed', () => {
      expect(calculateAccuracy(0, 0)).toBe(100);
    });

    it('should round to 2 decimal places', () => {
      // 47 correct out of 50 = 94%
      expect(calculateAccuracy(47, 50)).toBe(94);
    });

    it('should handle low accuracy correctly', () => {
      // 10 correct out of 100 = 10%
      expect(calculateAccuracy(10, 100)).toBe(10);
    });
  });

  describe('calculateKeystrokesPerMinute', () => {
    it('should calculate KPM correctly', () => {
      // 120 keystrokes in 60 seconds = 120 KPM
      expect(calculateKeystrokesPerMinute(120, 60)).toBe(120);
    });

    it('should return 0 when time elapsed is 0', () => {
      expect(calculateKeystrokesPerMinute(100, 0)).toBe(0);
    });

    it('should handle fractional minutes', () => {
      // 90 keystrokes in 30 seconds = 180 KPM
      expect(calculateKeystrokesPerMinute(90, 30)).toBe(180);
    });
  });

  describe('calculateNetWPM', () => {
    it('should calculate net WPM with no errors', () => {
      // 50 characters in 60 seconds with 0 errors = 10 WPM
      expect(calculateNetWPM(50, 0, 60)).toBe(10);
    });

    it('should penalize errors in net WPM calculation', () => {
      // 50 characters in 60 seconds with 5 errors
      // Gross WPM = 10, Error penalty = 1, Net WPM = 9
      expect(calculateNetWPM(50, 5, 60)).toBe(9);
    });

    it('should never return negative net WPM', () => {
      // Many errors should result in 0, not negative
      expect(calculateNetWPM(50, 100, 60)).toBe(0);
    });

    it('should return 0 when time elapsed is 0', () => {
      expect(calculateNetWPM(50, 5, 0)).toBe(0);
    });
  });

  describe('calculateRealTimeMetrics', () => {
    it('should calculate all metrics correctly for active session', () => {
      const startTime = new Date(Date.now() - 60000); // 60 seconds ago
      const typedText = 'Hello world this is a test';
      const expectedText = 'Hello world this is a test';
      const errors: TypingError[] = [];

      const metrics = calculateRealTimeMetrics(typedText, expectedText, errors, startTime, false);

      expect(metrics.totalCharacters).toBe(26);
      expect(metrics.correctCharacters).toBe(26);
      expect(metrics.errorCount).toBe(0);
      expect(metrics.accuracy).toBe(100);
      expect(metrics.timeElapsed).toBeGreaterThanOrEqual(60);
      expect(metrics.wpm).toBeGreaterThan(0);
    });

    it('should handle errors in metrics calculation', () => {
      const startTime = new Date(Date.now() - 30000); // 30 seconds ago
      const typedText = 'Hello wrld';
      const expectedText = 'Hello world';
      const errors: TypingError[] = [
        {
          position: 6,
          expectedChar: 'o',
          typedChar: '',
          timestamp: new Date(),
          corrected: false,
        },
      ];

      const metrics = calculateRealTimeMetrics(typedText, expectedText, errors, startTime, false);

      expect(metrics.totalCharacters).toBe(10);
      expect(metrics.correctCharacters).toBe(9);
      expect(metrics.errorCount).toBe(1);
      expect(metrics.accuracy).toBeLessThan(100);
    });

    it('should not count corrected errors in accuracy', () => {
      const startTime = new Date(Date.now() - 30000);
      const typedText = 'Hello world';
      const expectedText = 'Hello world';
      const errors: TypingError[] = [
        {
          position: 6,
          expectedChar: 'w',
          typedChar: 'q',
          timestamp: new Date(),
          corrected: true,
        },
      ];

      const metrics = calculateRealTimeMetrics(typedText, expectedText, errors, startTime, false);

      expect(metrics.correctCharacters).toBe(11);
      expect(metrics.accuracy).toBe(100);
    });
  });

  describe('formatTime', () => {
    it('should format seconds to MM:SS', () => {
      expect(formatTime(0)).toBe('00:00');
      expect(formatTime(30)).toBe('00:30');
      expect(formatTime(60)).toBe('01:00');
      expect(formatTime(125)).toBe('02:05');
      expect(formatTime(3661)).toBe('61:01');
    });
  });
});
