/**
 * Skeleton Loading Components
 * Provides visual feedback while content is loading
 */

interface SkeletonProps {
  className?: string;
}

/**
 * Base skeleton component
 */
export const Skeleton = ({ className = '' }: SkeletonProps) => {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
      aria-label="Loading..."
    />
  );
};

/**
 * Skeleton for text lines
 */
export const SkeletonText = ({
  lines = 3,
  className = '',
}: {
  lines?: number;
  className?: string;
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`} />
      ))}
    </div>
  );
};

/**
 * Skeleton for cards
 */
export const SkeletonCard = ({ className = '' }: SkeletonProps) => {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6 ${className}`}
    >
      <Skeleton className="h-6 w-1/3 mb-4" />
      <SkeletonText lines={4} />
    </div>
  );
};

/**
 * Skeleton for metrics dashboard
 */
export const SkeletonMetrics = () => {
  return (
    <div className="space-y-6">
      {/* Current Session Metrics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6">
        <Skeleton className="h-6 w-1/4 mb-4" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Skeleton className="h-10 w-16 mx-auto mb-2" />
              <Skeleton className="h-4 w-12 mx-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6">
        <Skeleton className="h-6 w-1/3 mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Skeleton className="h-8 w-12 mx-auto mb-2" />
              <Skeleton className="h-3 w-16 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton for typing interface
 */
export const SkeletonTypingInterface = () => {
  return (
    <div className="space-y-4">
      <Skeleton className="h-2 w-full" />
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-300 dark:border-gray-600 min-h-[300px]">
        <SkeletonText lines={8} />
      </div>
      <Skeleton className="h-4 w-1/2 mx-auto" />
    </div>
  );
};

/**
 * Skeleton for content display
 */
export const SkeletonContent = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-24" />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6">
        <SkeletonText lines={6} />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
};

/**
 * Skeleton for theme selector
 */
export const SkeletonThemeSelector = () => {
  return (
    <div className="space-y-4">
      <div>
        <Skeleton className="h-5 w-24 mb-2" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div>
        <Skeleton className="h-5 w-32 mb-2" />
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-8 w-20" />
          ))}
        </div>
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  );
};

/**
 * Skeleton for keyboard layout selector
 */
export const SkeletonKeyboardLayout = () => {
  return (
    <div className="space-y-4">
      <div>
        <Skeleton className="h-5 w-40 mb-2" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-1">
              {Array.from({ length: 10 + i }).map((_, j) => (
                <Skeleton key={j} className="h-10 flex-1" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Full page loading skeleton
 */
export const SkeletonPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="grid md:grid-cols-2 gap-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <SkeletonCard />
      </div>
    </div>
  );
};

/**
 * Inline loading spinner
 */
export const LoadingSpinner = ({
  size = 'md',
  className = '',
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

/**
 * Loading overlay for full-screen loading
 */
export const LoadingOverlay = ({ message = 'Loading...' }: { message?: string }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl">
        <LoadingSpinner size="lg" className="mb-4" />
        <p className="text-gray-900 dark:text-white font-medium text-center">{message}</p>
      </div>
    </div>
  );
};
