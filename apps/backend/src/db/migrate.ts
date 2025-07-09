import { BigQuery } from '@google-cloud/bigquery';
import fs from 'fs';
import path from 'path';

// TODO sql not bigquer
const projectId = ''
const dataset = ''
const migrationsDir = path.join(__dirname, '../migrations');

const bq = new BigQuery({ projectId });

async function ensureMigrationsTable() {
  console.log('[migrate] ensureMigrationsTable: Ensuring migrations table exists...');
  const sql = `
    CREATE TABLE IF NOT EXISTS \`${projectId}.${dataset}.migrations\` (
      id INT64 NOT NULL,
      name STRING NOT NULL,
      applied_at TIMESTAMP NOT NULL
    );
  `;
  await bq.query({ query: sql });
}

async function getAppliedMigrations(): Promise<Set<string>> {
  console.log('[migrate] getAppliedMigrations: Fetching applied migrations...');
  const [rows] = await bq.query({
    query: `SELECT name FROM \`${projectId}.${dataset}.migrations\` ORDER BY id`
  });
  return new Set(rows.map((row: any) => row.name));
}

async function applyMigration(id: number, name: string, sql: string) {
  console.log(`[migrate] applyMigration: Applying migration ${name} (id: ${id})...`);
  await bq.query({ query: sql });
  await bq.query({
    query: `
      INSERT INTO \`${projectId}.${dataset}.migrations\` (id, name, applied_at)
      VALUES (@id, @name, CURRENT_TIMESTAMP())
    `,
    params: { id, name }
  });
}

async function main() {
  console.log('[migrate] main: Starting migration process...');
  await ensureMigrationsTable();
  const applied = await getAppliedMigrations();

  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    if (applied.has(file)) {
      console.log(`[migrate] main: Already applied: ${file}`);
      continue;
    }
    const id = parseInt(file.split('_')[0], 10);
    const sqlRaw = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    const sql = sqlRaw
      .replace(/\$\{projectId\}/g, projectId)
      .replace(/\$\{dataset\}/g, dataset);

    await applyMigration(id, file, sql);
  }
  console.log('[migrate] main: All migrations applied.');
}

main().catch(err => {
  console.error('[migrate] main: Migration failed:', err);
  process.exit(1);
});