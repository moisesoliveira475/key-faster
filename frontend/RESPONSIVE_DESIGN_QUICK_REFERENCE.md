# Responsive Design Quick Reference

## Quick Start

### 1. Detect Device Type

```typescript
import { useIsMobile, useIsTablet, useIsDesktop } from '../hooks/useMediaQuery';

function MyComponent() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = useIsDesktop();
  
  return <div>{isMobile ? 'Mobile' : 'Desktop'}</div>;
}
```

### 2. Use Responsive Components

```typescript
import { ResponsiveCard, ResponsiveContainer } from '../components';

function MyComponent() {
  return (
    <ResponsiveCard title="My Card">
      <ResponsiveContainer>
        Content automatically adapts to screen size
      </ResponsiveContainer>
    </ResponsiveCard>
  );
}
```

### 3. Handle Virtual Keyboard

```typescript
import { useKeyboardAwareLayout } from '../hooks/useVirtualKeyboard';

function InputComponent() {
  const { isKeyboardVisible, paddingBottom } = useKeyboardAwareLayout();
  
  return (
    <div style={{ paddingBottom: `${paddingBottom}px` }}>
      <input type="text" />
    </div>
  );
}
```

## Common Patterns

### Conditional Rendering

```typescript
const isMobile = useIsMobile();

return (
  <>
    {isMobile ? (
      <MobileView />
    ) : (
      <DesktopView />
    )}
  </>
);
```

### Responsive Styling

```typescript
const isMobile = useIsMobile();

return (
  <div className={`
    ${isMobile ? 'p-4 text-sm' : 'p-6 text-base'}
    bg-white rounded-lg
  `}>
    Content
  </div>
);
```

### Touch-Friendly Buttons

```typescript
<button className="
  px-6 py-3
  min-h-[44px] min-w-[44px]
  touch-manipulation
  bg-blue-600 text-white
  rounded-lg
">
  Click Me
</button>
```

## Tailwind Classes

### Responsive Utilities
- `md:` - Tablet and up (≥768px)
- `lg:` - Desktop and up (≥1024px)
- `xl:` - Large desktop (≥1280px)

### Mobile-Specific
- `touch-manipulation` - Better touch responsiveness
- `safe-area-inset-bottom` - Safe area padding
- `no-select` - Prevent text selection
- `smooth-scroll` - Smooth scrolling

### Example
```tsx
<div className="
  px-4 py-3          // Mobile
  md:px-6 md:py-4    // Tablet+
  lg:px-8 lg:py-6    // Desktop+
">
  Content
</div>
```

## Performance Tips

### 1. Debounce Expensive Operations
```typescript
import { debounce } from '../utils/mobileOptimizations';

const handleSearch = debounce((query: string) => {
  // Expensive search operation
}, 300);
```

### 2. Throttle Frequent Updates
```typescript
import { throttle } from '../utils/mobileOptimizations';

const handleScroll = throttle(() => {
  // Handle scroll
}, 100);
```

### 3. Use RAF for Animations
```typescript
import { rafThrottle } from '../utils/mobileOptimizations';

const handleAnimation = rafThrottle(() => {
  // Animation logic
});
```

## Accessibility Checklist

- [ ] Touch targets ≥44x44px
- [ ] Spacing between elements ≥8px
- [ ] Support safe area insets
- [ ] Respect reduced motion
- [ ] Provide haptic feedback (optional)
- [ ] Ensure color contrast
- [ ] Support dark mode

## Common Issues & Solutions

### Issue: Content hidden by keyboard
**Solution:** Use `useKeyboardAwareLayout()`

### Issue: Touch targets too small
**Solution:** Add `min-h-[44px] min-w-[44px]`

### Issue: Slow scroll performance
**Solution:** Use `throttle()` or `debounce()`

### Issue: Text selection on buttons
**Solution:** Add `no-select` class

### Issue: Tap delay on iOS
**Solution:** Add `touch-manipulation` class

## Testing Checklist

- [ ] Test on Chrome DevTools device emulator
- [ ] Test on actual mobile device
- [ ] Verify touch interactions
- [ ] Check virtual keyboard behavior
- [ ] Test landscape and portrait
- [ ] Verify safe area insets
- [ ] Test dark mode
- [ ] Check performance on low-end devices
