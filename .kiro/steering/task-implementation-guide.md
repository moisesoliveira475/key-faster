---
inclusion: manual
contextKey: task-implementation
---

# Task Implementation Guide

## Task Execution Rules
1. **One task at a time** - Never implement multiple tasks simultaneously
2. **Sub-tasks first** - Always complete sub-tasks before marking parent task complete
3. **Requirements verification** - Check implementation against specified requirements
4. **Status updates** - Update task status to in_progress → completed

## Implementation Approach
- Read requirements.md, design.md, and tasks.md before starting
- Focus only on the current task scope
- Use minimal viable implementations
- Follow the technology stack specified in design.md
- Test implementations before marking complete

## Optional Tasks (marked with *)
- Optional tasks are marked with `*` suffix (e.g., `- [ ]* 2.3 Write unit tests`)
- These can be skipped if not explicitly requested
- Focus on core functionality first

## File Organization
```
frontend/
├── src/
│   ├── components/     # React components
│   ├── stores/         # Zustand stores
│   ├── types/          # TypeScript interfaces
│   ├── utils/          # Utility functions
│   └── styles/         # CSS/Tailwind styles

backend/
├── src/
│   ├── routes/         # Express routes
│   ├── services/       # Business logic
│   ├── types/          # TypeScript interfaces
│   └── utils/          # Utility functions
```

## Quality Checklist
- [ ] TypeScript compilation passes
- [ ] No console errors
- [ ] Responsive design implemented
- [ ] Error handling included
- [ ] Loading states added
- [ ] Requirements satisfied