# Etherlink Governance Backend

This package contains:

- **Database migrations** for BigQuery (in `/migrations`)
- **Cron/ETL scripts** for syncing governance data (in `/src/cron`)
- **Shared types** imported from `@trilitech/types`

## Setup

1. **Install dependencies (from the repo root):**
   ```sh
   npm install
   ```

2. **Configure BigQuery:**
   - Set your project and dataset in `/src/config.ts` or via environment variables.

## Migrations

- Migration SQL files are in `/migrations`.
- To run all pending migrations:
  ```sh
  npm run migrate
  ```

## Cronjobs

- Cronjob scripts are in `/src/cron`.
- To run the governance periods sync job:
  ```sh
  npm run cron:getGovernancePeriods
  ```
- Schedule these scripts using GCP Cloud Scheduler, cron, or similar.

## Adding a New Migration

1. Add a new `.sql` file in `/migrations` with the next sequential number (e.g., `006_add_new_table.sql`).
2. Run `npm run migrate` to apply it.

## Adding a New Cronjob

1. Add a new script in `/src/cron/` (e.g., `syncProposals.ts`).
2. Add a script entry to `package.json`:
   ```json
   "scripts": {
     "syncProposals": "ts-node src/cron/syncProposals.ts"
   }
   ```