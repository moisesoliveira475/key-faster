import { useMemo, useState } from 'react';
import { useMetricsStore } from '../stores/useMetricsStore';
import { ProgressChart } from './ProgressChart';

type TimeRange = '7days' | '30days' | '90days' | 'all';

export const ProgressTracker = () => {
  const { sessionHistory, averageWPM, averageAccuracy } = useMetricsStore();
  const [timeRange, setTimeRange] = useState<TimeRange>('30days');
  const [selectedMetric, setSelectedMetric] = useState<'wpm' | 'accuracy'>('wpm');

  // Filter sessions by time range
  const filteredSessions = useMemo(() => {
    if (timeRange === 'all') return sessionHistory;

    const now = new Date();
    const daysMap = { '7days': 7, '30days': 30, '90days': 90 };
    const days = daysMap[timeRange];
    const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    return sessionHistory.filter((session) => new Date(session.date) >= cutoffDate);
  }, [sessionHistory, timeRange]);

  // Calculate achievements
  const achievements = useMemo(() => {
    const totalSessions = sessionHistory.length;
    const totalTime = sessionHistory.reduce((sum, s) => sum + s.duration, 0);
    const totalHours = Math.floor(totalTime / 3600);

    const highAccuracySessions = sessionHistory.filter((s) => s.accuracy >= 95).length;
    const fastTypingSessions = sessionHistory.filter((s) => s.wpm >= 60).length;
    const perfectSessions = sessionHistory.filter((s) => s.accuracy === 100).length;

    const maxWPM = sessionHistory.length > 0 ? Math.max(...sessionHistory.map((s) => s.wpm)) : 0;

    const maxAccuracy =
      sessionHistory.length > 0 ? Math.max(...sessionHistory.map((s) => s.accuracy)) : 0;

    // Calculate streak (consecutive days with sessions)
    const sortedDates = [
      ...new Set(sessionHistory.map((s) => new Date(s.date).toDateString())),
    ].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let currentStreak = 0;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (sortedDates.length > 0 && (sortedDates[0] === today || sortedDates[0] === yesterday)) {
      currentStreak = 1;
      for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = new Date(sortedDates[i - 1]);
        const currDate = new Date(sortedDates[i]);
        const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / 86400000);

        if (diffDays === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    return {
      totalSessions,
      totalHours,
      highAccuracySessions,
      fastTypingSessions,
      perfectSessions,
      maxWPM,
      maxAccuracy,
      currentStreak,
    };
  }, [sessionHistory]);

  // Calculate improvement trend
  const improvementTrend = useMemo(() => {
    if (filteredSessions.length < 2) return null;

    const sorted = [...filteredSessions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const firstHalf = sorted.slice(0, Math.floor(sorted.length / 2));
    const secondHalf = sorted.slice(Math.floor(sorted.length / 2));

    const firstHalfAvgWPM = firstHalf.reduce((sum, s) => sum + s.wpm, 0) / firstHalf.length;
    const secondHalfAvgWPM = secondHalf.reduce((sum, s) => sum + s.wpm, 0) / secondHalf.length;

    const firstHalfAvgAcc = firstHalf.reduce((sum, s) => sum + s.accuracy, 0) / firstHalf.length;
    const secondHalfAvgAcc = secondHalf.reduce((sum, s) => sum + s.accuracy, 0) / secondHalf.length;

    return {
      wpmChange: secondHalfAvgWPM - firstHalfAvgWPM,
      accuracyChange: secondHalfAvgAcc - firstHalfAvgAcc,
    };
  }, [filteredSessions]);

  const achievementsList = [
    {
      id: 'sessions',
      icon: '📚',
      title: 'Sessions Completed',
      value: achievements.totalSessions,
      milestone: 100,
      description: 'Total typing sessions',
    },
    {
      id: 'hours',
      icon: '⏱️',
      title: 'Practice Hours',
      value: achievements.totalHours,
      milestone: 50,
      description: 'Hours of practice',
    },
    {
      id: 'streak',
      icon: '🔥',
      title: 'Current Streak',
      value: achievements.currentStreak,
      milestone: 30,
      description: 'Consecutive days',
    },
    {
      id: 'accuracy',
      icon: '🎯',
      title: 'High Accuracy',
      value: achievements.highAccuracySessions,
      milestone: 50,
      description: 'Sessions with 95%+ accuracy',
    },
    {
      id: 'speed',
      icon: '⚡',
      title: 'Fast Typing',
      value: achievements.fastTypingSessions,
      milestone: 50,
      description: 'Sessions with 60+ WPM',
    },
    {
      id: 'perfect',
      icon: '💯',
      title: 'Perfect Sessions',
      value: achievements.perfectSessions,
      milestone: 10,
      description: '100% accuracy sessions',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex flex-wrap gap-2">
        {(['7days', '30days', '90days', 'all'] as TimeRange[]).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeRange === range
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {range === '7days' && 'Last 7 Days'}
            {range === '30days' && 'Last 30 Days'}
            {range === '90days' && 'Last 90 Days'}
            {range === 'all' && 'All Time'}
          </button>
        ))}
      </div>

      {/* Progress Charts */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Progress Over Time</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedMetric('wpm')}
              className={`px-3 py-1 rounded text-sm font-medium ${
                selectedMetric === 'wpm'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              WPM
            </button>
            <button
              onClick={() => setSelectedMetric('accuracy')}
              className={`px-3 py-1 rounded text-sm font-medium ${
                selectedMetric === 'accuracy'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Accuracy
            </button>
          </div>
        </div>

        <ProgressChart sessions={filteredSessions} metric={selectedMetric} height={300} />

        {/* Improvement Indicator */}
        {improvementTrend && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div
                  className={`text-2xl font-bold ${
                    improvementTrend.wpmChange >= 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {improvementTrend.wpmChange >= 0 ? '+' : ''}
                  {improvementTrend.wpmChange.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">WPM Improvement</div>
              </div>
              <div>
                <div
                  className={`text-2xl font-bold ${
                    improvementTrend.accuracyChange >= 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {improvementTrend.accuracyChange >= 0 ? '+' : ''}
                  {improvementTrend.accuracyChange.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy Improvement</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Achievements Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Achievements</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievementsList.map((achievement) => {
            const progress = Math.min((achievement.value / achievement.milestone) * 100, 100);
            const isCompleted = achievement.value >= achievement.milestone;

            return (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isCompleted
                    ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="text-3xl">{achievement.icon}</div>
                  {isCompleted && <div className="text-yellow-500 text-xl">✓</div>}
                </div>

                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {achievement.title}
                </h3>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {achievement.description}
                </p>

                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-bold text-gray-900 dark:text-white">
                    {achievement.value}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    / {achievement.milestone}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      isCompleted ? 'bg-yellow-400' : 'bg-blue-600'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Personal Records */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 rounded-lg border border-purple-200 dark:border-gray-600 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          🏆 Personal Records
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {achievements.maxWPM}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Best WPM</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-pink-600 dark:text-pink-400">
              {achievements.maxAccuracy.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Best Accuracy</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{averageWPM}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Average WPM</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {averageAccuracy.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Average Accuracy</div>
          </div>
        </div>
      </div>
    </div>
  );
};
