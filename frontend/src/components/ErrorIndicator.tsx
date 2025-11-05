import { useTypingSessionStore } from '../stores/useTypingSessionStore';
import {
  analyzeErrorPatterns,
  getErrorStatistics,
  getProblematicKeys,
} from '../utils/errorAnalysis';

export const ErrorIndicator = () => {
  const { currentSession, isSessionActive } = useTypingSessionStore();

  if (!isSessionActive || !currentSession) {
    return null;
  }

  const { userProgress } = currentSession;
  const errors = userProgress.errors;

  if (errors.length === 0) {
    return (
      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-sm font-medium text-green-800 dark:text-green-200">
            Perfect! No errors so far.
          </span>
        </div>
      </div>
    );
  }

  const errorPatterns = analyzeErrorPatterns(errors);
  const problematicKeys = getProblematicKeys(errors);
  const statistics = getErrorStatistics(errors);

  return (
    <div className="space-y-4">
      {/* Error Statistics */}
      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
        <h3 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-3">Error Summary</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-red-700 dark:text-red-300">Total Errors:</span>
            <span className="ml-2 font-semibold text-red-900 dark:text-red-100">
              {statistics.totalErrors}
            </span>
          </div>
          <div>
            <span className="text-red-700 dark:text-red-300">Corrected:</span>
            <span className="ml-2 font-semibold text-red-900 dark:text-red-100">
              {statistics.correctedErrors}
            </span>
          </div>
          <div>
            <span className="text-red-700 dark:text-red-300">Uncorrected:</span>
            <span className="ml-2 font-semibold text-red-900 dark:text-red-100">
              {statistics.uncorrectedErrors}
            </span>
          </div>
          <div>
            <span className="text-red-700 dark:text-red-300">Correction Rate:</span>
            <span className="ml-2 font-semibold text-red-900 dark:text-red-100">
              {statistics.correctionRate.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Problematic Keys */}
      {problematicKeys.length > 0 && (
        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
          <h3 className="text-sm font-semibold text-orange-900 dark:text-orange-100 mb-2">
            Most Problematic Keys
          </h3>
          <div className="flex flex-wrap gap-2">
            {problematicKeys.map((key, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-orange-100 dark:bg-orange-900/40 text-orange-900 dark:text-orange-100 rounded font-mono text-sm border border-orange-300 dark:border-orange-700"
              >
                {key === ' ' ? '␣' : key}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Error Patterns */}
      {errorPatterns.length > 0 && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <h3 className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-3">
            Error Patterns
          </h3>
          <div className="space-y-3">
            {errorPatterns.map((pattern, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200 capitalize">
                    {pattern.errorType}
                  </span>
                  <span className="text-xs text-yellow-700 dark:text-yellow-300">
                    {pattern.frequency} occurrence{pattern.frequency !== 1 ? 's' : ''}
                  </span>
                </div>
                {pattern.commonMistakes.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {pattern.commonMistakes.slice(0, 5).map((mistake, mIndex) => (
                      <span
                        key={mIndex}
                        className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-900 dark:text-yellow-100 rounded text-xs font-mono border border-yellow-300 dark:border-yellow-700"
                      >
                        {mistake.expected === '' ? '∅' : mistake.expected} →{' '}
                        {mistake.typed === '' ? '∅' : mistake.typed}
                        <span className="ml-1 text-yellow-700 dark:text-yellow-400">
                          ({mistake.count})
                        </span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
