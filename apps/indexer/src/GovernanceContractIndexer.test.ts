import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GovernanceContractIndexer } from './GovernanceContractIndexer';

// The backfill must only fetch applied transactions, or failed ones get saved as real proposals/votes.
test('backfill only fetches applied transactions', async () => {
  const indexer: any = new GovernanceContractIndexer();
  indexer.database = { getLastProcessedPeriod: async () => null };
  let txParams: Record<string, string> | undefined;
  indexer.fetchJson = async (url: string, params: Record<string, string>) => {
    if (url.endsWith('/storage/history')) return [{ level: 1, value: { config: { started_at_level: '1', period_length: '10' } } }];
    if (url.endsWith('/operations/transactions')) { txParams = params; throw new Error('stop'); }
  };

  await assert.rejects(indexer.indexContract({ type: 'fast', address: 'KT1Gov', active: true }), /stop/);

  assert.equal(txParams?.status, 'applied');
});
