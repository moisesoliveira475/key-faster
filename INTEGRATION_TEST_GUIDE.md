# Integration Test Guide - Task 9

## Prerequisites

1. **Backend Setup:**
   ```bash
   cd backend
   # Ensure .env file exists with API keys
   pnpm install
   pnpm run dev
   ```
   Backend should be running on `http://localhost:3001`

2. **Frontend Setup:**
   ```bash
   cd frontend
   # Ensure .env file exists with VITE_API_URL
   pnpm install
   pnpm run dev
   ```
   Frontend should be running on `http://localhost:5173`

## Test Scenarios

### 1. Basic Content Generation (Happy Path)

**Steps:**
1. Open browser to `http://localhost:5173`
2. Enter a theme in the ThemeSelector (e.g., "JavaScript")
3. Click "Select" or press Enter
4. Observe ContentLoader component appears
5. Wait for content to load

**Expected Results:**
- ✅ Loading spinner displays with message
- ✅ Content appears within 3-5 seconds
- ✅ ContentDisplay shows:
  - Theme title
  - Word count (~300 words)
  - Estimated time (~7-8 minutes)
  - Source indicator (combined/ai/wikipedia)
  - Difficulty badge (Easy/Medium/Hard)
  - Formatted text content
  - Metadata badges (AI model, Wikipedia article if applicable)
  - "Start Typing" button
  - "Refresh Content" button

### 2. Content Caching

**Steps:**
1. Generate content for theme "Python"
2. Note the content text
3. Select a different theme (e.g., "React")
4. Wait for new content to load
5. Select "Python" again

**Expected Results:**
- ✅ First "Python" request takes 3-5 seconds
- ✅ Second "Python" request is instant (cached)
- ✅ Same content appears (from cache)
- ✅ Console shows "Using cached content for: Python"

### 3. Content Refresh

**Steps:**
1. Generate content for any theme
2. Click "Refresh Content" button
3. Observe loading state
4. Wait for new content

**Expected Results:**
- ✅ Loading spinner appears
- ✅ New content is generated (different from previous)
- ✅ Cache is updated with new content
- ✅ All metadata updates correctly

### 4. Error Handling - Backend Down

**Steps:**
1. Stop the backend server (Ctrl+C in backend terminal)
2. Select a new theme in frontend
3. Wait for request to fail

**Expected Results:**
- ✅ Loading spinner appears initially
- ✅ After timeout, ContentError component displays
- ✅ Error message shows: "Failed to generate content"
- ✅ Fallback content is displayed (default typing practice text)
- ✅ Yellow warning banner shows: "Note: [error]. Using fallback content."
- ✅ "Retry" button is available
- ✅ Suggestions list appears with troubleshooting tips

### 5. Error Handling - Retry Logic

**Steps:**
1. With backend stopped, select a theme
2. Wait for error to appear
3. Start backend server
4. Click "Retry" button

**Expected Results:**
- ✅ Loading spinner appears
- ✅ Content successfully loads after retry
- ✅ Error message disappears
- ✅ Normal ContentDisplay appears

### 6. Different Content Sources

**Steps:**
1. Open browser console
2. In console, test different sources:
   ```javascript
   // Access the content store
   const store = window.__ZUSTAND_STORES__?.content;
   
   // Test AI only
   await store.fetchContent({ theme: 'TypeScript', source: 'ai', length: 200 });
   
   // Test Wikipedia only
   await store.fetchContent({ theme: 'TypeScript', source: 'wikipedia', language: 'en' });
   
   // Test combined
   await store.fetchContent({ theme: 'TypeScript', source: 'combined', length: 300 });
   ```

**Expected Results:**
- ✅ AI source: Content from OpenAI, metadata shows AI model
- ✅ Wikipedia source: Content from Wikipedia, metadata shows article name
- ✅ Combined source: Content from both, metadata shows both sources

### 7. Difficulty Calculation

**Steps:**
1. Generate content for simple themes:
   - "Colors" (should be Easy)
   - "JavaScript Programming" (should be Medium)
   - "Quantum Mechanics" (should be Hard)

