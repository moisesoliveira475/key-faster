import type React from 'react';
import type { UserSession } from '../types';

interface SessionRecoveryPromptProps {
  session: UserSession;
  onRecover: () => void;
  onDiscard: () => void;
}

export const SessionRecoveryPrompt: React.FC<SessionRecoveryPromptProps> = ({
  session,
  onRecover,
  onDiscard,
}) => {
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const timeSinceStart = Math.floor((Date.now() - new Date(session.startTime).getTime()) / 1000);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center mb-4">
          <div className="bg-blue-100 rounded-full p-3 mr-4">
            <svg
              className="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Session Recovery</h2>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            We found an interrupted typing session. Would you like to continue where you left off?
          </p>

          <div className="bg-gray-50 rounded-md p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Theme:</span>
              <span className="font-medium text-gray-900">{session.theme}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Progress:</span>
              <span className="font-medium text-gray-900">
                {session.userProgress.currentPosition} / {session.content.length} characters
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Time elapsed:</span>
              <span className="font-medium text-gray-900">
                {formatDuration(session.metrics.timeElapsed)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">WPM:</span>
              <span className="font-medium text-gray-900">{session.metrics.wpm}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Accuracy:</span>
              <span className="font-medium text-gray-900">
                {session.metrics.accuracy.toFixed(1)}%
              </span>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-3">
            Session started {Math.floor(timeSinceStart / 60)} minutes ago
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onRecover}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Continue Session
          </button>
          <button
            onClick={onDiscard}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
          >
            Start Fresh
          </button>
        </div>
      </div>
    </div>
  );
};
