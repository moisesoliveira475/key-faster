import type React from 'react';
import { useState } from 'react';
import { useMetricsStore } from '../stores/useMetricsStore';
import { usePreferencesStore } from '../stores/usePreferencesStore';
import {
  anonymizeSessionData,
  applyDataRetentionPolicy,
  clearAllData,
  downloadDataAsFile,
  formatBytes,
  getStorageInfo,
  importDataFromFile,
} from '../utils/dataManagement';

export const SettingsPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'data' | 'privacy'>('general');
  const [importStatus, setImportStatus] = useState<string>('');
  const [storageInfo, setStorageInfo] = useState(getStorageInfo());

  const preferences = usePreferencesStore();
  const metrics = useMetricsStore();

  const handleExport = () => {
    try {
      downloadDataAsFile(`typing-study-backup-${new Date().toISOString().split('T')[0]}.json`);
      alert('Data exported successfully!');
    } catch (_error) {
      alert('Failed to export data. Please try again.');
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportStatus('Importing...');

    const result = await importDataFromFile(file);

    if (result.success) {
      setImportStatus('Import successful!');
      setStorageInfo(getStorageInfo());
      setTimeout(() => setImportStatus(''), 3000);
    } else {
      setImportStatus(`Import failed: ${result.errors.join(', ')}`);
      setTimeout(() => setImportStatus(''), 5000);
    }

    // Reset file input
    event.target.value = '';
  };

  const handleClearAllData = () => {
    if (
      window.confirm('Are you sure you want to delete all your data? This action cannot be undone.')
    ) {
      clearAllData();
      setStorageInfo(getStorageInfo());
      alert('All data has been cleared.');
    }
  };

  const handleClearOldSessions = () => {
    const days = parseInt(prompt('Keep sessions from the last how many days?', '90') || '90', 10);
    if (Number.isNaN(days) || days < 0) {
      alert('Invalid number of days');
      return;
    }

    const removed = applyDataRetentionPolicy(days);
    setStorageInfo(getStorageInfo());
    alert(`Removed ${removed} old sessions.`);
  };

  const handleAnonymize = () => {
    if (window.confirm('This will remove theme information from all sessions. Continue?')) {
      anonymizeSessionData();
      alert('Session data has been anonymized.');
    }
  };

  const handleClearHistory = () => {
    if (
      window.confirm(
        'Are you sure you want to delete all session history? This action cannot be undone.'
      )
    ) {
      metrics.clearHistory();
      setStorageInfo(getStorageInfo());
      alert('Session history has been cleared.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Settings</h2>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'general'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
          onClick={() => setActiveTab('general')}
        >
          General
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'data'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
          onClick={() => setActiveTab('data')}
        >
          Data Management
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'privacy'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
          onClick={() => setActiveTab('privacy')}
        >
          Privacy
        </button>
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <select
              value={preferences.language}
              onChange={(e) => preferences.setLanguage(e.target.value as 'pt' | 'en')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pt">Português</option>
              <option value="en">English</option>
            </select>
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={preferences.highlightErrors}
                onChange={(e) => preferences.setHighlightErrors(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Highlight typing errors</span>
            </label>
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={preferences.autoPause}
                onChange={(e) => preferences.setAutoPause(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Auto-pause on inactivity</span>
            </label>
          </div>

          {preferences.autoPause && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auto-pause delay (seconds)
              </label>
              <input
                type="number"
                min="5"
                max="60"
                value={preferences.autoPauseDelay}
                onChange={(e) => preferences.setAutoPauseDelay(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div>
            <button
              onClick={() => preferences.resetPreferences()}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      )}

      {/* Data Management */}
      {activeTab === 'data' && (
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-medium text-gray-900 mb-2">Storage Information</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Total sessions: {storageInfo.sessionCount}</p>
              <p>Preferences size: {formatBytes(storageInfo.preferencesSize)}</p>
              <p>Session history size: {formatBytes(storageInfo.sessionHistorySize)}</p>
              <p className="font-medium">Total storage: {formatBytes(storageInfo.totalSize)}</p>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-3">Export & Import</h3>
            <div className="space-y-3">
              <button
                onClick={handleExport}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Export All Data
              </button>

              <div>
                <label className="block w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors cursor-pointer text-center">
                  Import Data
                  <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                </label>
                {importStatus && (
                  <p
                    className={`mt-2 text-sm ${importStatus.includes('failed') ? 'text-red-600' : 'text-green-600'}`}
                  >
                    {importStatus}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-3">Data Cleanup</h3>
            <div className="space-y-3">
              <button
                onClick={handleClearOldSessions}
                className="w-full px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
              >
                Clear Old Sessions
              </button>

              <button
                onClick={handleClearHistory}
                className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
              >
                Clear All Session History
              </button>

              <button
                onClick={handleClearAllData}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete All Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Controls */}
      {activeTab === 'privacy' && (
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-md">
            <h3 className="font-medium text-blue-900 mb-2">Privacy Information</h3>
            <p className="text-sm text-blue-800">
              All your data is stored locally in your browser. No data is sent to external servers
              except when generating content (theme information only).
            </p>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-3">Privacy Controls</h3>
            <div className="space-y-3">
              <button
                onClick={handleAnonymize}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                Anonymize Session Data
              </button>
              <p className="text-sm text-gray-600">
                Removes theme information from all sessions while keeping performance metrics.
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-3">Data Retention</h3>
            <p className="text-sm text-gray-600 mb-3">
              You can automatically delete old sessions to minimize data storage.
            </p>
            <button
              onClick={handleClearOldSessions}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Configure Retention Policy
            </button>
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-medium text-gray-900 mb-2">Recent Themes</h3>
            <p className="text-sm text-gray-600 mb-3">
              {preferences.recentThemes.length} themes stored
            </p>
            <button
              onClick={() => preferences.clearRecentThemes()}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Clear Recent Themes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
