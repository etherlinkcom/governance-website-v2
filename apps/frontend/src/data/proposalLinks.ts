export type PayloadKey = string | SequencerKey;

export interface SequencerKey {
  poolAddress: string;
  sequencerPublicKey: string;
}

interface LinkData {
  payloadKey: PayloadKey;
  href: string;
  title: string;
}

export const allLinkData: LinkData[] = [
  {
    payloadKey: {
        poolAddress: "3b1885eec759c22c878e12c84fac33b3b9d153e4",
        sequencerPublicKey: "p2pk64mGSmsRAuodTdyNMJdSC6SmtWHF3gXH1WmmpPY8hyTqYFfd4Bg"
      },
    href: 'https://forum.tezosagora.org/t/tezos-bakers-the-second-etherlink-governance-vote-is-here-it-s-time-to-vote-for-the-sequencer-upgrade/6818',
    title: 'Tezos bakers, the second Etherlink governance vote is here — it’s time to vote for the Sequencer Upgrade',
  },
  {
    payloadKey: '0008105ea6fb0e4331d7bbc93f0e8843ae91eeb235741054cb2b345ac2d19b9ec9',
    href: 'https://medium.com/@etherlink/announcing-dionysus-the-next-etherlink-upgrade-proposal-4601c6920709',
    title: 'Announcing Dionysus: The Next Etherlink Upgrade Proposal',
  },
  {
    payloadKey: '00224058a50dbf4c0b5f6d5e4ee672cd63d0911959b335e587b4112a7eea7b2323',
    href: 'https://medium.com/@etherlink/announcing-calypso-the-next-etherlink-upgrade-proposal-dbe92c576da9',
    title: 'Announcing Calypso: The Next Etherlink Upgrade Proposal',
  },
  {
    payloadKey: '00fda6968ec17ed11dee02dc91d15606e6f02c8d7e00d8baeaee24fc0188898261',
    href: 'https://medium.com/etherlink/announcing-bifr%C3%B6st-a-2nd-upgrade-proposal-for-etherlink-mainnet-ef1a7cf9715f',
    title: 'Announcing Bifröst: a 2nd upgrade proposal for Etherlink Mainnet',
  },
  {
    payloadKey: '0001010d789e7cccc25c785cf73a658574ed0995ef36b8416a46ab0ddc6b058b39',
    href: 'https://forum.tezosagora.org/t/tezos-bakers-it-s-time-to-vote-for-etherlink-4-1-dionysus-revision-1/6810',
    title: 'Tezos bakers, it’s time to vote for Etherlink 4.1 (Dionysus Revision 1)!',
  },
  {
    payloadKey: '00fea18ffecd0563f942b8b4c67911302754d7e505b5b5672ff03cb927b79ba830',
    href: 'https://medium.com/@etherlink/announcing-ebisu-a-5th-upgrade-proposal-for-etherlink-mainnet-4dfdd1c8819e',
    title: 'Announcing Ebisu: A 5th Upgrade proposal for Etherlink Mainnet',
  },
  {
    payloadKey: '0079e0f348b608ce486c9e5e1fdf84b650019922bf3383b562522c2c8f60a098da',
    href: 'https://medium.com/@etherlink/announcing-farfadet-a-6th-upgrade-proposal-for-etherlink-mainnet-6bc59793962d',
    title: 'Announcing Farfadet: A 6th Upgrade proposal for Etherlink Mainnet',
  },
  {
    payloadKey: '0056aea7f98b2bc4d18edb450b2f098f6e95e5356f30a1fac2b50080f3e482bad1',
    href: 'https://medium.com/@etherlink/announcing-etherlink-6-1-a-bugfix-proposal-for-fa-token-deposits-2cc08ffd6fad',
    title: 'Announcing Etherlink 6.1: a bugfix proposal for FA token deposits',
  },
];