**Expected Results:**
- ✅ Difficulty badge color matches level:
  - Easy: Green background
  - Medium: Yellow background
  - Hard: Red background
- ✅ Difficulty score is reasonable (check console logs)

### 8. Language Support

**Steps:**
1. Open Settings/Preferences (if available)
2. Change language to Portuguese
3. Generate content for a theme

**Expected Results:**
- ✅ Content request includes `language: 'pt'`
- ✅ Content is in Portuguese (if backend supports it)
- ✅ Metadata shows correct language

### 9. Mobile Responsiveness

**Steps:**
1. Open browser DevTools
2. Toggle device toolbar (mobile view)
3. Test on different screen sizes:
   - iPhone SE (375px)
   - iPad (768px)
   - Desktop (1920px)

**Expected Results:**
- ✅ All components are responsive
- ✅ Text is readable on small screens
- ✅ Buttons are touch-friendly
- ✅ No horizontal scrolling
- ✅ Metadata wraps properly

### 10. Start Typing Integration

**Steps:**
1. Generate content for any theme
2. Click "Start Typing" button

**Expected Results:**
- ✅ Button click is registered
- ✅ Placeholder message appears (future integration)
- ✅ Console logs "Starting typing session"
- ✅ Can return to content view

## Performance Tests

### Load Time
- Initial page load: < 2 seconds
- Content generation: 3-5 seconds
- Cached content: < 100ms

### Memory Usage
- Check browser DevTools > Memory
- Generate content for 10 different themes
- Memory should not exceed 50MB
- Cache should limit to 10 items

## API Endpoint Tests

### Using curl or Postman:

**1. Health Check:**
```bash
curl http://localhost:3001/health
```
Expected: `{"status":"OK","timestamp":"...","service":"Typing Study API"}`

**2. Generate Content:**
```bash
curl -X POST http://localhost:3001/api/content/generate \
  -H "Content-Type: application/json" \
  -d '{"theme":"JavaScript","length":300,"source":"combined","language":"en"}'
```

**3. Wikipedia Content:**
```bash
curl http://localhost:3001/api/content/wikipedia/JavaScript?language=en
```

**4. AI Content:**
```bash
curl -X POST http://localhost:3001/api/content/ai \
  -H "Content-Type: application/json" \
  -d '{"theme":"React","length":250}'
```

## Console Checks

Open browser console and verify:

1. **No errors** in console (except expected network errors during error testing)
2. **Cache logs** appear when using cached content
3. **API calls** are visible in Network tab
4. **State updates** are logged (if debug mode enabled)

## Known Issues / Limitations

1. **Fallback content** is generic - not theme-specific
2. **Cache** is in-memory only - cleared on page refresh
3. **Retry logic** has max 3 attempts - then requires manual retry
4. **Content length** may vary slightly from requested length
5. **Difficulty calculation** is heuristic-based - may not be perfect

## Success Criteria

All tests should pass with:
- ✅ No TypeScript errors
- ✅ No runtime errors (except during error testing)
- ✅ Smooth user experience
- ✅ Proper error handling
- ✅ Content caching works
- ✅ All UI components render correctly
- ✅ Responsive design works on all screen sizes

## Troubleshooting

**Problem:** Content not loading
- Check backend is running on port 3001
- Check VITE_API_URL in frontend/.env
- Check CORS settings in backend
- Check API keys in backend/.env

**Problem:** CORS errors
- Verify FRONTEND_URL in backend/.env matches frontend URL
- Check browser console for specific CORS error
- Ensure backend CORS middleware is configured

**Problem:** Slow content generation
- Check internet connection
- Check OpenAI API status
- Check Wikipedia API availability
- Consider using 'ai' source only for faster response

**Problem:** Cache not working
- Check browser console for cache logs
- Verify cache key format matches
- Check if cache size limit (10) is reached
- Try clearing browser cache and reload

## Next Steps After Testing

Once all tests pass:
1. Document any issues found
2. Create bug reports for failures
3. Proceed to next task (Task 10: Responsive UI)
4. Integrate ContentManager with TypingInterface
5. Add session management with generated content
