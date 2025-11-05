import { create } from 'zustand';
import { apiService, type ContentGenerationRequest } from '../services/api.service';
import type { StudyContent } from '../types';

interface ContentState {
  // Current content
  currentContent: StudyContent | null;

  // Loading and error states
  isLoading: boolean;
  error: string | null;

  // Content cache for offline usage
  contentCache: Map<string, StudyContent>;

  // Fallback content for when API fails
  fallbackContent: StudyContent | null;

  // Actions
  fetchContent: (request: ContentGenerationRequest) => Promise<void>;
  clearError: () => void;
  clearContent: () => void;
  getCachedContent: (theme: string) => StudyContent | undefined;
  setFallbackContent: (content: StudyContent) => void;
}

// Default fallback content
const DEFAULT_FALLBACK_CONTENT: StudyContent = {
  id: 'fallback_default',
  theme: 'Typing Practice',
  text: 'Welcome to the Typing Study App! This is a practice text that will help you improve your typing speed and accuracy. The quick brown fox jumps over the lazy dog. Practice makes perfect, and with consistent effort, you will see improvement in your typing skills. Remember to maintain good posture and use proper finger placement on the keyboard.',
  source: 'ai',
  difficulty: 1,
  wordCount: 60,
  estimatedTime: 2,
  createdAt: new Date(),
  metadata: {
    language: 'en',
  },
};

export const useContentStore = create<ContentState>((set, get) => ({
  currentContent: null,
  isLoading: false,
  error: null,
  contentCache: new Map(),
  fallbackContent: DEFAULT_FALLBACK_CONTENT,

  fetchContent: async (request: ContentGenerationRequest) => {
    set({ isLoading: true, error: null });

    try {
      // Check cache first
      const cacheKey = `${request.theme}_${request.source || 'combined'}_${request.language || 'en'}`;
      const cached = get().contentCache.get(cacheKey);

      if (cached) {
        console.log('Using cached content for:', request.theme);
        set({
          currentContent: cached,
          isLoading: false,
        });
        return;
      }

      // Fetch from API
      const content = await apiService.generateContent(request);

      // Update cache
      const newCache = new Map(get().contentCache);
      newCache.set(cacheKey, content);

      // Limit cache size to 10 items
      if (newCache.size > 10) {
        const firstKey = newCache.keys().next().value;
        if (firstKey) {
          newCache.delete(firstKey);
        }
      }

      set({
        currentContent: content,
        isLoading: false,
        contentCache: newCache,
      });
    } catch (error) {
      console.error('Failed to fetch content:', error);

      const errorMessage = error instanceof Error ? error.message : 'Failed to generate content';

      // Try to use fallback content
      const fallback = get().fallbackContent;

      if (fallback) {
        console.log('Using fallback content due to error');
        set({
          currentContent: fallback,
          isLoading: false,
          error: `${errorMessage}. Using fallback content.`,
        });
      } else {
        set({
          isLoading: false,
          error: errorMessage,
        });
      }
    }
  },

  clearError: () => set({ error: null }),

  clearContent: () => set({ currentContent: null, error: null }),

  getCachedContent: (theme: string) => {
    const cache = get().contentCache;
    for (const [key, content] of cache.entries()) {
      if (key.startsWith(theme)) {
        return content;
      }
    }
    return undefined;
  },

  setFallbackContent: (content: StudyContent) => {
    set({ fallbackContent: content });
  },
}));
