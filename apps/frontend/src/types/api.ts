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

export interface FrontendProposal extends Proposal {
  upvotes: string;
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
    proposals?: FrontendProposal[];
    promotion?: Promotion;
}

export interface FuturePeriod {
    startDateTime: Date;
    endDateTime: Date;
    startLevel: number;
    endLevel: number
}

export interface TransactionOperationConfirmation {
    block: BlockResponse;
    expectedConfirmation: number;
    currentConfirmation: number;
    completed: boolean;
    isInCurrentBranch: () => Promise<boolean>;
}