import { useMemo, useState } from 'react';
import { useMetricsStore } from '../stores/useMetricsStore';
import type { HistoricalSession } from '../types';
import { formatTime } from '../utils/metricsCalculator';

type SortField = 'date' | 'wpm' | 'accuracy' | 'duration';
type SortOrder = 'asc' | 'desc';

export const SessionHistory = () => {
  const { sessionHistory, removeSession } = useMetricsStore();

  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filterTheme, setFilterTheme] = useState<string>('');
  const [filterLayout, setFilterLayout] = useState<string>('');

  // Get unique layouts for filters
  const uniqueLayouts = useMemo(() => {
    const layouts = new Set(sessionHistory.map((s) => s.keyboardLayout));
    return Array.from(layouts).sort();
  }, [sessionHistory]);

  // Filter and sort sessions
  const filteredAndSortedSessions = useMemo(() => {
    let filtered = [...sessionHistory];

    // Apply theme filter
    if (filterTheme) {
      filtered = filtered.filter((s) => s.theme.toLowerCase().includes(filterTheme.toLowerCase()));
    }

    // Apply layout filter
    if (filterLayout) {
      filtered = filtered.filter((s) => s.keyboardLayout === filterLayout);
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'wpm':
          comparison = a.wpm - b.wpm;
          break;
        case 'accuracy':
          comparison = a.accuracy - b.accuracy;
          break;
        case 'duration':
          comparison = a.duration - b.duration;
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [sessionHistory, sortField, sortOrder, filterTheme, filterLayout]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleDelete = (sessionId: string) => {
    if (confirm('Are you sure you want to delete this session?')) {
      removeSession(sessionId);
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return (
        <svg
          className="w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
          />
        </svg>
      );
    }

    return sortOrder === 'asc' ? (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  if (sessionHistory.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-8 text-center">
        <div className="text-gray-400 dark:text-gray-500 mb-2">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
          No Session History
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Your completed sessions will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Filter by Theme
          </label>
          <input
            type="text"
            value={filterTheme}
            onChange={(e) => setFilterTheme(e.target.value)}
            placeholder="Search themes..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Filter by Layout
          </label>
          <select
            value={filterLayout}
            onChange={(e) => setFilterLayout(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Layouts</option>
            {uniqueLayouts.map((layout) => (
              <option key={layout} value={layout}>
                {layout}
              </option>
            ))}
          </select>
        </div>

        {(filterTheme || filterLayout) && (
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilterTheme('');
                setFilterLayout('');
              }}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {filteredAndSortedSessions.length} of {sessionHistory.length} sessions
      </div>

      {/* Session list */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center gap-1">
                    Date
                    <SortIcon field="date" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Theme
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort('wpm')}
                >
                  <div className="flex items-center gap-1">
                    WPM
                    <SortIcon field="wpm" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort('accuracy')}
                >
                  <div className="flex items-center gap-1">
                    Accuracy
                    <SortIcon field="accuracy" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort('duration')}
                >
                  <div className="flex items-center gap-1">
                    Duration
                    <SortIcon field="duration" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Layout
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAndSortedSessions.map((session) => (
                <SessionRow key={session.sessionId} session={session} onDelete={handleDelete} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Session row component
interface SessionRowProps {
  session: HistoricalSession;
  onDelete: (sessionId: string) => void;
}

const SessionRow = ({ session, onDelete }: SessionRowProps) => {
  const formattedDate = new Date(session.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 95) return 'text-green-600 dark:text-green-400';
    if (accuracy >= 90) return 'text-blue-600 dark:text-blue-400';
    if (accuracy >= 80) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getWPMColor = (wpm: number) => {
    if (wpm >= 80) return 'text-purple-600 dark:text-purple-400';
    if (wpm >= 60) return 'text-blue-600 dark:text-blue-400';
    if (wpm >= 40) return 'text-green-600 dark:text-green-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">
        {formattedDate}
      </td>
      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
        <div className="max-w-xs truncate" title={session.theme}>
          {session.theme}
        </div>
      </td>
      <td
        className={`px-4 py-3 text-sm font-semibold whitespace-nowrap ${getWPMColor(session.wpm)}`}
      >
        {session.wpm}
      </td>
      <td
        className={`px-4 py-3 text-sm font-semibold whitespace-nowrap ${getAccuracyColor(session.accuracy)}`}
      >
        {session.accuracy.toFixed(1)}%
      </td>
      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">
        {formatTime(session.duration)}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
        {session.keyboardLayout}
      </td>
      <td className="px-4 py-3 text-sm whitespace-nowrap">
        <button
          onClick={() => onDelete(session.sessionId)}
          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
          title="Delete session"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </td>
    </tr>
  );
};
