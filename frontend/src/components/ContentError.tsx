interface ContentErrorProps {
  error: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export const ContentError: React.FC<ContentErrorProps> = ({ error, onRetry, onDismiss }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
      <div className="flex items-start gap-4">
        {/* Error icon */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* Error content */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Content Generation Failed</h3>
          <p className="text-gray-700 mb-4">{error}</p>

          {/* Suggestions */}
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <p className="text-sm font-medium text-gray-900 mb-2">Possible solutions:</p>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>Check your internet connection</li>
              <li>Try a different theme or topic</li>
              <li>The backend server might be down</li>
              <li>API rate limits may have been reached</li>
            </ul>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Retry
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
