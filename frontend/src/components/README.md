# Components

## ThemeSelector

The `ThemeSelector` component allows users to choose a theme for their typing practice session.

### Features

- **Custom Theme Input**: Users can enter custom themes with real-time validation
- **Character Limit**: Enforces 100 character limit with visual counter (Requirement 1.4)
- **Theme Validation**: Validates themes in Portuguese and English (Requirement 1.2)
- **Suggestions**: Provides predefined theme suggestions based on user language
- **Autocomplete**: Filters suggestions as user types
- **Recent Themes**: Displays recently used themes with usage statistics
- **Local Storage Integration**: Persists recent themes across sessions (Requirement 1.3)
- **Bilingual Support**: Supports both Portuguese and English interfaces

### Usage

```tsx
import { ThemeSelector } from './components';

function App() {
  const handleThemeSelect = (theme: string) => {
    console.log('Selected theme:', theme);
    // Fetch content for the selected theme
  };

  return (
    <ThemeSelector onThemeSelect={handleThemeSelect} />
  );
}
```

### Props

- `onThemeSelect: (theme: string) => void` - Callback function called when a theme is selected
- `className?: string` - Optional CSS class for styling

### Requirements Satisfied

- **1.1**: Interface for theme selection
- **1.2**: Validates and accepts themes in Portuguese and English
- **1.3**: Saves theme preferences for future sessions via local storage
- **1.4**: Allows custom themes up to 100 characters

### Implementation Details

- Uses Zustand store for state management
- Integrates with `usePreferencesStore` for persistence
- Validates input using `validateTheme` and `sanitizeTheme` utilities
- Maintains list of up to 10 recent themes
- Tracks usage count and last used date for each theme
- Provides visual feedback for validation errors
- Responsive design with Tailwind CSS
