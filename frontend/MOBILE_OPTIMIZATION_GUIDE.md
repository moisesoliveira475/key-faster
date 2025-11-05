# Mobile Optimization Guide

This document describes the mobile-specific features and optimizations implemented in the Typing Study App.

## Overview

The app is fully responsive and optimized for mobile devices with touch-friendly controls, virtual keyboard detection, and performance optimizations.

## Features Implemented

### 1. Responsive Design System

#### Media Query Hooks
- `useIsMobile()` - Detects mobile devices (max-width: 768px)
- `useIsTablet()` - Detects tablet devices (769px - 1024px)
- `useIsDesktop()` - Detects desktop devices (min-width: 1025px)
- `useIsTouchDevice()` - Detects touch capability

#### Responsive Components
- **ResponsiveContainer** - Adapts padding and spacing for mobile/desktop
- **ResponsiveCard** - Mobile-optimized card with appropriate shadows
- **ResponsiveGrid** - Configurable grid columns for different breakpoints
- **ResponsiveNav** - Adaptive navigation (sidebar on desktop, bottom bar on mobile)

### 2. Mobile-Specific Features

#### Virtual Keyboard Detection
- `useVirtualKeyboard()` - Detects when virtual keyboard is visible
- `useKeyboardAwareLayout()` - Adjusts layout to prevent content hiding
- Automatic padding adjustment when keyboard appears

#### Touch Gestures
- `useSwipeGesture()` - Detects swipe gestures (left, right, up, down)
- `useLongPress()` - Detects long press interactions
- Configurable thresholds and callbacks

#### Mobile Controls
- **MobileTypingControls** - Touch-friendly pause/resume/restart buttons
- Keyboard-aware positioning
- Large touch targets (minimum 44x44px)

#### Settings Panel
- **MobileSettingsPanel** - Slide-up settings drawer
- Haptic feedback support
- Touch-optimized toggles and buttons

### 3. Performance Optimizations

#### Utility Functions
- `debounce()` - Debounce function calls for performance
- `throttle()` - Throttle function calls to limit frequency
- `rafThrottle()` - Request animation frame throttling
- `prefersReducedMotion()` - Respect user motion preferences

#### Mobile-Specific Optimizations
- Reduced animations on mobile
- Optimized font sizes for readability
- Touch-friendly spacing (larger gaps and padding)
- Efficient re-renders with proper memoization

### 4. Accessibility Features

#### Touch Targets
- All interactive elements have minimum 44x44px touch targets
- Adequate spacing between touch elements
- Visual feedback on touch interactions

#### Safe Area Support
- Support for notched devices (iPhone X and later)
- Safe area insets for top and bottom
- Proper padding for home indicator

#### Haptic Feedback
- Optional vibration feedback on interactions
- Configurable in settings
- Respects device capabilities

## Usage Examples

### Using Media Query Hooks

```typescript
import { useIsMobile } from '../hooks/useMediaQuery';

function MyComponent() {
  const isMobile = useIsMobile();
  
  return (
    <div className={isMobile ? 'p-4' : 'p-6'}>
      {isMobile ? 'Mobile View' : 'Desktop View'}
    </div>
  );
}
```

### Using Virtual Keyboard Detection

```typescript
import { useKeyboardAwareLayout } from '../hooks/useVirtualKeyboard';

function TypingComponent() {
  const { isKeyboardVisible, paddingBottom } = useKeyboardAwareLayout();
  
  return (
    <div style={{ paddingBottom: `${paddingBottom}px` }}>
      {isKeyboardVisible && <p>Keyboard is visible</p>}
    </div>
  );
}
```

### Using Swipe Gestures

```typescript
import { useSwipeGesture } from '../hooks/useSwipeGesture';

function SwipeableComponent() {
  const swipeHandlers = useSwipeGesture({
    onSwipeLeft: () => console.log('Swiped left'),
    onSwipeRight: () => console.log('Swiped right'),
    threshold: 50,
  });
  
  return <div {...swipeHandlers}>Swipe me!</div>;
}
```

### Using Mobile Optimizations

```typescript
import { debounce, vibrate, preventScroll } from '../utils/mobileOptimizations';

// Debounce search input
const handleSearch = debounce((query: string) => {
  // Perform search
}, 300);

// Haptic feedback
const handleButtonClick = () => {
  vibrate(10); // Vibrate for 10ms
  // Handle click
};

// Prevent scroll when modal is open
useEffect(() => {
  if (isModalOpen) {
    preventScroll(true);
    return () => preventScroll(false);
  }
}, [isModalOpen]);
```

## CSS Utilities

### Touch-Friendly Classes

```css
.touch-manipulation {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.safe-area-inset-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

.no-select {
  user-select: none;
}

.smooth-scroll {
  -webkit-overflow-scrolling: touch;
}
```

## Best Practices

### 1. Touch Targets
- Minimum size: 44x44px
- Adequate spacing: 8px minimum between elements
- Use `touch-manipulation` class for better responsiveness

### 2. Performance
- Use `debounce` for scroll/resize handlers
- Use `throttle` for frequent updates
- Implement lazy loading for images and components
- Minimize re-renders with proper memoization

### 3. Keyboard Handling
- Always use `useKeyboardAwareLayout` for input-heavy screens
- Provide visual feedback when keyboard is active
- Ensure important content isn't hidden behind keyboard

### 4. Gestures
- Provide visual feedback for swipe actions
- Don't rely solely on gestures (provide button alternatives)
- Test gestures on actual devices

### 5. Accessibility
- Support safe area insets for notched devices
- Respect `prefers-reduced-motion`
- Provide haptic feedback as optional feature
- Ensure sufficient color contrast

## Testing on Mobile

### Browser DevTools
1. Open Chrome DevTools
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select device or set custom dimensions
4. Test touch interactions

### Real Device Testing
1. Connect device via USB
2. Enable USB debugging (Android) or Web Inspector (iOS)
3. Test on actual device for accurate touch behavior
4. Verify virtual keyboard behavior
5. Test safe area insets on notched devices

## Known Limitations

1. Virtual keyboard detection may not work on all browsers
2. Haptic feedback requires browser support
3. Safe area insets require modern browsers
4. Some gestures may conflict with browser gestures

## Future Enhancements

- [ ] Pull-to-refresh gesture
- [ ] Pinch-to-zoom for text size
- [ ] Offline mode with service workers
- [ ] Progressive Web App (PWA) support
- [ ] Native app wrapper (Capacitor/React Native)
