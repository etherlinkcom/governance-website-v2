import { PayloadKey, SequencerKey, allLinkData } from '@/data/proposalLinks';

export function parseSequencerKey(str: string): SequencerKey | null {
  try {
    const obj = JSON.parse(str);
    if (obj && typeof obj === 'object' && obj.poolAddress && obj.sequencerPublicKey) {
      return obj as SequencerKey;
    }
    if (obj && typeof obj === 'object' && obj.pool_address && obj.sequencer_pk) {
      return {
        poolAddress: obj.pool_address,
        sequencerPublicKey: obj.sequencer_pk,
      };
    }
  } catch {}
  return null;
}

export function getLinkData(hash: PayloadKey) {
  return allLinkData.find(entry => {
    if (typeof entry.payloadKey === 'string' && typeof hash === 'string') {
      return entry.payloadKey === hash;
    }
    if (typeof entry.payloadKey === 'object' && typeof hash === 'string') {
      try {
        const parsed = JSON.parse(hash);
        return (
          entry.payloadKey.poolAddress === parsed.pool_address &&
          entry.payloadKey.sequencerPublicKey === parsed.sequencer_pk
        );
      } catch {
        return false;
      }
    }
    return false;
  });
}