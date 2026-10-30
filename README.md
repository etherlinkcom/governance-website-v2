# Etherlink Governance Website Monorepo

This monorepo contains:

- **Frontend**: Next.js app for the Etherlink governance website (`/apps/frontend`)
- **Indexer**: Express service that indexes Tezos governance data into MySQL (`/apps/indexer`)
- **Types**: Shared TypeScript types for both apps (`/packages/types`)

## Structure

```
/apps
  /frontend      # Next.js frontend (reads governance data from MySQL)
  /indexer       # Express service that fills MySQL from TzKT / RPC
/packages
  /types         # Shared TypeScript types (@trilitech/types)
```

## Getting Started

1. **Install dependencies (from the repo root):**
   ```sh
   npm install
   ```

2. **Set up env files** (both apps need the same MySQL database):
   ```sh
   cp apps/indexer/.env.sample apps/indexer/.env
   cp apps/frontend/.env.sample apps/frontend/.env
   ```

3. **Run the indexer:**
   ```sh
   cd apps/indexer
   npm run dev
   ```

4. **Run the frontend:**
   ```sh
   cd apps/frontend
   npm run dev
   ```

## Development

- Shared types are imported from `@trilitech/types`.
- Dependencies are managed with npm workspaces.
- The root `Dockerfile` builds the indexer only.
- See each app's README for details.
