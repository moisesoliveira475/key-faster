import { describe, expect, it } from 'vitest';
import type { TypingError } from '../types';
import {
  analyzeBigramErrors,
  analyzeErrorClustering,
  analyzeErrorPatterns,
  getErrorStatistics,
  getProblematicKeys,
} from './errorAnalysis';

describe('errorAnalysis', () => {
  describe('analyzeErrorPatterns', () => {
    it('should return empty array for no errors', () => {
      const patterns = analyzeErrorPatterns([]);
      expect(patterns).toEqual([]);
    });

    it('should identify substitution errors', () => {
      const errors: TypingError[] = [
        {
          position: 0,
          expectedChar: 'a',
          typedChar: 's',
          timestamp: new Date(),
          corrected: false,
        },
        {
          position: 5,
          expectedChar: 'a',
          typedChar: 's',
          timestamp: new Date(),
          corrected: false,
        },
      ];

      const patterns = analyzeErrorPatterns(errors);

      expect(patterns.length).toBeGreaterThan(0);
      const substitutionPattern = patterns.find((p) => p.errorType === 'substitution');
      expect(substitutionPattern).toBeDefined();
      expect(substitutionPattern?.frequency).toBe(2);
      expect(substitutionPattern?.commonMistakes[0]).toEqual({
        expected: 'a',
        typed: 's',
        count: 2,
      });
    });

    it('should identify omission errors', () => {
      const errors: TypingError[] = [
        {
          position: 0,
          expectedChar: 'h',
          typedChar: '',
          timestamp: new Date(),
          corrected: false,
        },
        {
          position: 5,
          expectedChar: 'e',
          typedChar: '',
          timestamp: new Date(),
          corrected: false,
        },
      ];

      const patterns = analyzeErrorPatterns(errors);

      const omissionPattern = patterns.find((p) => p.errorType === 'omission');
      expect(omissionPattern).toBeDefined();
      expect(omissionPattern?.frequency).toBe(2);
    });

    it('should identify insertion errors', () => {
      const errors: TypingError[] = [
        {
          position: 0,
          expectedChar: '',
          typedChar: 'x',
          timestamp: new Date(),
          corrected: false,
        },
      ];

      const patterns = analyzeErrorPatterns(errors);

      const insertionPattern = patterns.find((p) => p.errorType === 'insertion');
      expect(insertionPattern).toBeDefined();
      expect(insertionPattern?.frequency).toBe(1);
    });

    it('should sort patterns by frequency', () => {
      const errors: TypingError[] = [
        { position: 0, expectedChar: 'a', typedChar: 's', timestamp: new Date(), corrected: false },
        { position: 1, expectedChar: 'b', typedChar: 'v', timestamp: new Date(), corrected: false },
        { position: 2, expectedChar: 'c', typedChar: '', timestamp: new Date(), corrected: false },
        { position: 3, expectedChar: 'd', typedChar: '', timestamp: new Date(), corrected: false },
        { position: 4, expectedChar: 'e', typedChar: '', timestamp: new Date(), corrected: false },
      ];

      const patterns = analyzeErrorPatterns(errors);

      // Omissions (3) should come before substitutions (2)
      expect(patterns[0].frequency).toBeGreaterThanOrEqual(patterns[1]?.frequency || 0);
    });
  });

  describe('getProblematicKeys', () => {
    it('should return empty array for no errors', () => {
      const keys = getProblematicKeys([]);
      expect(keys).toEqual([]);
    });

    it('should identify most problematic keys', () => {
      const errors: TypingError[] = [
        { position: 0, expectedChar: 'a', typedChar: 's', timestamp: new Date(), corrected: false },
        { position: 1, expectedChar: 'a', typedChar: 's', timestamp: new Date(), corrected: false },
        { position: 2, expectedChar: 'a', typedChar: 's', timestamp: new Date(), corrected: false },
        { position: 3, expectedChar: 'b', typedChar: 'v', timestamp: new Date(), corrected: false },
        { position: 4, expectedChar: 'b', typedChar: 'v', timestamp: new Date(), corrected: false },
        { position: 5, expectedChar: 'c', typedChar: 'x', timestamp: new Date(), corrected: false },
      ];

      const keys = getProblematicKeys(errors);

      expect(keys.length).toBeGreaterThan(0);
      expect(keys[0]).toBe('a'); // Most frequent error
      expect(keys[1]).toBe('b'); // Second most frequent
    });

    it('should limit to top 5 problematic keys', () => {
      const errors: TypingError[] = Array.from({ length: 10 }, (_, i) => ({
        position: i,
        expectedChar: String.fromCharCode(97 + i), // a-j
        typedChar: 'x',
        timestamp: new Date(),
        corrected: false,
      }));

      const keys = getProblematicKeys(errors);

      expect(keys.length).toBeLessThanOrEqual(5);
    });
  });

  describe('analyzeBigramErrors', () => {
    it('should identify bigrams with errors', () => {
      const content = 'the quick brown fox';
      const errors: TypingError[] = [
        { position: 4, expectedChar: 'q', typedChar: 'w', timestamp: new Date(), corrected: false },
      ];

      const bigramErrors = analyzeBigramErrors(errors, content);

      expect(bigramErrors.length).toBeGreaterThan(0);
      expect(bigramErrors[0].bigram).toBe(' q');
      expect(bigramErrors[0].errorCount).toBe(1);
    });

    it('should calculate error rates correctly', () => {
      const content = 'the the the';
      const errors: TypingError[] = [
        { position: 1, expectedChar: 'h', typedChar: 'g', timestamp: new Date(), corrected: false },
        { position: 5, expectedChar: 'h', typedChar: 'g', timestamp: new Date(), corrected: false },
      ];

      const bigramErrors = analyzeBigramErrors(errors, content);

      const thBigram = bigramErrors.find((b) => b.bigram === 'th');
      expect(thBigram).toBeDefined();
      expect(thBigram?.errorRate).toBeGreaterThan(0);
    });

    it('should return empty array for no errors', () => {
      const content = 'hello world';
      const errors: TypingError[] = [];

      const bigramErrors = analyzeBigramErrors(errors, content);

      expect(bigramErrors).toEqual([]);
    });
  });

  describe('analyzeErrorClustering', () => {
    it('should divide content into chunks and identify error density', () => {
      const contentLength = 100;
      const errors: TypingError[] = [
        { position: 5, expectedChar: 'a', typedChar: 'b', timestamp: new Date(), corrected: false },
        { position: 6, expectedChar: 'c', typedChar: 'd', timestamp: new Date(), corrected: false },
        { position: 7, expectedChar: 'e', typedChar: 'f', timestamp: new Date(), corrected: false },
      ];

      const clusters = analyzeErrorClustering(errors, contentLength);

      expect(clusters.length).toBe(10);
      expect(clusters[0].errorDensity).toBeGreaterThan(0);
    });

    it('should sort chunks by error density', () => {
      const contentLength = 100;
      const errors: TypingError[] = [
        { position: 5, expectedChar: 'a', typedChar: 'b', timestamp: new Date(), corrected: false },
        {
          position: 95,
          expectedChar: 'c',
          typedChar: 'd',
          timestamp: new Date(),
          corrected: false,
        },
      ];

      const clusters = analyzeErrorClustering(errors, contentLength);

      // First chunk should have highest or equal density
      expect(clusters[0].errorDensity).toBeGreaterThanOrEqual(clusters[1]?.errorDensity || 0);
    });
  });

  describe('getErrorStatistics', () => {
    it('should calculate basic error statistics', () => {
      const errors: TypingError[] = [
        { position: 0, expectedChar: 'a', typedChar: 'b', timestamp: new Date(), corrected: true },
        { position: 1, expectedChar: 'c', typedChar: 'd', timestamp: new Date(), corrected: false },
        { position: 2, expectedChar: 'e', typedChar: 'f', timestamp: new Date(), corrected: false },
      ];

      const stats = getErrorStatistics(errors);

      expect(stats.totalErrors).toBe(3);
      expect(stats.correctedErrors).toBe(1);
      expect(stats.uncorrectedErrors).toBe(2);
      expect(stats.correctionRate).toBeCloseTo(33.33, 1);
    });

    it('should handle no errors', () => {
      const stats = getErrorStatistics([]);

      expect(stats.totalErrors).toBe(0);
      expect(stats.correctedErrors).toBe(0);
      expect(stats.uncorrectedErrors).toBe(0);
      expect(stats.correctionRate).toBe(0);
    });

    it('should calculate average time between errors', () => {
      const now = Date.now();
      const errors: TypingError[] = [
        {
          position: 0,
          expectedChar: 'a',
          typedChar: 'b',
          timestamp: new Date(now),
          corrected: false,
        },
        {
          position: 1,
          expectedChar: 'c',
          typedChar: 'd',
          timestamp: new Date(now + 2000),
          corrected: false,
        },
        {
          position: 2,
          expectedChar: 'e',
          typedChar: 'f',
          timestamp: new Date(now + 4000),
          corrected: false,
        },
      ];

      const stats = getErrorStatistics(errors);

      expect(stats.avgTimeBetweenErrors).toBeCloseTo(2, 0);
    });
  });
});
