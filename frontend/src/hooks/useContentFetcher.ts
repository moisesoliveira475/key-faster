import { useCallback, useEffect, useState } from 'react';
import type { ContentGenerationRequest } from '../services/api.service';
import { useContentStore } from '../stores/useContentStore';
import type { StudyContent } from '../types';

interface UseContentFetcherOptions {
  autoFetch?: boolean;
  onSuccess?: (content: StudyContent) => void;
  onError?: (error: string) => void;
}

export const useContentFetcher = (options: UseContentFetcherOptions = {}) => {
  const { autoFetch = false, onSuccess, onError } = options;

  const { currentContent, isLoading, error, fetchContent, clearError, clearContent } =
    useContentStore();

  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  // Fetch content with retry logic
  const fetch = useCallback(
    async (request: ContentGenerationRequest) => {
      try {
        await fetchContent(request);
        setRetryCount(0);

        if (onSuccess && currentContent) {
          onSuccess(currentContent);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';

        if (retryCount < MAX_RETRIES) {
          console.log(`Retrying content fetch (${retryCount + 1}/${MAX_RETRIES})...`);
          setRetryCount((prev) => prev + 1);

          // Exponential backoff
          setTimeout(
            () => {
              fetchContent(request);
            },
            2 ** retryCount * 1000
          );
        } else {
          if (onError) {
            onError(errorMessage);
          }
        }
      }
    },
    [fetchContent, currentContent, retryCount, onSuccess, onError]
  );

  // Refresh content (bypass cache)
  const refresh = useCallback(
    async (request: ContentGenerationRequest) => {
      clearContent();
      await fetch(request);
    },
    [fetch, clearContent]
  );

  // Clear error state
  const dismissError = useCallback(() => {
    clearError();
  }, [clearError]);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch && !currentContent && !isLoading) {
      // This would need a default request
      console.log('Auto-fetch enabled but no default request provided');
    }
  }, [autoFetch, currentContent, isLoading]);

  return {
    content: currentContent,
    isLoading,
    error,
    fetch,
    refresh,
    dismissError,
    retryCount,
    canRetry: retryCount < MAX_RETRIES,
  };
};
