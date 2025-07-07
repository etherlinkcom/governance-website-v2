

const contracts = [
    {
        type: 'fast',
        address: 'KT1FPG4NApqTJjwvmhWvqA14m5PJxu9qgpBK',
    },
    {
        type: 'slow',
        address: 'KT1FPG4NApqTJjwvmhWvqA14m5PJxu9qgpBK',
    },
]


function checkPromotion() {
    const winning_candidate = ''; // SH.value.voting_context.period.proposal.winning_candidate
    const max_upvotes_voting_power = 0; // SH.value.voting_context.period.proposal.max_upvotes_voting_power
    // check if period has ended
    // check if (max_upvotes_voting_power / total_voting_power) * 100 > promotion_quorum
    // insert proposal into promotions table

}

async function fetchAndLogStorageHistory(): Promise<void> {
    try {
      const url = `https://api.tzkt.io/v1/contracts/KT1FPG4NApqTJjwvmhWvqA14m5PJxu9qgpBK/storage/history?limit=1000`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      console.log(res);
      if (!res.ok) throw new Error(`Unexpected status ${res.status}`);
      const data: any[] = await res.json();

      // helpers to extract
      const isEntrypoint = (e: any, name: string) =>
        e.operation?.parameter?.entrypoint === name;

      // 1) Proposals
      const proposals = data
        .filter(e => isEntrypoint(e, 'new_proposal'))
        .map(e => ({
          proposal: e.operation.parameter.value,
          txHash: e.operation.hash,
        }));

      // 2) Upvoters
      const upvoters = data
        .filter(e => isEntrypoint(e, 'upvote_proposal'))
        .map(e => ({
          proposal: e.operation.parameter.value,
          txHash: e.operation.hash,
        }));

      // 3) Voters
      const voters = data
        .filter(e => isEntrypoint(e, 'vote'))
        .map(e => ({
          vote: e.operation.parameter.value, // "yea"|"nay"|"pass"
          txHash: e.operation.hash,
        }));

      // 4) Promotions (kernel upgrade triggers) //NOT NEEDED
      const promotions = data
        .filter(e => isEntrypoint(e, 'trigger_kernel_upgrade'))
        .map(e => ({
          proposal: e.operation.parameter.value,
          txHash: e.operation.hash,
        }));

      // now log
      console.group('🗃️ Storage History');
      console.group('Proposals');
      proposals.forEach(p =>
        console.log(`• proposal ${p.proposal} — tx ${p.txHash}`)
      );
      console.groupEnd();

      console.group('Upvoters');
      upvoters.forEach(u =>
        console.log(`• upvoted ${u.proposal} — tx ${u.txHash}`)
      );
      console.groupEnd();

      console.group('Voters');
      voters.forEach(v =>
        console.log(`• vote ${v.vote} — tx ${v.txHash}`)
      );
      console.groupEnd();

      console.group('Promotions');
      promotions.forEach(p =>
        console.log(`• promote ${p.proposal} — tx ${p.txHash}`)
      );
      console.groupEnd();

      console.groupEnd();
    } catch (err) {
      console.error('Failed to load storage history', err);
    }
  }