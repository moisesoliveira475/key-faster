# Keyboard Layout System

## Overview

The keyboard layout system allows users to select their preferred keyboard layout (QWERTY, DVORAK, or AZERTY) for accurate typing practice. The system includes visual previews, layout persistence, and automatic fallback to QWERTY for unsupported layouts.

## Components

### KeyboardLayoutSelector

The main component for selecting keyboard layouts with visual preview.

#### Features

- **Layout Selection**: Choose from QWERTY, DVORAK, and AZERTY layouts
- **Visual Preview**: Interactive keyboard preview showing key positions
- **Hover Preview**: Preview layouts before selecting them
- **Persistence**: Automatically saves selected layout to local storage (Requirement 4.3)
- **Fallback Support**: Automatically falls back to QWERTY if layout is unsupported (Requirement 4.4)
- **Responsive Design**: Works on desktop and mobile devices

#### Usage

```tsx
import { KeyboardLayoutSelector } from './components';

function App() {
  return (
    <KeyboardLayoutSelector showPreview={true} />
  );
}
```

#### Props

- `className?: string` - Optional CSS class for styling
- `showPreview?: boolean` - Whether to show the visual keyboard preview (default: true)

### KeyboardPreview

Visual representation of a keyboard layout showing all keys.

#### Features

- **Layout Visualization**: Shows physical key positions for each layout
- **Key Highlighting**: Can highlight specific keys
- **Layout Description**: Displays description of the current layout

#### Usage

```tsx
import { KeyboardPreview } from './components';

function MyComponent() {
  return (
    <KeyboardPreview 
      layout="QWERTY" 
      highlightedKey="a"
    />
  );
}
```

#### Props

- `layout: KeyboardLayoutType` - The keyboard layout to display
- `highlightedKey?: string` - Optional key to highlight
- `className?: string` - Optional CSS class for styling

## Configuration

### Keyboard Layouts

Located in `frontend/src/config/keyboardLayouts.ts`

#### Supported Layouts

1. **QWERTY** (Default)
   - Standard layout used worldwide
   - Most common layout

2. **DVORAK**
   - Designed for efficiency and reduced finger movement
   - Alternative layout for advanced typists

3. **AZERTY**
   - Common in French-speaking countries
   - Includes French-specific characters

#### Layout Structure

Each layout includes:
- `id`: Unique identifier (KeyboardLayoutType)
- `name`: Display name
- `description`: Brief description
- `keyMapping`: Record of key mappings

### Functions

#### `getKeyboardLayout(layoutType: KeyboardLayoutType): KeyboardLayout`
Get a specific keyboard layout configuration.

#### `getAllKeyboardLayouts(): KeyboardLayout[]`
Get all available keyboard layouts.

#### `detectKeyboardLayout(): KeyboardLayoutType`
Attempt to detect the user's keyboard layout (currently returns default).

#### `isValidKeyboardLayout(layout: string): boolean`
Check if a layout type is supported.

#### `getKeyPosition(char: string, layout: KeyboardLayoutType)`
Get the physical position (row, col) of a key.

## Utilities

### Keyboard Utils

Located in `frontend/src/utils/keyboardUtils.ts`

#### Key Functions

##### `mapKeyToChar(key: string, layout: KeyboardLayoutType): string`
Map a physical key to its character based on the keyboard layout.

##### `isCharacterMatch(typedChar: string, expectedChar: string, layout: KeyboardLayoutType): boolean`
Check if a typed character matches the expected character for the given layout.

##### `validateKeyboardLayout(layout: string): KeyboardLayoutType`
Validate and sanitize keyboard layout selection, falling back to QWERTY if invalid.

##### `switchKeyboardLayout(newLayout: KeyboardLayoutType, onLayoutChange?: Function): KeyboardLayoutType`
Switch keyboard layout with validation and callback notification.

##### `normalizeTextForTyping(text: string): string`
Normalize text for typing practice by removing control characters and standardizing line endings.

## State Management

The keyboard layout preference is managed by the `usePreferencesStore` Zustand store.

### Store Actions

- `setKeyboardLayout(layout: KeyboardLayoutType)`: Update the selected keyboard layout
- Layout is automatically persisted to local storage via the persistence system

### Accessing Current Layout

```tsx
import { usePreferencesStore } from '../stores/usePreferencesStore';

function MyComponent() {
  const { keyboardLayout, setKeyboardLayout } = usePreferencesStore();
  
  // Use keyboardLayout...
}
```

## Requirements Satisfied

### Requirement 4.1
✅ **WHEN the user accesses settings THEN the system SHALL present options of layout de teclado**
- KeyboardLayoutSelector component provides clear layout options
- All three supported layouts (QWERTY, DVORAK, AZERTY) are displayed

### Requirement 4.2
✅ **WHEN a layout is selected THEN the system SHALL apply the layout immediately na interface**
- Layout selection updates the store immediately
- Changes are reflected in real-time via Zustand state management

### Requirement 4.3
✅ **WHEN the user digita THEN the system SHALL recognize teclas de acordo com o layout selecionado**
- `mapKeyToChar` function maps keys according to selected layout
- `isCharacterMatch` validates typed characters against expected characters
- Layout-aware character matching ready for typing interface integration

### Requirement 4.4
✅ **IF the layout não for suportado THEN the system SHALL usar QWERTY como padrão e notificar o usuário**
- `validateKeyboardLayout` function provides automatic fallback to QWERTY
- Visual notice displayed when non-default layout is selected
- `DEFAULT_LAYOUT` constant ensures consistent fallback behavior

## Integration with Typing Interface

The keyboard layout system is designed to integrate with the typing interface (Task 7):

1. **Character Validation**: Use `isCharacterMatch()` to validate user input
2. **Key Mapping**: Use `mapKeyToChar()` to handle different layouts
3. **Layout Display**: Use `KeyboardPreview` to show current key to press
4. **Error Detection**: Layout-aware error tracking using keyboard utilities

## Testing

To test the keyboard layout system:

1. **Layout Selection**: Click different layout buttons to switch layouts
2. **Preview**: Hover over layouts to see preview before selecting
3. **Persistence**: Refresh the page and verify layout is remembered
4. **Fallback**: Test with invalid layout values to verify QWERTY fallback

## Future Enhancements

Potential improvements for future iterations:

1. **Auto-detection**: Implement browser-based keyboard layout detection
2. **Custom Layouts**: Allow users to define custom keyboard layouts
3. **Layout Learning**: Provide tutorials for unfamiliar layouts
4. **Heatmap**: Show typing heatmap based on layout usage
5. **More Layouts**: Add support for additional layouts (Colemak, Workman, etc.)
