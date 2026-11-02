import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GovernanceContractIndexer } from '../GovernanceContractIndexer';
import { TzktListener } from '../TzktListener';
import { sharedDatabase } from './Database';

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
