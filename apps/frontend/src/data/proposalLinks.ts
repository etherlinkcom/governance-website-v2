import { SequencerKey } from "@/components/shared/HashDisplay";

interface LinkData {
  [proposalHash: string]: {
    href: string;
    title: string;
  };
}

export const allLinkData: LinkData = {
  '0008105ea6fb0e4331d7bbc93f0e8843ae91eeb235741054cb2b345ac2d19b9ec9': {
    href: 'https://medium.com/@etherlink/announcing-dionysus-the-next-etherlink-upgrade-proposal-4601c6920709',
    title: 'Announcing Dionysus: The Next Etherlink Upgrade Proposal',
  },
  '00224058a50dbf4c0b5f6d5e4ee672cd63d0911959b335e587b4112a7eea7b2323': {
    href: 'https://medium.com/@etherlink/announcing-calypso-the-next-etherlink-upgrade-proposal-dbe92c576da9',
    title: 'Announcing Calypso: The Next Etherlink Upgrade Proposal',
  },
  '00fda6968ec17ed11dee02dc91d15606e6f02c8d7e00d8baeaee24fc0188898261': {
    href: 'https://medium.com/etherlink/announcing-bifr%C3%B6st-a-2nd-upgrade-proposal-for-etherlink-mainnet-ef1a7cf9715f',
    title: 'Announcing Bifröst: a 2nd upgrade proposal for Etherlink Mainnet',
  },
  '0001010d789e7cccc25c785cf73a658574ed0995ef36b8416a46ab0ddc6b058b39': {
    href: 'https://forum.tezosagora.org/t/tezos-bakers-it-s-time-to-vote-for-etherlink-4-1-dionysus-revision-1/6810',
    title: 'Tezos bakers, it’s time to vote for Etherlink 4.1 (Dionysus Revision 1)!',
  },
};