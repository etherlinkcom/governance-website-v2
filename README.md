# Etherlink Governance Website Monorepo

This monorepo contains:

- **Frontend**: A Next.js app for the Etherlink governance website (`/apps/frontend`)
- **Backend**: Scripts for migrations and governance data ETL/cronjobs (`/apps/backend`)
- **Types**: Shared TypeScript types for both frontend and backend (`/packages/types`)

## Structure

```
/apps
  /frontend      # Next.js frontend
  /backend       # Migrations and backend/cron scripts
/packages
  /types         # Shared TypeScript types
```

## Getting Started

1. **Install dependencies (from the repo root):**
   ```sh
   npm install
   ```

2. **Run the frontend:**
   ```sh
   cd apps/frontend
   npm run dev
   ```

3. **Run backend scripts:**
   ```sh
   cd apps/backend
   npm run migrate
   npm run getGovernancePeriods
   ```

## Development

- Shared types are imported from `@trilitech/types`.
- Use npm workspaces for dependency management.
- See individual app/package READMEs for more details.