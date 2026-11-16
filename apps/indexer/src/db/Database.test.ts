import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GovernanceContractIndexer } from '../GovernanceContractIndexer';
import { TzktListener } from '../TzktListener';
import { Database, sharedDatabase } from './Database';

// Regression for the connection leak: each /index-active call used to create its own pool.
test('every indexer and the listener share one database pool', () => {
  const a = new GovernanceContractIndexer();
  const b = new GovernanceContractIndexer();
  const listener: any = new TzktListener([]);
  assert.equal(a.database, sharedDatabase);
  assert.equal(b.database, sharedDatabase);
  assert.equal(listener.database, sharedDatabase);
  assert.equal(listener.governance_contract_indexer.database, sharedDatabase);
});

test('idle connections can be released', () => {
  const config = (sharedDatabase as any).poolConfig;
  assert.ok(config.maxIdle < config.connectionLimit, 'maxIdle must be below connectionLimit or idle connections never close');
});

// Old contracts stayed active = 1 in the DB forever, because only indexed contracts get their flag written.
test('deactivateContractsExcept switches off every contract not in the active list', async () => {
  const db: any = new Database();
  const calls: { sql: string; params: string[] }[] = [];
  db.getPool = async () => ({
    execute: async (sql: string, params: string[]) => { calls.push({ sql, params }); return [{ affectedRows: 4 }]; },
  });

  assert.equal(await db.deactivateContractsExcept(['KT1A', 'KT1B']), 4);
  assert.match(calls[0].sql, /SET active = 0 .* NOT IN \(\?, \?\)/);
  assert.deepEqual(calls[0].params, ['KT1A', 'KT1B']);

  // An empty list must not switch everything off.
  assert.equal(await db.deactivateContractsExcept([]), 0);
  assert.equal(calls.length, 1);
});
