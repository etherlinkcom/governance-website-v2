import { contractStore } from '@/stores/ContractStore';
import { Upvote, Proposal, Vote, Promotion, Period, ContractAndConfig } from '@trilitech/types';

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
  proposalsPeriodData: Period | null;
  promotionsPeriodData: Period | null;
  contractAndConfig: ContractAndConfig | undefined;
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
      promotionsPeriod: 0,
      proposalsPeriodData: null,
      promotionsPeriodData: null,
      contractAndConfig: undefined
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

  // TODO this is being called in many components
  // What are the downsides to calling it so many times in one display on multiple components?
  const contractAndConfig = contractStore.contracts.find(c => c.contract_address === contractAddress);
  const allPeriods = contractStore.getPeriodsForContract(contractAddress);
  const proposalsPeriodData = allPeriods.find(p => p.contract_voting_index === proposalsPeriod) || null;
  const promotionsPeriodData = allPeriods.find(p => p.contract_voting_index === promotionsPeriod) || null;

  const proposals = contractStore.getProposalsForPeriod(contractAddress, proposalsPeriod);
  const promotions = contractStore.getPromotionsForPeriod(contractAddress, promotionsPeriod);
  const upvoters = contractStore.getUpvotesForPeriod(contractAddress, proposalsPeriod);
  const votes = contractStore.getVotesForPeriod(contractAddress, promotionsPeriod);

  const isLoading = contractStore.isPeriodDetailsLoading(contractAddress, proposalsPeriod) ||
                   contractStore.isPeriodDetailsLoading(contractAddress, promotionsPeriod) ||
                   contractStore.isLoadingPeriods(contractAddress);

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
    promotionsPeriod,
    proposalsPeriodData,
    promotionsPeriodData,
    contractAndConfig
  };
};