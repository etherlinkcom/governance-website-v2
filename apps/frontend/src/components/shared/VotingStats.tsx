import { Box } from '@mui/material';
import { VotingProgress } from '@/components/shared/VotingProgress';
import { getProposalQuorumPercent } from '@/lib/votingCalculations';
import { getPromotionQuorumPercent, getPromotionSupermajorityPercent } from '@/lib/votingCalculations';
import { Proposal } from '@trilitech/types';

interface ProposalVotingStatsProps {
    proposals: Proposal[];
    totalVotingPower: number;
    contractQuorum: number;
}

export const ProposalVotingStats = ({
    proposals,
    totalVotingPower,
    contractQuorum,
}: ProposalVotingStatsProps) => {
    const totalProposalUpvotes = proposals.map((proposal: Proposal) => proposal.upvotes).reduce((a: number, b: number) => a + b, 0);
    const quorumPercent = Number(getProposalQuorumPercent(totalProposalUpvotes, totalVotingPower));

    const progress = Math.min((quorumPercent / contractQuorum) * 100, 100);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <VotingProgress
            label="Quorum"
            value={quorumPercent.toFixed(2)}
            required={contractQuorum}
            progress={progress}
        />
        </Box>
    );
};


interface PromotionVotingStatsProps {
  yeaVotingPower: number;
  nayVotingPower: number;
  passVotingPower: number;
  totalVotingPower: number;
  contractQuorum: number;
  contractSupermajority: number;
}

export const PromotionVotingStats = ({
  yeaVotingPower,
  nayVotingPower,
  passVotingPower,
  totalVotingPower,
  contractQuorum,
  contractSupermajority,
}: PromotionVotingStatsProps) => {
  const quorumPercent = getPromotionQuorumPercent(
    yeaVotingPower,
    nayVotingPower,
    passVotingPower,
    totalVotingPower
  ).toNumber();

  const supermajorityPercent = getPromotionSupermajorityPercent(
    yeaVotingPower,
    nayVotingPower
  ).toNumber();

  const quorumProgress = Math.min((quorumPercent / contractQuorum) * 100, 100);
  const supermajorityProgress = Math.min((supermajorityPercent / contractSupermajority) * 100, 100);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column'}}>
      <VotingProgress
        label="Quorum"
        value={quorumPercent.toFixed(2)}
        required={contractQuorum}
        progress={quorumProgress}
      />
      <VotingProgress
        label="Supermajority"
        value={supermajorityPercent.toFixed(2)}
        required={contractSupermajority}
        progress={supermajorityProgress}
      />
    </Box>
  );
};