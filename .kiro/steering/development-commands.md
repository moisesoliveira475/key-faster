---
inclusion: always
---

# Development Commands Reference

## Package Management (Always use pnpm)
```bash
# Install dependencies
pnpm install

# Add dependencies
pnpm add <package>
pnpm add -D <package>  # dev dependency

# Run scripts
pnpm run dev
pnpm run build
pnpm run test
```

## Project Setup Commands
```bash
# Create React TypeScript project with Vite
pnpm create vite@latest frontend --template react-ts

# Install backend dependencies
cd backend && pnpm install

# Install frontend dependencies  
cd frontend && pnpm install

# Add Tailwind CSS to frontend
cd frontend && pnpm add -D tailwindcss postcss autoprefixer
cd frontend && pnpm dlx tailwindcss init -p
```

## Development Servers
```bash
# Start backend (from backend directory)
pnpm run dev

# Start frontend (from frontend directory)  
pnpm run dev

# Build for production
pnpm run build
```

## Testing Commands
```bash
# Run tests (use --run flag to avoid watch mode)
pnpm run test --run

# Run tests with coverage
pnpm run test:coverage --run
```

## Important Notes
- Never use `npm` or `yarn` commands
- Always use `pnpm` for consistency
- Use `--run` flag with test commands to avoid blocking watch modes
- Check package.json scripts before running commands