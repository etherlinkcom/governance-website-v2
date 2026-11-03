import { test } from 'node:test';
import assert from 'node:assert/strict';
import { listenerProblems } from './health';

const now = Date.parse('2026-11-03T12:00:00Z');
const listener = (connected: boolean, lastHeadAt: Date | null) => ({ isConnected: () => connected, lastHeadAt });

test('listener: healthy when connected and a block arrived recently', () => {
  assert.deepEqual(listenerProblems(listener(true, new Date(now - 60_000)), now), []);
});

test('listener: unhealthy when missing, disconnected, or silent for over 10 min', () => {
  assert.equal(listenerProblems(null, now).length, 1);
  assert.equal(listenerProblems(listener(false, new Date(now)), now).length, 1);
  assert.equal(listenerProblems(listener(true, null), now).length, 1);
  assert.equal(listenerProblems(listener(true, new Date(now - 11 * 60_000)), now).length, 1);
});
