import { useState } from 'react';
import { MetricsDashboard, ProgressTracker, SessionHistory } from '../components';

type TabType = 'dashboard' | 'progress' | 'history';

export const DashboardDemo = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Metrics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your typing progress and achievements
          </p>
        </header>

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 mb-6">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'progress'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              📈 Progress
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'history'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              📚 History
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'dashboard' && (
            <div>
              <MetricsDashboard showSummary={false} />
            </div>
          )}

          {activeTab === 'progress' && (
            <div>
              <ProgressTracker />
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <SessionHistory />
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
            ℹ️ Demo Information
          </h3>
          <p className="text-sm text-blue-800 dark:text-blue-400">
            This is a demo of the metrics dashboard components. Start a typing session to see
            real-time metrics, complete sessions to build your history, and track your progress over
            time with charts and achievements.
          </p>
        </div>
      </div>
    </div>
  );
};
