const STALE_MS = 10 * 60 * 1000;  // blocks come every few seconds; 10 min of silence means the listener is dead

type ListenerStatus = { isConnected(): boolean; lastHeadAt: Date | null } | null;

// Liveness only. Checking the saved data against the chain is done by InfraMonitor (BIN-1356).
export function listenerProblems(listener: ListenerStatus, now: number = Date.now()): string[] {
  if (!listener || !listener.isConnected()) return ['listener not connected'];
  const last = listener.lastHeadAt;
  if (!last || now - last.getTime() > STALE_MS) return [`no block received for over 10 min (last: ${last?.toISOString() ?? 'never'})`];
  return [];
}
