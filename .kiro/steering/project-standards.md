---
inclusion: always
---

# Typing Study App - Project Standards

## Package Manager
- **Always use pnpm** instead of npm or yarn for all package management operations
- Use `pnpm install` instead of `npm install`
- Use `pnpm add` instead of `npm install <package>`
- Use `pnpm run` instead of `npm run`

## Project Structure
```
typing-study-app/
├── frontend/          # React TypeScript with Vite
├── backend/           # Node.js Express with TypeScript
├── .kiro/
│   ├── specs/
│   └── steering/
└── README.md
```

## Development Workflow
1. Use pnpm workspaces for monorepo management
2. Frontend runs on port 5173 (Vite default)
3. Backend runs on port 3001
4. Use TypeScript for all new code
5. Follow the task-by-task implementation approach from the spec

## Code Standards
- Use TypeScript strict mode
- Follow React functional components with hooks
- Use Zustand for state management
- Use Tailwind CSS for styling
- Implement proper error boundaries
- Add loading states for all async operations

## Environment Configuration
- Use `.env` files for environment variables
- Never commit actual API keys
- Provide `.env.example` templates
- Use different ports for frontend/backend to avoid conflicts