import { useState } from 'react';
import { useContentFetcher } from '../hooks/useContentFetcher';
import type { ContentGenerationRequest } from '../services/api.service';
import { usePreferencesStore } from '../stores/usePreferencesStore';
import { ContentDisplay } from './ContentDisplay';
import { ContentError } from './ContentError';
import { ContentLoader } from './ContentLoader';

interface ContentManagerProps {
  theme: string;
  onContentReady?: (contentId: string) => void;
  onStartTyping?: () => void;
  autoFetch?: boolean;
}

export const ContentManager: React.FC<ContentManagerProps> = ({
  theme,
  onContentReady,
  onStartTyping,
  autoFetch = true,
}) => {
  const { language } = usePreferencesStore();
  const { content, isLoading, error, fetch, dismissError } = useContentFetcher();
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  // Auto-fetch content when theme changes
  useState(() => {
    if (autoFetch && theme && !hasAttemptedFetch) {
      handleFetchContent();
      setHasAttemptedFetch(true);
    }
  });

  const handleFetchContent = async (source: 'ai' | 'wikipedia' | 'combined' = 'combined') => {
    const request: ContentGenerationRequest = {
      theme,
      length: 300,
      source,
      language: language as 'en' | 'pt',
    };

    await fetch(request);

    if (content && onContentReady) {
      onContentReady(content.id);
    }
  };

  const handleRefresh = () => {
    handleFetchContent();
  };

  const handleRetry = () => {
    dismissError();
    handleFetchContent();
  };

  // Loading state
  if (isLoading) {
    return <ContentLoader message={`Generating content about "${theme}"...`} />;
  }

  // Error state
  if (error && !content) {
    return <ContentError error={error} onRetry={handleRetry} onDismiss={dismissError} />;
  }

  // Content ready state
  if (content) {
    return (
      <>
        {error && (
          <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> {error}
            </p>
          </div>
        )}
        <ContentDisplay content={content} onStartTyping={onStartTyping} onRefresh={handleRefresh} />
      </>
    );
  }

  // Initial state - prompt to generate content
  return (
    <div className="bg-white rounded-lg shadow-md p-8 text-center">
      <div className="max-w-md mx-auto">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Generate Content</h3>
        <p className="text-gray-600 mb-6">
          Click below to generate typing practice content about "{theme}"
        </p>
        <button
          onClick={() => handleFetchContent()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          Generate Content
        </button>
      </div>
    </div>
  );
};
