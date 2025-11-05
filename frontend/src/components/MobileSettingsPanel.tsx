import { useState } from 'react';
import { useIsMobile } from '../hooks/useMediaQuery';
import { usePreferencesStore } from '../stores/usePreferencesStore';
import { vibrate } from '../utils/mobileOptimizations';

interface MobileSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Mobile-optimized settings panel with slide-up animation
 */
export const MobileSettingsPanel = ({ isOpen, onClose }: MobileSettingsPanelProps) => {
  const isMobile = useIsMobile();
  const { highlightErrors, setHighlightErrors, language, setLanguage } = usePreferencesStore();

  const [hapticFeedback, setHapticFeedback] = useState(true);

  if (!isMobile) {
    return null;
  }

  const handleToggle = (setter: (value: boolean) => void, currentValue: boolean) => {
    if (hapticFeedback) {
      vibrate(10);
    }
    setter(!currentValue);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 transition-opacity" onClick={onClose} />
      )}

      {/* Settings Panel */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-2xl shadow-2xl z-50 transform transition-transform duration-300 ease-out safe-area-inset-bottom ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-manipulation"
          >
            <svg
              className="w-6 h-6 text-gray-600 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Settings Content */}
        <div className="px-4 py-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-4">
            {/* Error Highlighting */}
            <div className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Highlight Errors</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Show visual feedback for mistakes
                </div>
              </div>
              <button
                onClick={() => handleToggle(setHighlightErrors, highlightErrors)}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors touch-manipulation ${
                  highlightErrors ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    highlightErrors ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Language Selection */}
            <div className="py-3">
              <div className="font-medium text-gray-900 dark:text-white mb-3">Language</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    if (hapticFeedback) vibrate(10);
                    setLanguage('en');
                  }}
                  className={`py-3 px-4 rounded-lg font-medium transition-colors touch-manipulation ${
                    language === 'en'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => {
                    if (hapticFeedback) vibrate(10);
                    setLanguage('pt');
                  }}
                  className={`py-3 px-4 rounded-lg font-medium transition-colors touch-manipulation ${
                    language === 'pt'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Português
                </button>
              </div>
            </div>

            {/* Haptic Feedback */}
            <div className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Haptic Feedback</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Vibrate on interactions
                </div>
              </div>
              <button
                onClick={() => {
                  if (hapticFeedback) vibrate(10);
                  setHapticFeedback(!hapticFeedback);
                }}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors touch-manipulation ${
                  hapticFeedback ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    hapticFeedback ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Device Info */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <div>
                  Screen: {window.innerWidth} × {window.innerHeight}
                </div>
                <div>Pixel Ratio: {window.devicePixelRatio}x</div>
                <div>Touch Support: {'ontouchstart' in window ? 'Yes' : 'No'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
