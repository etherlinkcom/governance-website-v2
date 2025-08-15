import { Proposal, Upvote, Promotion, Vote, Period, ContractAndConfig } from "@trilitech/types";

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

export interface PeriodData {
  proposals: Proposal[];
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

export interface FrontendPeriod {
    startDateTime: Date;
    endDateTime: Date;
    startLevel: number;
    endLevel: number;
    contract: string;
    governance: string;
    contract_voting_index: number;
    totalVotingPower: number;
    proposals?: Proposal[];
    promotion?: Promotion;
}

export interface FuturePeriod {
    startDateTime: Date;
    endDateTime: Date;
    startLevel: number;
    endLevel: number
}