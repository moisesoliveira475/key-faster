# Content Integration Components

This directory contains components for content generation, display, and management.

## Components

### ContentManager
Main orchestrator component that handles content fetching, loading states, and error handling.

**Props:**
- `theme: string` - The topic/theme for content generation
- `onContentReady?: (contentId: string) => void` - Callback when content is ready
- `onStartTyping?: () => void` - Callback when user wants to start typing
- `autoFetch?: boolean` - Whether to automatically fetch content on mount

**Usage:**
```tsx
<ContentManager
  theme="JavaScript Programming"
  onStartTyping={handleStartTyping}
  autoFetch={true}
/>
```

### ContentDisplay
Displays generated content with metadata, difficulty indicators, and action buttons.

**Props:**
- `content: StudyContent` - The content to display
- `showPreview?: boolean` - Show preview or full content
- `onStartTyping?: () => void` - Callback for start typing button
- `onRefresh?: () => void` - Callback for refresh button

**Features:**
- Displays word count, estimated time, and source
- Shows difficulty badge (easy/medium/hard)
- Displays metadata (AI model, Wikipedia article)
- Action buttons for starting typing or refreshing content

### ContentLoader
Loading state component with animated spinner and skeleton.

**Props:**
- `message?: string` - Custom loading message

### ContentError
Error state component with retry functionality.

**Props:**
- `error: string` - Error message to display
- `onRetry?: () => void` - Callback for retry button
- `onDismiss?: () => void` - Callback for dismiss button

## Hooks

### useContentFetcher
Custom hook for fetching content with retry logic and error handling.

**Returns:**
- `content: StudyContent | null` - Current content
- `isLoading: boolean` - Loading state
- `error: string | null` - Error message
- `fetch: (request) => Promise<void>` - Fetch content function
- `refresh: (request) => Promise<void>` - Refresh content (bypass cache)
- `dismissError: () => void` - Clear error state
- `retryCount: number` - Current retry attempt
- `canRetry: boolean` - Whether retry is available

**Usage:**
```tsx
const { content, isLoading, error, fetch } = useContentFetcher();

// Fetch content
await fetch({
  theme: 'React Hooks',
  length: 300,
  source: 'combined',
  language: 'en'
});
```

## Stores

### useContentStore
Zustand store for content state management with caching.

**State:**
- `currentContent: StudyContent | null` - Current content
- `isLoading: boolean` - Loading state
- `error: string | null` - Error message
- `contentCache: Map<string, StudyContent>` - Content cache
- `fallbackContent: StudyContent | null` - Fallback content

**Actions:**
- `fetchContent(request)` - Fetch content from API
- `clearError()` - Clear error state
- `clearContent()` - Clear current content
- `getCachedContent(theme)` - Get cached content by theme
- `setFallbackContent(content)` - Set fallback content

## Services

### ApiService
Service for communicating with the backend API.

**Methods:**
- `generateContent(request)` - Generate content (AI + Wikipedia)
- `fetchWikipediaContent(theme, language)` - Fetch Wikipedia only
- `generateAIContent(theme, length)` - Generate AI content only
- `healthCheck()` - Check API health

**Usage:**
```tsx
import { apiService } from '../services/api.service';

const content = await apiService.generateContent({
  theme: 'TypeScript',
  length: 300,
  source: 'combined',
  language: 'en'
});
```

## Utilities

### contentProcessor
Utilities for processing and formatting content.

**Functions:**
- `processContent(content)` - Process content for typing practice
- `formatTextForTyping(text)` - Format text (remove extra whitespace, etc.)
- `countWords(text)` - Count words in text
- `calculateDifficulty(text, wordCount)` - Calculate difficulty level
- `calculateEstimatedTime(wordCount, averageWPM)` - Calculate estimated time
- `getDifficultyColor(difficulty)` - Get Tailwind classes for difficulty
- `getDifficultyLabel(difficulty)` - Get display label for difficulty
- `truncateToWordCount(text, maxWords)` - Truncate text to word count
- `getPreviewText(text, wordCount)` - Get preview text

## Content Flow

1. User selects a theme in ThemeSelector
2. ContentManager receives the theme
3. ContentManager uses useContentFetcher hook
4. Hook calls apiService to fetch content from backend
5. Content is cached in useContentStore
6. ContentDisplay shows the content with metadata
7. User clicks "Start Typing" to begin practice

## Error Handling

The content system has multiple layers of error handling:

1. **API Level**: Fetch errors are caught and thrown
2. **Store Level**: Errors trigger fallback content
3. **Hook Level**: Retry logic with exponential backoff (max 3 retries)
4. **Component Level**: ContentError component displays user-friendly messages

## Caching

Content is cached in memory using a Map:
- Cache key: `${theme}_${source}_${language}`
- Max cache size: 10 items (LRU eviction)
- Cache is checked before making API calls
- Refresh bypasses cache

## Offline Support

When API calls fail:
1. Check cache for existing content
2. Use fallback content if available
3. Display error with retry option
4. Suggest offline-friendly actions

## Configuration

Environment variables (`.env`):
```
VITE_API_URL=http://localhost:3001/api
```

## Future Enhancements

- [ ] Persistent cache using IndexedDB
- [ ] Content history and favorites
- [ ] Custom content upload
- [ ] Content difficulty adjustment
- [ ] Multi-language support expansion
- [ ] Content sharing and export
