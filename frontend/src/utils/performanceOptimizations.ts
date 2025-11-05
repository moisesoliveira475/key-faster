/**
 * Performance optimization utilities
 * Provides helpers for efficient rendering and state management
 */

/**
 * Debounce function to limit how often a function can be called
 * Useful for expensive operations like API calls or complex calculations
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to ensure a function is called at most once per specified time period
 * Useful for scroll handlers, resize handlers, etc.
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Request idle callback wrapper with fallback for browsers that don't support it
 */
export function requestIdleCallback(callback: () => void, options?: { timeout?: number }) {
  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, options);
  } else {
    // Fallback for browsers that don't support requestIdleCallback
    return setTimeout(callback, 1);
  }
}

/**
 * Cancel idle callback with fallback
 */
export function cancelIdleCallback(id: number) {
  if ('cancelIdleCallback' in window) {
    window.cancelIdleCallback(id);
  } else {
    clearTimeout(id);
  }
}

/**
 * Batch state updates to reduce re-renders
 * Useful when multiple state updates need to happen together
 */
export function batchUpdates(callback: () => void) {
  // React 18+ automatically batches updates, but this provides explicit batching
  // for older versions or edge cases
  if ('startTransition' in React) {
    React.startTransition(callback);
  } else {
    callback();
  }
}

// Import React for startTransition check
import * as React from 'react';

/**
 * Shallow comparison for objects
 * Useful for memo and shouldComponentUpdate optimizations
 */
export function shallowEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;

  if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!Object.hasOwn(obj2, key) || obj1[key] !== obj2[key]) {
      return false;
    }
  }

  return true;
}

/**
 * Virtual scrolling helper for large lists
 * Returns visible items based on scroll position
 */
export function getVisibleItems<T>(
  items: T[],
  scrollTop: number,
  containerHeight: number,
  itemHeight: number,
  overscan: number = 3
): { visibleItems: T[]; startIndex: number; endIndex: number } {
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  return {
    visibleItems: items.slice(startIndex, endIndex + 1),
    startIndex,
    endIndex,
  };
}

/**
 * Measure component render time (development only)
 */
export function measureRenderTime(componentName: string, callback: () => void) {
  if (import.meta.env.DEV) {
    const start = performance.now();
    callback();
    const end = performance.now();
    console.log(`[Performance] ${componentName} rendered in ${(end - start).toFixed(2)}ms`);
  } else {
    callback();
  }
}

/**
 * Preload component for faster navigation
 */
export function preloadComponent(importFn: () => Promise<any>) {
  return importFn();
}
