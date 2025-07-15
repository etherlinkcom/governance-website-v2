# Etherlink Governance Backend

This package contains:

- **Database migrations** for BigQuery (in `/migrations`)

## Setup

1. **Install dependencies (from the repo root):**
   ```sh
   npm install
   ```

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


## TODO
populate db
connect front end to db