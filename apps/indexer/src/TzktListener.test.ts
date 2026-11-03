import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TzktListener } from './TzktListener';

// Failed transactions used to be saved, which put fake proposals/upvotes on the site.
test('listener only handles applied governance transactions', () => {
  const listener: any = new TzktListener([{ type: 'fast', address: 'KT1Gov', active: true }]);
  const handled: string[] = [];
  listener.handleContractFunction = (event: any) => handled.push(event.hash);

  const event = (hash: string, status: string) => ({
    hash, status, type: 'transaction', id: 1,
    target: { address: 'KT1Gov' },
    parameter: { entrypoint: 'new_proposal' },
  });
  listener.processOperation(event('ooApplied', 'applied'));
  listener.processOperation(event('ooFailed', 'failed'));
  listener.processOperation(event('ooBacktracked', 'backtracked'));

  assert.deepEqual(handled, ['ooApplied']);
});
