# ThemeSelector Component - Testing Guide

## Manual Testing Checklist

### Basic Functionality
- [ ] Component renders without errors
- [ ] Input field is visible and accepts text
- [ ] Character counter displays correctly (0/100)
- [ ] Submit button is disabled when input is empty

### Theme Input Validation
- [ ] Enter text less than 100 characters - should accept
- [ ] Enter text exactly 100 characters - should accept
- [ ] Try to enter more than 100 characters - should be blocked at 100
- [ ] Character counter turns orange/red when approaching limit (80+)
- [ ] Enter special characters (e.g., @#$%) - should show validation error
- [ ] Enter Portuguese characters (e.g., ção, ã, é) - should accept
- [ ] Enter English characters - should accept
- [ ] Enter empty/whitespace only - should show validation error

### Theme Suggestions
- [ ] Predefined suggestions are displayed
- [ ] Clicking a suggestion selects that theme
- [ ] Suggestions are in correct language (PT/EN based on preference)
- [ ] Typing in input filters suggestions
- [ ] Filtered suggestions appear in dropdown
- [ ] Clicking filtered suggestion selects it

### Recent Themes
- [ ] After selecting a theme, it appears in recent themes list
- [ ] Recent theme shows usage count
- [ ] Recent theme shows last used date
- [ ] Clicking recent theme selects it again
- [ ] Usage count increments when theme is reused
- [ ] Custom themes show "Custom" badge
- [ ] Hover over recent theme shows remove button
- [ ] Clicking remove button removes theme from list
- [ ] Maximum 10 recent themes are kept

### Local Storage Integration
- [ ] Select a theme and refresh page - theme should appear in recent themes
- [ ] Recent themes persist across browser sessions
- [ ] Usage counts persist across sessions
- [ ] Last used dates persist across sessions

### Accessibility
- [ ] Input has proper label
- [ ] Validation errors have aria-invalid and aria-describedby
- [ ] Error messages have role="alert"
- [ ] Remove buttons have aria-label
- [ ] Keyboard navigation works (Tab, Enter)
- [ ] Enter key submits theme from input

### Responsive Design
- [ ] Component looks good on desktop (1920px)
- [ ] Component looks good on tablet (768px)
- [ ] Component looks good on mobile (375px)
- [ ] Touch interactions work on mobile

### Edge Cases
- [ ] Rapid clicking submit button doesn't create duplicates
- [ ] Selecting same theme multiple times updates usage count
- [ ] Very long theme names are handled gracefully
- [ ] Themes with special characters in PT/EN work correctly
- [ ] Empty recent themes list displays correctly

## Testing with Different Languages

### Portuguese (pt)
1. Set language to 'pt' in preferences store
2. Verify suggestions are in Portuguese
3. Verify UI labels are in Portuguese
4. Test with Portuguese characters (ç, ã, õ, á, é, í, ó, ú)

### English (en)
1. Set language to 'en' in preferences store
2. Verify suggestions are in English
3. Verify UI labels are in English
4. Test with English characters

## Integration Testing

### With Preferences Store
- [ ] Theme selections update store correctly
- [ ] Recent themes sync with store
- [ ] Language preference affects component display
- [ ] Store changes reflect in component

### With Persistence Layer
- [ ] Changes persist to local storage
- [ ] Component loads persisted data on mount
- [ ] Multiple tabs sync correctly (if applicable)

## Performance Testing
- [ ] Component renders quickly (<100ms)
- [ ] Typing in input is responsive (no lag)
- [ ] Filtering suggestions is fast
- [ ] No memory leaks after multiple selections
- [ ] Large recent themes list (10 items) performs well
