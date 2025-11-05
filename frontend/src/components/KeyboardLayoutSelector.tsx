import type React from 'react';
import { useState } from 'react';
import { DEFAULT_LAYOUT, getAllKeyboardLayouts } from '../config/keyboardLayouts';
import { useIsMobile } from '../hooks/useMediaQuery';
import { usePreferencesStore } from '../stores/usePreferencesStore';
import type { KeyboardLayoutType } from '../types';
import { KeyboardPreview } from './KeyboardPreview';

interface KeyboardLayoutSelectorProps {
  className?: string;
  showPreview?: boolean;
}

/**
 * Keyboard Layout Selector Component
 * Allows users to select their preferred keyboard layout with visual preview
 */
export const KeyboardLayoutSelector: React.FC<KeyboardLayoutSelectorProps> = ({
  className = '',
  showPreview = true,
}) => {
  const { keyboardLayout, setKeyboardLayout } = usePreferencesStore();
  const [previewLayout, setPreviewLayout] = useState<KeyboardLayoutType>(keyboardLayout);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const isMobile = useIsMobile();

  const layouts = getAllKeyboardLayouts();

  const handleLayoutSelect = (layout: KeyboardLayoutType) => {
    setKeyboardLayout(layout);
    setPreviewLayout(layout);
    setIsPreviewMode(false);
  };

  const handleLayoutHover = (layout: KeyboardLayoutType) => {
    if (showPreview) {
      setPreviewLayout(layout);
      setIsPreviewMode(true);
    }
  };

  const handleMouseLeave = () => {
    setIsPreviewMode(false);
    setPreviewLayout(keyboardLayout);
  };

  return (
    <div className={`keyboard-layout-selector ${className}`}>
      <div className={isMobile ? 'mb-3' : 'mb-4'}>
        <label
          className={`block font-medium text-gray-700 dark:text-gray-300 mb-2 ${isMobile ? 'text-sm' : 'text-sm'}`}
        >
          Keyboard Layout
        </label>
        <p
          className={`text-gray-500 dark:text-gray-400 ${isMobile ? 'text-xs mb-2' : 'text-xs mb-3'}`}
        >
          Select your keyboard layout for accurate typing practice
        </p>
      </div>

      {/* Layout Selection Buttons */}
      <div
        className={`flex ${isMobile ? 'flex-col' : 'flex-wrap'} gap-3 ${isMobile ? 'mb-4' : 'mb-6'}`}
      >
        {layouts.map((layout) => (
          <button
            key={layout.id}
            onClick={() => handleLayoutSelect(layout.id)}
            onMouseEnter={() => !isMobile && handleLayoutHover(layout.id)}
            onMouseLeave={handleMouseLeave}
            className={`
              ${isMobile ? 'w-full px-4 py-3' : 'px-6 py-3'} rounded-lg border-2 font-medium
              transition-all duration-200 touch-manipulation
              ${
                keyboardLayout === layout.id
                  ? 'bg-blue-500 text-white border-blue-600 shadow-md'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-sm'
              }
            `}
            aria-label={`Select ${layout.name} keyboard layout`}
            aria-pressed={keyboardLayout === layout.id}
          >
            <div className={`flex ${isMobile ? 'justify-between' : 'flex-col'} items-center gap-2`}>
              <div className={isMobile ? 'text-base' : 'text-lg'}>{layout.name}</div>
              <div className={`text-xs opacity-75 ${isMobile ? '' : 'mt-1'}`}>
                {layout.id === 'QWERTY' && 'Standard'}
                {layout.id === 'DVORAK' && 'Efficient'}
                {layout.id === 'AZERTY' && 'French'}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Layout Description */}
      <div
        className={`${isMobile ? 'mb-3 p-3' : 'mb-4 p-3'} bg-gray-50 dark:bg-gray-700 rounded-lg`}
      >
        <p className={`text-gray-700 dark:text-gray-300 ${isMobile ? 'text-xs' : 'text-sm'}`}>
          <span className="font-medium">{isPreviewMode ? 'Preview: ' : 'Current: '}</span>
          {layouts.find((l) => l.id === previewLayout)?.description || 'Standard QWERTY layout'}
        </p>
      </div>

      {/* Visual Keyboard Preview */}
      {showPreview && !isMobile && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            {isPreviewMode ? 'Preview' : 'Current Layout'}
          </h3>
          <KeyboardPreview layout={previewLayout} />
        </div>
      )}

      {/* Fallback Notice */}
      {keyboardLayout !== DEFAULT_LAYOUT && (
        <div
          className={`mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg`}
        >
          <p className={`text-blue-800 dark:text-blue-300 ${isMobile ? 'text-xs' : 'text-xs'}`}>
            <span className="font-medium">Note:</span> If your layout is not working correctly, the
            system will automatically fall back to {DEFAULT_LAYOUT}.
          </p>
        </div>
      )}
    </div>
  );
};
