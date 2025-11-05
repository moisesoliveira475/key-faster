import { useIsMobile } from '../hooks/useMediaQuery';
import { useKeyboardAwareLayout } from '../hooks/useVirtualKeyboard';

interface MobileTypingControlsProps {
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onRestart?: () => void;
  showRestart?: boolean;
}

/**
 * Mobile-optimized controls for typing interface
 * Includes touch-friendly buttons and keyboard-aware positioning
 */
export const MobileTypingControls = ({
  isPaused,
  onPause,
  onResume,
  onRestart,
  showRestart = false,
}: MobileTypingControlsProps) => {
  const isMobile = useIsMobile();
  const { isKeyboardVisible, paddingBottom } = useKeyboardAwareLayout();

  if (!isMobile) {
    return null;
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-40 safe-area-inset-bottom"
      style={{
        paddingBottom: isKeyboardVisible ? `${paddingBottom}px` : undefined,
      }}
    >
      <div className="flex items-center justify-around p-3 gap-2">
        {/* Pause/Resume Button */}
        <button
          onClick={isPaused ? onResume : onPause}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors touch-manipulation ${
            isPaused
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-yellow-600 hover:bg-yellow-700 text-white'
          }`}
        >
          {isPaused ? (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
              <span>Resume</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z" />
              </svg>
              <span>Pause</span>
            </>
          )}
        </button>

        {/* Restart Button */}
        {showRestart && onRestart && (
          <button
            onClick={onRestart}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium bg-gray-600 hover:bg-gray-700 text-white transition-colors touch-manipulation"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>Restart</span>
          </button>
        )}
      </div>

      {/* Keyboard indicator */}
      {isKeyboardVisible && (
        <div className="px-3 pb-2">
          <div className="text-xs text-center text-gray-500 dark:text-gray-400">
            Keyboard active
          </div>
        </div>
      )}
    </div>
  );
};
