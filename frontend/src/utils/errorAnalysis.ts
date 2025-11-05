import type { ErrorPattern, TypingError } from '../types';

/**
 * Analyze typing errors to identify patterns and common mistakes
 */
export const analyzeErrorPatterns = (errors: TypingError[]): ErrorPattern[] => {
  if (errors.length === 0) return [];

  const patterns: ErrorPattern[] = [];

  // Group errors by type
  const substitutions: TypingError[] = [];
  const omissions: TypingError[] = [];
  const insertions: TypingError[] = [];

  errors.forEach((error) => {
    if (error.typedChar === '' || error.typedChar === null) {
      omissions.push(error);
    } else if (error.expectedChar === '' || error.expectedChar === null) {
      insertions.push(error);
    } else {
      substitutions.push(error);
    }
  });

  // Analyze substitution errors
  if (substitutions.length > 0) {
    const mistakeMap = new Map<string, number>();

    substitutions.forEach((error) => {
      const key = `${error.expectedChar}->${error.typedChar}`;
      mistakeMap.set(key, (mistakeMap.get(key) || 0) + 1);
    });

    const commonMistakes = Array.from(mistakeMap.entries())
      .map(([key, count]) => {
        const [expected, typed] = key.split('->');
        return { expected, typed, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 mistakes

    patterns.push({
      errorType: 'substitution',
      frequency: substitutions.length,
      commonMistakes,
    });
  }

  // Analyze omission errors
  if (omissions.length > 0) {
    const mistakeMap = new Map<string, number>();

    omissions.forEach((error) => {
      const key = error.expectedChar;
      mistakeMap.set(key, (mistakeMap.get(key) || 0) + 1);
    });

    const commonMistakes = Array.from(mistakeMap.entries())
      .map(([expected, count]) => ({
        expected,
        typed: '',
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    patterns.push({
      errorType: 'omission',
      frequency: omissions.length,
      commonMistakes,
    });
  }

  // Analyze insertion errors
  if (insertions.length > 0) {
    const mistakeMap = new Map<string, number>();

    insertions.forEach((error) => {
      const key = error.typedChar;
      mistakeMap.set(key, (mistakeMap.get(key) || 0) + 1);
    });

    const commonMistakes = Array.from(mistakeMap.entries())
      .map(([typed, count]) => ({
        expected: '',
        typed,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    patterns.push({
      errorType: 'insertion',
      frequency: insertions.length,
      commonMistakes,
    });
  }

  return patterns.sort((a, b) => b.frequency - a.frequency);
};

/**
 * Get the most problematic keys based on error patterns
 */
export const getProblematicKeys = (errors: TypingError[]): string[] => {
  const keyErrorCount = new Map<string, number>();

  errors.forEach((error) => {
    const key = error.expectedChar;
    keyErrorCount.set(key, (keyErrorCount.get(key) || 0) + 1);
  });

  return Array.from(keyErrorCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([key]) => key);
};

/**
 * Calculate error rate for specific character pairs (bigrams)
 */
export const analyzeBigramErrors = (
  errors: TypingError[],
  content: string
): Array<{ bigram: string; errorCount: number; totalOccurrences: number; errorRate: number }> => {
  const bigramErrors = new Map<string, number>();
  const bigramCounts = new Map<string, number>();

  // Count all bigrams in content
  for (let i = 0; i < content.length - 1; i++) {
    const bigram = content.substring(i, i + 2);
    bigramCounts.set(bigram, (bigramCounts.get(bigram) || 0) + 1);
  }

  // Count errors in bigrams
  errors.forEach((error) => {
    if (error.position > 0) {
      const bigram = content.substring(error.position - 1, error.position + 1);
      bigramErrors.set(bigram, (bigramErrors.get(bigram) || 0) + 1);
    }
  });

  // Calculate error rates
  const results = Array.from(bigramErrors.entries())
    .map(([bigram, errorCount]) => {
      const totalOccurrences = bigramCounts.get(bigram) || 1;
      const errorRate = (errorCount / totalOccurrences) * 100;
      return { bigram, errorCount, totalOccurrences, errorRate };
    })
    .sort((a, b) => b.errorRate - a.errorRate)
    .slice(0, 10);

  return results;
};

/**
 * Identify if errors are clustered in specific positions
 */
export const analyzeErrorClustering = (
  errors: TypingError[],
  contentLength: number
): Array<{ range: string; errorCount: number; errorDensity: number }> => {
  const chunkSize = Math.ceil(contentLength / 10); // Divide into 10 chunks
  const chunks: Array<{ range: string; errorCount: number; errorDensity: number }> = [];

  for (let i = 0; i < 10; i++) {
    const start = i * chunkSize;
    const end = Math.min((i + 1) * chunkSize, contentLength);
    const errorsInChunk = errors.filter((error) => error.position >= start && error.position < end);

    chunks.push({
      range: `${start}-${end}`,
      errorCount: errorsInChunk.length,
      errorDensity: (errorsInChunk.length / chunkSize) * 100,
    });
  }

  return chunks.sort((a, b) => b.errorDensity - a.errorDensity);
};

/**
 * Get error statistics summary
 */
export const getErrorStatistics = (errors: TypingError[]) => {
  const correctedErrors = errors.filter((e) => e.corrected).length;
  const uncorrectedErrors = errors.filter((e) => !e.corrected).length;

  // Calculate average time between errors
  let avgTimeBetweenErrors = 0;
  if (errors.length > 1) {
    const sortedErrors = [...errors].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    let totalTimeDiff = 0;
    for (let i = 1; i < sortedErrors.length; i++) {
      totalTimeDiff +=
        sortedErrors[i].timestamp.getTime() - sortedErrors[i - 1].timestamp.getTime();
    }
    avgTimeBetweenErrors = totalTimeDiff / (sortedErrors.length - 1) / 1000; // in seconds
  }

  return {
    totalErrors: errors.length,
    correctedErrors,
    uncorrectedErrors,
    correctionRate: errors.length > 0 ? (correctedErrors / errors.length) * 100 : 0,
    avgTimeBetweenErrors,
  };
};
