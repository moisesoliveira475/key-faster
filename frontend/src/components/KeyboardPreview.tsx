import type React from 'react';
import { getKeyboardLayout } from '../config/keyboardLayouts';
import type { KeyboardLayoutType } from '../types';

interface KeyboardPreviewProps {
  layout: KeyboardLayoutType;
  highlightedKey?: string;
  className?: string;
}

/**
 * Visual keyboard preview component
 * Shows the physical layout of keys for the selected keyboard layout
 */
export const KeyboardPreview: React.FC<KeyboardPreviewProps> = ({
  layout,
  highlightedKey,
  className = '',
}) => {
  const keyboardLayout = getKeyboardLayout(layout);

  // Define keyboard rows based on physical layout
  const getKeyboardRows = () => {
    switch (layout) {
      case 'QWERTY':
        return [
          ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
          ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
          ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"],
          ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
        ];
      case 'DVORAK':
        return [
          ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '[', ']'],
          ["'", ',', '.', 'p', 'y', 'f', 'g', 'c', 'r', 'l', '/', '=', '\\'],
          ['a', 'o', 'e', 'u', 'i', 'd', 'h', 't', 'n', 's', '-'],
          [';', 'q', 'j', 'k', 'x', 'b', 'm', 'w', 'v', 'z'],
        ];
      case 'AZERTY':
        return [
          ['²', '&', 'é', '"', "'", '(', '-', 'è', '_', 'ç', 'à', ')', '='],
          ['a', 'z', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '^', '$', '*'],
          ['q', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'ù'],
          ['w', 'x', 'c', 'v', 'b', 'n', ',', ';', ':', '!'],
        ];
      default:
        return [];
    }
  };

  const rows = getKeyboardRows();

  const isKeyHighlighted = (key: string): boolean => {
    if (!highlightedKey) return false;
    return key.toLowerCase() === highlightedKey.toLowerCase();
  };

  return (
    <div className={`keyboard-preview ${className}`}>
      <div className="space-y-1">
        {rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="flex justify-center gap-1"
            style={{ paddingLeft: `${rowIndex * 8}px` }}
          >
            {row.map((key, keyIndex) => (
              <div
                key={`${rowIndex}-${keyIndex}`}
                className={`
                  min-w-[2.5rem] h-10 flex items-center justify-center
                  rounded border-2 text-sm font-medium
                  transition-all duration-200
                  ${
                    isKeyHighlighted(key)
                      ? 'bg-blue-500 text-white border-blue-600 scale-110 shadow-lg'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                  }
                `}
              >
                {key}
              </div>
            ))}
          </div>
        ))}
        {/* Space bar */}
        <div className="flex justify-center pt-1">
          <div
            className={`
              w-64 h-10 flex items-center justify-center
              rounded border-2 text-sm font-medium
              transition-all duration-200
              ${
                isKeyHighlighted(' ')
                  ? 'bg-blue-500 text-white border-blue-600 scale-105 shadow-lg'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
              }
            `}
          >
            Space
          </div>
        </div>
      </div>
      <div className="mt-3 text-center text-sm text-gray-600">{keyboardLayout.description}</div>
    </div>
  );
};
