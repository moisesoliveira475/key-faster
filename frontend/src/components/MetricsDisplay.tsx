import { useTypingSessionStore } from '../stores/useTypingSessionStore';
import { formatTime } from '../utils/metricsCalculator';

export const MetricsDisplay = () => {
  const { currentSession, isSessionActive } = useTypingSessionStore();

  if (!isSessionActive || !currentSession) {
    return null;
  }

  const { metrics } = currentSession;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600">
      {/* WPM */}
      <div className="text-center">
        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{metrics.wpm}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">WPM</div>
      </div>

      {/* Accuracy */}
      <div className="text-center">
        <div className="text-3xl font-bold text-green-600 dark:text-green-400">
          {metrics.accuracy.toFixed(1)}%
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Accuracy</div>
      </div>

      {/* Errors */}
      <div className="text-center">
        <div className="text-3xl font-bold text-red-600 dark:text-red-400">
          {metrics.errorCount}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Errors</div>
      </div>

      {/* Time */}
      <div className="text-center">
        <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
          {formatTime(metrics.timeElapsed)}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Time</div>
      </div>

      {/* Additional metrics row */}
      <div className="col-span-2 md:col-span-4 grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            {metrics.correctCharacters} / {metrics.totalCharacters}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Correct Characters</div>
        </div>

        <div className="text-center">
          <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            {metrics.keystrokesPerMinute}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Keystrokes/Min</div>
        </div>
      </div>
    </div>
  );
};
