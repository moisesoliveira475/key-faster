import { memo, useEffect, useMemo, useState } from 'react';
import { useIsMobile } from '../hooks/useMediaQuery';
import { useMetricsStore } from '../stores/useMetricsStore';
import { useTypingSessionStore } from '../stores/useTypingSessionStore';
import { formatTime } from '../utils/metricsCalculator';

interface MetricsDashboardProps {
  showSummary?: boolean;
}

export const MetricsDashboard = memo(({ showSummary = false }: MetricsDashboardProps) => {
  const { currentSession, isSessionActive } = useTypingSessionStore();
  const {
    sessionHistory,
    averageWPM,
    averageAccuracy,
    totalSessions,
    totalPracticeTime,
    getBestSession,
  } = useMetricsStore();

  const [bestSession, setBestSession] = useState(getBestSession());
  const isMobile = useIsMobile();

  useEffect(() => {
    setBestSession(getBestSession());
  }, [getBestSession]);

  // Real-time metrics from current session
  const currentMetrics = currentSession?.metrics;

  // Calculate improvement indicators - memoized
  const wpmImprovement = useMemo(() => {
    return currentMetrics && averageWPM > 0
      ? (((currentMetrics.wpm - averageWPM) / averageWPM) * 100).toFixed(1)
      : null;
  }, [currentMetrics?.wpm, averageWPM, currentMetrics]);

  const accuracyImprovement = useMemo(() => {
    return currentMetrics && averageAccuracy > 0
      ? (((currentMetrics.accuracy - averageAccuracy) / averageAccuracy) * 100).toFixed(1)
      : null;
  }, [currentMetrics?.accuracy, averageAccuracy, currentMetrics]);

  return (
    <div className={isMobile ? 'space-y-4' : 'space-y-6'}>
      {/* Current Session Metrics */}
      {isSessionActive && currentMetrics && (
        <div
          className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 ${isMobile ? 'p-4' : 'p-6'}`}
        >
          <h2
            className={`font-bold text-gray-900 dark:text-white mb-4 ${isMobile ? 'text-lg' : 'text-xl'}`}
          >
            Current Session
          </h2>

          <div className={`grid grid-cols-2 gap-${isMobile ? '3' : '4'}`}>
            {/* WPM */}
            <div
              className={`text-center ${isMobile ? 'p-3' : 'p-4'} bg-blue-50 dark:bg-blue-900/20 rounded-lg`}
            >
              <div
                className={`font-bold text-blue-600 dark:text-blue-400 ${isMobile ? 'text-2xl' : 'text-4xl'}`}
              >
                {currentMetrics.wpm}
              </div>
              <div
                className={`text-gray-600 dark:text-gray-400 mt-1 ${isMobile ? 'text-xs' : 'text-sm'}`}
              >
                WPM
              </div>
              {wpmImprovement && (
                <div
                  className={`text-xs mt-1 font-semibold ${
                    parseFloat(wpmImprovement) >= 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {parseFloat(wpmImprovement) >= 0 ? '+' : ''}
                  {wpmImprovement}%
                </div>
              )}
            </div>

            {/* Accuracy */}
            <div
              className={`text-center ${isMobile ? 'p-3' : 'p-4'} bg-green-50 dark:bg-green-900/20 rounded-lg`}
            >
              <div
                className={`font-bold text-green-600 dark:text-green-400 ${isMobile ? 'text-2xl' : 'text-4xl'}`}
              >
                {currentMetrics.accuracy.toFixed(1)}%
              </div>
              <div
                className={`text-gray-600 dark:text-gray-400 mt-1 ${isMobile ? 'text-xs' : 'text-sm'}`}
              >
                Accuracy
              </div>
              {accuracyImprovement && (
                <div
                  className={`text-xs mt-1 font-semibold ${
                    parseFloat(accuracyImprovement) >= 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {parseFloat(accuracyImprovement) >= 0 ? '+' : ''}
                  {accuracyImprovement}%
                </div>
              )}
            </div>

            {/* Errors */}
            <div
              className={`text-center ${isMobile ? 'p-3' : 'p-4'} bg-red-50 dark:bg-red-900/20 rounded-lg`}
            >
              <div
                className={`font-bold text-red-600 dark:text-red-400 ${isMobile ? 'text-2xl' : 'text-4xl'}`}
              >
                {currentMetrics.errorCount}
              </div>
              <div
                className={`text-gray-600 dark:text-gray-400 mt-1 ${isMobile ? 'text-xs' : 'text-sm'}`}
              >
                Errors
              </div>
            </div>

            {/* Time */}
            <div
              className={`text-center ${isMobile ? 'p-3' : 'p-4'} bg-purple-50 dark:bg-purple-900/20 rounded-lg`}
            >
              <div
                className={`font-bold text-purple-600 dark:text-purple-400 ${isMobile ? 'text-2xl' : 'text-4xl'}`}
              >
                {formatTime(currentMetrics.timeElapsed)}
              </div>
              <div
                className={`text-gray-600 dark:text-gray-400 mt-1 ${isMobile ? 'text-xs' : 'text-sm'}`}
              >
                Time
              </div>
            </div>
          </div>

          {/* Additional Current Session Details */}
          <div
            className={`grid grid-cols-2 md:grid-cols-3 gap-${isMobile ? '3' : '4'} mt-4 pt-4 border-t border-gray-200 dark:border-gray-700`}
          >
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                {currentMetrics.averageWPM}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Avg WPM</div>
            </div>

            <div className="text-center">
              <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                {currentMetrics.correctCharacters} / {currentMetrics.totalCharacters}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Correct Chars</div>
            </div>

            <div className="text-center">
              <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                {currentMetrics.keystrokesPerMinute}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Keystrokes/Min</div>
            </div>
          </div>
        </div>
      )}

      {/* Session Summary - shown when requested or when session ends */}
      {showSummary && currentSession && (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-lg border border-blue-200 dark:border-gray-600 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Session Summary</h2>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 dark:text-gray-300">Theme:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {currentSession.theme}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-700 dark:text-gray-300">Keyboard Layout:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {currentSession.keyboardLayout}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-700 dark:text-gray-300">Duration:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatTime(currentMetrics?.timeElapsed || 0)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-700 dark:text-gray-300">Characters Typed:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {currentMetrics?.totalCharacters || 0}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-700 dark:text-gray-300">Error Rate:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {currentMetrics
                  ? ((currentMetrics.errorCount / currentMetrics.totalCharacters) * 100).toFixed(2)
                  : 0}
                %
              </span>
            </div>

            {/* Performance Rating */}
            {currentMetrics && (
              <div className="mt-4 pt-4 border-t border-blue-200 dark:border-gray-600">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {getPerformanceRating(currentMetrics.wpm, currentMetrics.accuracy)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Performance Rating</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overall Statistics */}
      {totalSessions > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Overall Statistics
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalSessions}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Total Sessions</div>
            </div>

            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{averageWPM}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Avg WPM</div>
            </div>

            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {averageAccuracy.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Avg Accuracy</div>
            </div>

            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatTime(totalPracticeTime)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Total Time</div>
            </div>
          </div>

          {/* Best Session */}
          {bestSession && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                🏆 Best Session
              </h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {bestSession.wpm}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">WPM</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">
                    {bestSession.accuracy.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Accuracy</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {bestSession.theme}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Theme</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!isSessionActive && totalSessions === 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-8 text-center">
          <div className="text-gray-400 dark:text-gray-500 mb-2">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No Sessions Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Start a typing session to see your metrics and track your progress!
          </p>
        </div>
      )}
    </div>
  );
});

MetricsDashboard.displayName = 'MetricsDashboard';

// Helper function to determine performance rating
function getPerformanceRating(wpm: number, accuracy: number): string {
  if (accuracy < 80) return '📝 Keep Practicing';
  if (accuracy < 90) return '👍 Good Job';
  if (wpm < 40) return '⭐ Great Accuracy';
  if (wpm < 60) return '⭐⭐ Excellent';
  if (wpm < 80) return '⭐⭐⭐ Outstanding';
  return '🏆 Master Typist';
}
