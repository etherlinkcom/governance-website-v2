import { Proposal, Upvote, Promotion, Vote, Period, ContractAndConfig } from "@trilitech/types";
import { BlockResponse } from '@taquito/rpc';

export interface PeriodDetailsResponse {
  proposals?: FrontendProposal[];
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

export interface PeriodData {
  proposals: FrontendProposal[];
  promotions: Promotion[];
  upvoters: Upvote[];
  votes: Vote[];
  isLoading: boolean;
  error: string | null;
  hasValidParams: boolean;
  proposalsPeriod: number;
  promotionsPeriod: number;
  proposalsPeriodData: Period | null;
  promotionsPeriodData: Period | null;
  contractAndConfig: ContractAndConfig | undefined;
}

export interface PeriodFrontend {
    startDateTime: Date;
    endDateTime: Date;
    contract: string;
    governance: string;
    proposals?: Proposal[];
    promotion?: Promotion;
}

// TODO calculated in contractstore
export interface FuturePeriod {
    startDateTime: Date;
    endDateTime: Date;
}