export const FAKE_GOVERNANCE_DATA = {
  slow: {
    contractInfo: {
      type: 'slow',
      address: 'KT1FPG4NApqTJjwvmhWvqA14m5PJxu9qgpBK',
      startedAtLevel: 7692289,
      periodLength: '30720 blocks',
      adoptionPeriod: '86400 seconds',
      upvotingLimit: 20,
      proposalQuorum: '1%',
      promotionQuorum: '5%',
      promotionSupermajority: '75%'
    },
    proposals: [
      {
        id: '0x0008105ea6fb0e4331d7bbc93f0e8843ae91eeb235741054cb2b345ac2d19b9ec9',
        title: 'Announcing Dionysus: The Next Etherlink Upgrade Proposal',
        description: 'Major protocol upgrade introducing new features and improvements.',
        status: 'active' as const,
        votes: { for: 8501, against: 120 },
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        author: 'tz1aJHKKUWrwfsuoftdmwNBbBctjSWchMWZY',
        upvotes: '85.01T'
      },
      {
        id: '0x009279df4982e47cf101e2525b605fa06cd3ccc0f67d1c792a6a3ea56af9606abc',
        title: 'Infrastructure Scaling Proposal',
        description: 'Proposal to scale infrastructure for better performance.',
        status: 'passed' as const,
        votes: { for: 1570, against: 50 },
        endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        author: 'tz1UxSn32MjFYzGps3F36WMp1ciZ1ZTadwho',
        upvotes: '15.7B'
      }
    ],
    upvoters: [
      { baker: 'P2P.org', votingPower: '20.28T', proposal: '0x0008105ea6fb0e4331d7bbc93f0e8843ae91eeb235741054cb2b345ac2d19b9ec9', time: '05/15/25, 06:03 PM' },
      { baker: 'TrapDesuUwU Baker', votingPower: '94.05B', proposal: '0x0008105ea6fb0e4331d7bbc93f0e8843ae91eeb235741054cb2b345ac2d19b9ec9', time: '05/14/25, 09:19 PM' },
      { baker: 'Spice', votingPower: '5.15T', proposal: '0x0008105ea6fb0e4331d7bbc93f0e8843ae91eeb235741054cb2b345ac2d19b9ec9', time: '05/14/25, 07:06 AM' },
      { baker: 'Melange', votingPower: '6.59T', proposal: '0x0008105ea6fb0e4331d7bbc93f0e8843ae91eeb235741054cb2b345ac2d19b9ec9', time: '05/14/25, 07:04 AM' },
      { baker: 'Riseup Bakery', votingPower: '762.84B', proposal: '0x0008105ea6fb0e4331d7bbc93f0e8843ae91eeb235741054cb2b345ac2d19b9ec9', time: '05/14/25, 06:09 AM' },
      { baker: 'Stake Dome', votingPower: '19.9B', proposal: '0x0008105ea6fb0e4331d7bbc93f0e8843ae91eeb235741054cb2b345ac2d19b9ec9', time: '05/14/25, 01:47 AM' },
      { baker: 'ASICBAKER', votingPower: '388.88B', proposal: '0x0008105ea6fb0e4331d7bbc93f0e8843ae91eeb235741054cb2b345ac2d19b9ec9', time: '05/14/25, 12:20 AM' }
    ],
    quorum: '1223.16%',
    promotion: {
      candidate: '0x0008105ea6fb0e4331d7bbc93f0e8843ae91eeb235741054cb2b345ac2d19b9ec9',
      title: 'Announcing Dionysus: The Next Etherlink Upgrade Proposal',
      quorum: '494.67%',
      supermajority: '133.33%',
      votes: {
        yea: { percentage: 56.12, count: 96, label: 'T' },
        nay: { percentage: 0, count: 0, label: '' },
        pass: { percentage: 43.88, count: 75.07, label: 'T' }
      },
      voters: [
        { baker: 'tz1uWAe6hYCewe1N7me6aekitsH6fFE3i4P', votingPower: '35.2B', vote: 'yea' as const, time: '05/19/25, 01:52 AM' },
        { baker: 'P2P.org', votingPower: '20.28T', vote: 'yea' as const, time: '05/18/25, 01:02 PM' },
        { baker: 'tz3RRWwMQEkC2pGW6CZUySP4P6jjEyHYd143', votingPower: '307.19B', vote: 'yea' as const, time: '05/17/25, 06:32 PM' },
        { baker: 'TrapDesuUwU Baker', votingPower: '94.05B', vote: 'yea' as const, time: '05/17/25, 04:41 PM' },
        { baker: 'BAGUETTE', votingPower: '47.99B', vote: 'yea' as const, time: '05/17/25, 12:31 PM' },
        { baker: 'Spice', votingPower: '5.15T', vote: 'yea' as const, time: '05/17/25, 02:21 AM' },
        { baker: 'Melange', votingPower: '6.59T', vote: 'yea' as const, time: '05/17/25, 02:20 AM' },
        { baker: 'Anon Bakery', votingPower: '1.06T', vote: 'yea' as const, time: '05/17/25, 12:56 AM' },
        { baker: 'Bakerman_CH', votingPower: '6.03T', vote: 'yea' as const, time: '05/16/25, 09:46 PM' }
      ]
    }
  },
  fast: {
    contractInfo: {
      type: 'fast',
      address: 'KT1FastContractAddress123456789',
      startedAtLevel: 7650000,
      periodLength: '10240 blocks',
      adoptionPeriod: '28800 seconds',
      upvotingLimit: 50,
      proposalQuorum: '2%',
      promotionQuorum: '8%',
      promotionSupermajority: '60%'
    },
    proposals: [
      {
        id: '0x1234567890abcdef1234567890abcdef12345678901234567890abcdef1234567',
        title: 'Fast Governance Test Proposal',
        description: 'A test proposal for fast governance.',
        status: 'active' as const,
        votes: { for: 450, against: 20 },
        endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        author: 'tz1FastGovernanceTestAddress12345',
        upvotes: '45.0T'
      }
    ],
    upvoters: [
      { baker: 'Fast Baker 1', votingPower: '15.5T', proposal: '0x1234567890abcdef1234567890abcdef12345678901234567890abcdef1234567', time: '05/15/25, 08:30 PM' },
      { baker: 'Fast Baker 2', votingPower: '22.3T', proposal: '0x1234567890abcdef1234567890abcdef12345678901234567890abcdef1234567', time: '05/15/25, 07:45 PM' }
    ],
    quorum: '894.32%',
    promotion: {
      candidate: 'tz1FastCandidateAddress',
      title: 'Fast Track Proposal Vote',
      quorum: '60%',
      supermajority: '50.01%',
      votes: {
        yea: { percentage: 80, count: 360, label: 'Yea' },
        nay: { percentage: 15, count: 67, label: 'Nay' },
        pass: { percentage: 5, count: 22, label: 'Pass' }
      },
      voters: [
        { baker: 'Fast Baker 1', votingPower: '15.5T', vote: 'yea' as const, time: '05/15/25, 08:30 PM' },
        { baker: 'Fast Baker 2', votingPower: '22.3T', vote: 'yea' as const, time: '05/15/25, 07:45 PM' }
      ]
    }
  },
  sequencer: {
    contractInfo: {
      type: 'sequencer',
      address: 'KT1SequencerContractAddress123456',
      startedAtLevel: 7680000,
      periodLength: '5120 blocks',
      adoptionPeriod: '14400 seconds',
      upvotingLimit: 100,
      proposalQuorum: '3%',
      promotionQuorum: '10%',
      promotionSupermajority: '67%'
    },
    proposals: [
      {
        id: '0x5678901234567890abcdef1234567890abcdef1234567890abcdef1234567890a',
        title: 'Sequencer Optimization Proposal',
        description: 'Proposal to optimize sequencer performance.',
        status: 'active' as const,
        votes: { for: 320, against: 15 },
        endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        author: 'tz1SequencerGovernanceAddress123',
        upvotes: '32.0T'
      }
    ],
    upvoters: [
      { baker: 'Sequencer Baker 1', votingPower: '18.7T', proposal: '0x5678901234567890abcdef1234567890abcdef1234567890abcdef1234567890a', time: '05/15/25, 09:15 PM' },
      { baker: 'Sequencer Baker 2', votingPower: '13.3T', proposal: '0x5678901234567890abcdef1234567890abcdef1234567890abcdef1234567890a', time: '05/15/25, 08:45 PM' }
    ],
    quorum: '567.89%',
    promotion: {
      candidate: 'tz1SequencerCandidateAddress',
      title: 'Sequencer Performance Vote',
      quorum: '70%',
      supermajority: '60%',
      votes: {
        yea: { percentage: 75, count: 240, label: 'Yea' },
        nay: { percentage: 20, count: 64, label: 'Nay' },
        pass: { percentage: 5, count: 16, label: 'Pass' }
      },
      voters: [
        { baker: 'Sequencer Baker 1', votingPower: '18.7T', vote: 'yea' as const, time: '05/15/25, 09:15 PM' },
        { baker: 'Sequencer Baker 2', votingPower: '13.3T', vote: 'nay' as const, time: '05/15/25, 08:45 PM' }
      ]
    }
  }
};