import { Proposal, Upvote, Promotion, Vote } from "@trilitech/types";

export interface PeriodDetailsResponse {
  proposals?: Proposal[];
  upvotes?: Upvote[];
  promotions?: Promotion[];
  votes?: Vote[];
  periodInfo: {
    contractAddress: string;
    contractVotingIndex: number;
    hasProposals: boolean;
    hasPromotions: boolean;
  };
}