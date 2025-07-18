import { contractStore } from '@/stores/ContractStore';
import { Upvote, Proposal, Vote, Promotion } from '@trilitech/types';

interface PeriodData {
  proposals: Proposal[];
  promotions: Promotion[];
  upvoters: Upvote[];
  votes: Vote[];
  isLoading: boolean;
  error: string | null;
  hasValidParams: boolean;
  proposalsPeriod: number;
  promotionsPeriod: number;
}

export const usePeriodData = (
  contractAddress?: string,
  contractVotingIndex?: number,
  hasProposals?: boolean,
  hasPromotions?: boolean
): PeriodData => {
  const hasValidParams = !!(contractAddress && contractVotingIndex);

  if (!hasValidParams) {
    return {
      proposals: [],
      promotions: [],
      upvoters: [],
      votes: [],
      isLoading: false,
      error: null,
      hasValidParams: false,
      proposalsPeriod: 0,
      promotionsPeriod: 0
    };
  }

  let proposalsPeriod: number;
  let promotionsPeriod: number;

  if (hasProposals) {
    proposalsPeriod = contractVotingIndex;
    promotionsPeriod = contractVotingIndex + 1;
  } else if (hasPromotions) {
    proposalsPeriod = contractVotingIndex - 1;
    promotionsPeriod = contractVotingIndex;
  } else {
    proposalsPeriod = contractVotingIndex;
    promotionsPeriod = contractVotingIndex;
  }

  const proposals = contractStore.getProposalsForPeriod(contractAddress, proposalsPeriod);
  const promotions = contractStore.getPromotionsForPeriod(contractAddress, promotionsPeriod);
  const upvoters = contractStore.getUpvotesForPeriod(contractAddress, proposalsPeriod);
  const votes = contractStore.getVotesForPeriod(contractAddress, promotionsPeriod);

  const isLoading = contractStore.isPeriodDetailsLoading(contractAddress, proposalsPeriod) ||
                   contractStore.isPeriodDetailsLoading(contractAddress, promotionsPeriod);

  const error = contractStore.getPeriodDetailsError(contractAddress, proposalsPeriod) ||
               contractStore.getPeriodDetailsError(contractAddress, promotionsPeriod);

  return {
    proposals,
    promotions,
    upvoters,
    votes,
    isLoading,
    error,
    hasValidParams,
    proposalsPeriod,
    promotionsPeriod
  };
};