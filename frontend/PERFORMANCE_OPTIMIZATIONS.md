# Performance Optimizations Guide

This document outlines the performance optimizations implemented in the Typing Study App to ensure smooth, responsive user experience during active typing sessions.

## Overview

The app implements several layers of optimization:
1. **Component-level optimizations** - Memoization and lazy loading
2. **State management optimizations** - Efficient Zustand selectors
3. **Build optimizations** - Code splitting and minification
4. **Runtime optimizations** - Debouncing and throttling

## Component Optimizations

### 1. Lazy Loading

Heavy components are lazy-loaded to improve initial page load time:

```typescript
// App.tsx
const ContentManager = lazy(() => import('./components/ContentManager'))
const KeyboardLayoutSelector = lazy(() => import('./components/KeyboardLayoutSelector'))
const MetricsDashboard = lazy(() => import('./components/MetricsDashboard'))
```

**Benefits:**
- Faster initial page load
- Smaller initial bundle size
- Components loaded only when needed

### 2. React.memo

Components that receive props are wrapped with `React.memo` to prevent unnecessary re-renders:

```typescript
export const TypingInterface = memo(({ content, onSessionComplete }) => {
  // Component logic
});
```

**Optimized Components:**
- `TypingInterface` - Critical for typing performance
- `MetricsDashboard` - Prevents re-renders during metric updates

### 3. useMemo Hook

Expensive calculations are memoized to avoid recalculation on every render:

```typescript
// Memoize rendered content to avoid re-rendering all characters
const renderedContent = useMemo(() => {
  return content.split('').map((char, index) => renderCharacter(char, index));
}, [content, renderCharacter]);
```

**Use Cases:**
- Character rendering in TypingInterface
- Metric calculations in MetricsDashboard
- Improvement percentage calculations

### 4. useCallback Hook

Functions passed as props or used in dependencies are memoized:

```typescript
const handleInputChange = useCallback((e) => {
  // Handle input
}, [dependencies]);
```

**Benefits:**
- Prevents child component re-renders
- Stable function references
- Better performance with React.memo

## State Management Optimizations

### 1. Selective Store Subscriptions

Custom hooks in `useOptimizedStore.ts` provide granular store subscriptions:

```typescript
// Only subscribe to specific values
export function useCurrentMetrics() {
  return useTypingSessionStore(
    useCallback((state) => state.currentSession?.metrics, [])
  );
}
```

**Benefits:**
- Components only re-render when their specific data changes
- Reduces unnecessary re-renders across the app
- Better performance during active typing

### 2. Shallow Comparison

Zustand stores use shallow comparison to detect changes:

```typescript
import { shallow } from 'zustand/shallow';

const { value1, value2 } = useStore(
  (state) => ({ value1: state.value1, value2: state.value2 }),
  shallow
);
```

## Build Optimizations

### 1. Code Splitting

Vite configuration splits code into logical chunks:

```typescript
manualChunks: {
  'react-vendor': ['react', 'react-dom'],
  'chart-vendor': ['chart.js', 'react-chartjs-2', 'recharts'],
  'state-vendor': ['zustand', '@tanstack/react-query'],
}
```

**Benefits:**
- Better caching (vendor code changes less frequently)
- Parallel loading of chunks
- Smaller individual file sizes

### 2. Minification

Production builds are minified with Terser:

```typescript
minify: 'terser',
terserOptions: {
  compress: {
    drop_console: true,
    drop_debugger: true,
  },
}
```

**Benefits:**
- Smaller bundle size
- Faster download times
- Removed development code

## Runtime Optimizations

### 1. Debouncing

Use for operations that don't need immediate execution:

```typescript
import { debounce } from '../utils/performanceOptimizations';

const debouncedSave = debounce(saveData, 300);
```

**Use Cases:**
- Auto-save operations
- Search input handling
- API calls

### 2. Throttling

Use for operations that should execute at regular intervals:

```typescript
import { throttle } from '../utils/performanceOptimizations';

const throttledScroll = throttle(handleScroll, 100);
```

**Use Cases:**
- Scroll handlers
- Resize handlers
- Mouse move tracking

### 3. Request Idle Callback

Schedule non-critical work during browser idle time:

```typescript
import { requestIdleCallback } from '../utils/performanceOptimizations';

requestIdleCallback(() => {
  // Non-critical work
});
```

## Performance Monitoring

### Development Mode

In development, you can measure component render times:

```typescript
import { measureRenderTime } from '../utils/performanceOptimizations';

measureRenderTime('ComponentName', () => {
  // Component render logic
});
```

### React DevTools Profiler

Use React DevTools Profiler to identify performance bottlenecks:

1. Open React DevTools
2. Go to Profiler tab
3. Start recording
4. Perform actions in the app
5. Stop recording and analyze

## Best Practices

### 1. Avoid Inline Functions

❌ Bad:
```typescript
<Component onClick={() => handleClick(id)} />
```

✅ Good:
```typescript
const handleClick = useCallback(() => handleClick(id), [id]);
<Component onClick={handleClick} />
```

### 2. Avoid Inline Objects

❌ Bad:
```typescript
<Component style={{ margin: 10 }} />
```

✅ Good:
```typescript
const style = useMemo(() => ({ margin: 10 }), []);
<Component style={style} />
```

### 3. Use Keys Properly

❌ Bad:
```typescript
{items.map((item, index) => <Item key={index} />)}
```

✅ Good:
```typescript
{items.map((item) => <Item key={item.id} />)}
```

### 4. Virtualize Long Lists

For lists with many items, use virtualization:

```typescript
import { getVisibleItems } from '../utils/performanceOptimizations';

const { visibleItems } = getVisibleItems(
  allItems,
  scrollTop,
  containerHeight,
  itemHeight
);
```

## Performance Metrics

### Target Metrics

- **Initial Load:** < 2 seconds
- **Time to Interactive:** < 3 seconds
- **Typing Latency:** < 16ms (60 FPS)
- **Bundle Size:** < 500KB (gzipped)

### Measuring Performance

```bash
# Build and analyze bundle
pnpm run build
pnpm run preview

# Check bundle size
ls -lh dist/assets/
```

## Troubleshooting

### Slow Typing Response

1. Check if TypingInterface is memoized
2. Verify renderCharacter is using useCallback
3. Ensure renderedContent is memoized
4. Check for unnecessary re-renders in DevTools

### High Memory Usage

1. Check for memory leaks in useEffect cleanup
2. Verify timers are cleared properly
3. Check for large objects in state
4. Use Chrome DevTools Memory Profiler

### Large Bundle Size

1. Analyze bundle with `vite-bundle-visualizer`
2. Check for duplicate dependencies
3. Ensure tree-shaking is working
4. Consider dynamic imports for large libraries

## Future Optimizations

Potential areas for further optimization:

1. **Web Workers** - Move heavy calculations off main thread
2. **Service Workers** - Cache assets for offline use
3. **IndexedDB** - Store large amounts of session data
4. **Virtual Scrolling** - For session history with many items
5. **Image Optimization** - Lazy load and optimize images
6. **Prefetching** - Preload likely next pages

## Resources

- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [Vite Performance](https://vitejs.dev/guide/performance.html)
- [Web Vitals](https://web.dev/vitals/)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
