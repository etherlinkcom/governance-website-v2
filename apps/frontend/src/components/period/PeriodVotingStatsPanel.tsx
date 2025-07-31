import { Box } from '@mui/material';
import { PromotionVotingStats, ProposalVotingStats } from '../shared/VotingStats';
import { ComponentLoading } from '@/components/shared/ComponentLoading';
import { ContractAndConfig, Period, Promotion, Proposal } from '@trilitech/types';

interface PeriodVotingStatsPanelProps {
    hasPromotion?: string;
    hasProposals?: boolean;
    promotions?: Promotion[];
    proposals?: Proposal[];
    contractAndConfig?: ContractAndConfig;
    isLoading: boolean;
    period?: Period;
}

export const PeriodVotingStatsPanel = ({
  hasPromotion,
  hasProposals,
  promotions,
  proposals,
  contractAndConfig,
  isLoading,
  period,
}: PeriodVotingStatsPanelProps) => {
  if (hasPromotion) {
    return (
      <Box
        sx={{
            position: 'absolute',
            right: 24,
            display: { xs: 'none', md: 'block' },
        }}
      >
        {isLoading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <ComponentLoading width='240px' borderRadius={2} sx={{mt:1}} />
                <ComponentLoading width='240px' borderRadius={2} />
            </Box>
        ) : promotions && promotions[0] ? (
          <PromotionVotingStats
            yeaVotingPower={promotions[0].yea_voting_power || 0}
            nayVotingPower={promotions[0].nay_voting_power || 0}
            passVotingPower={promotions[0].pass_voting_power || 0}
            totalVotingPower={promotions[0].total_voting_power || 0}
            contractQuorum={contractAndConfig?.promotion_quorum || 0}
            contractSupermajority={contractAndConfig?.promotion_supermajority || 0}
          />
        ) : null}
      </Box>
    );
  }

  if (hasProposals) {
    return (
    <Box
        sx={{
            position: 'absolute',
            right: 24,
            display: { xs: 'none', md: 'block' },
            width: '240px'
        }}
        >
        {isLoading ? (
            <ComponentLoading width='240px' sx={{mt:2}}/>
        ) : proposals && period && proposals[0] ? (
            <ProposalVotingStats
            proposals={proposals}
            totalVotingPower={period.total_voting_power}
            contractQuorum={contractAndConfig?.proposal_quorum || 0}
            />
        ) : null}
        </Box>
    )}

  return null;
};