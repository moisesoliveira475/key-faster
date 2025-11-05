# Metrics Dashboard Components

This document describes the metrics dashboard and progress tracking components implemented for the Typing Study App.

## Components Overview

### 1. MetricsDashboard Component
**File:** `MetricsDashboard.tsx`

**Purpose:** Displays current session metrics, session summary, and overall statistics with real-time updates.

**Features:**
- Real-time metrics display (WPM, accuracy, errors, time)
- Improvement indicators comparing current session to historical average
- Session summary with detailed statistics
- Overall statistics across all sessions
- Best session highlights
- Empty state for new users
- Performance rating system

**Props:**
- `showSummary?: boolean` - Whether to show the detailed session summary

**Usage:**
```tsx
import { MetricsDashboard } from './components';

<MetricsDashboard showSummary={true} />
```

### 2. ProgressChart Component
**File:** `ProgressChart.tsx`

**Purpose:** Visualizes WPM or accuracy trends over time using line charts.

**Features:**
- Line chart with chronological session data
- Moving average trend line (3-session window)
- Responsive design with Recharts library
- Customizable metric display (WPM or accuracy)
- Empty state for no data
- Tooltip with detailed information

**Props:**
- `sessions: HistoricalSession[]` - Array of historical sessions to display
- `metric: 'wpm' | 'accuracy'` - Which metric to visualize
- `height?: number` - Chart height in pixels (default: 300)

**Usage:**
```tsx
import { ProgressChart } from './components';

<ProgressChart 
  sessions={sessionHistory} 
  metric="wpm"
  height={300}
/>
```

### 3. SessionHistory Component
**File:** `SessionHistory.tsx`

**Purpose:** Displays a sortable, filterable table of all completed typing sessions.

**Features:**
- Sortable columns (date, WPM, accuracy, duration)
- Filter by theme (text search)
- Filter by keyboard layout (dropdown)
- Color-coded metrics (WPM and accuracy)
- Delete session functionality
- Responsive table design
- Empty state for no sessions

**Usage:**
```tsx
import { SessionHistory } from './components';

<SessionHistory />
```

### 4. ProgressTracker Component
**File:** `ProgressTracker.tsx`

**Purpose:** Comprehensive progress tracking with charts, achievements, and personal records.

**Features:**
- Time range filtering (7 days, 30 days, 90 days, all time)
- Toggle between WPM and accuracy charts
- Improvement trend calculation
- Achievement system with 6 different achievements:
  - Sessions Completed
  - Practice Hours
  - Current Streak
  - High Accuracy Sessions (95%+)
  - Fast Typing Sessions (60+ WPM)
  - Perfect Sessions (100% accuracy)
- Progress bars for each achievement
- Personal records display
- Visual indicators for completed achievements

**Usage:**
```tsx
import { ProgressTracker } from './components';

<ProgressTracker />
```

## Data Requirements

All components rely on the following stores:
- `useTypingSessionStore` - Current session data
- `useMetricsStore` - Historical session data and statistics

### Required Types
```typescript
interface HistoricalSession {
  sessionId: string;
  theme: string;
  date: Date;
  wpm: number;
  accuracy: number;
  duration: number;
  errorCount: number;
  keyboardLayout: KeyboardLayoutType;
}

interface SessionMetrics {
  wpm: number;
  averageWPM: number;
  accuracy: number;
  totalCharacters: number;
  correctCharacters: number;
  errorCount: number;
  timeElapsed: number;
  keystrokesPerMinute: number;
}
```

## Dependencies

### External Libraries
- **recharts** (v3.2.1) - For chart visualization
  - Install: `pnpm add recharts`

### Internal Dependencies
- Zustand stores (useTypingSessionStore, useMetricsStore)
- Utility functions (formatTime from metricsCalculator)
- Type definitions from types/index.ts

## Styling

All components use Tailwind CSS with dark mode support:
- Responsive grid layouts
- Color-coded metrics (blue for WPM, green for accuracy, red for errors)
- Smooth transitions and hover effects
- Consistent spacing and typography
- Dark mode variants for all elements

## Integration Example

See `frontend/src/pages/DashboardDemo.tsx` for a complete example of how to integrate all metrics components with tab navigation.

## Requirements Fulfilled

This implementation satisfies the following requirements from the spec:

**Requirement 5.2:** Display WPM current and average during typing
**Requirement 6.3:** Show detailed error statistics after session
**Requirement 7.1:** Store historical performance data
**Requirement 7.2:** Display progress graphs over time
**Requirement 7.3:** Calculate improvement trends

## Future Enhancements

Potential improvements for future iterations:
- Export session data to CSV/JSON
- Compare sessions side-by-side
- Custom achievement creation
- Social sharing of achievements
- Weekly/monthly progress reports
- Goal setting and tracking
- Heatmap calendar view of practice days
