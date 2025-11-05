import { useEffect, useState } from 'react';

interface VirtualKeyboardState {
  isVisible: boolean;
  height: number;
}

/**
 * Hook to detect virtual keyboard visibility on mobile devices
 * Uses the Visual Viewport API when available
 */
export function useVirtualKeyboard(): VirtualKeyboardState {
  const [keyboardState, setKeyboardState] = useState<VirtualKeyboardState>({
    isVisible: false,
    height: 0,
  });

  useEffect(() => {
    // Check if Visual Viewport API is available
    if (!window.visualViewport) {
      return;
    }

    const viewport = window.visualViewport;
    const initialHeight = viewport.height;

    const handleResize = () => {
      const currentHeight = viewport.height;
      const heightDifference = initialHeight - currentHeight;

      // If viewport height decreased significantly, keyboard is likely visible
      const isKeyboardVisible = heightDifference > 150; // threshold in pixels

      setKeyboardState({
        isVisible: isKeyboardVisible,
        height: isKeyboardVisible ? heightDifference : 0,
      });
    };

    viewport.addEventListener('resize', handleResize);
    viewport.addEventListener('scroll', handleResize);

    return () => {
      viewport.removeEventListener('resize', handleResize);
      viewport.removeEventListener('scroll', handleResize);
    };
  }, []);

  return keyboardState;
}

/**
 * Hook to adjust layout when virtual keyboard is visible
 */
export function useKeyboardAwareLayout() {
  const keyboard = useVirtualKeyboard();
  const [adjustedPadding, setAdjustedPadding] = useState(0);

  useEffect(() => {
    if (keyboard.isVisible) {
      // Add padding to prevent content from being hidden behind keyboard
      setAdjustedPadding(keyboard.height);
    } else {
      setAdjustedPadding(0);
    }
  }, [keyboard.isVisible, keyboard.height]);

  return {
    isKeyboardVisible: keyboard.isVisible,
    keyboardHeight: keyboard.height,
    paddingBottom: adjustedPadding,
  };
}
