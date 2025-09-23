import { Box } from '@mui/material';
import { VotingProgress } from '@/components/shared/VotingProgress';
import { calculateVotingProgress, getProposalQuorumPercent } from '@/lib/votingCalculations';
import { getPromotionQuorumPercent, getPromotionSupermajorityPercent } from '@/lib/votingCalculations';
import { FrontendProposal } from '@/types/api';

interface ProposalVotingStatsProps {
    proposals: FrontendProposal[];
    totalVotingPower: number;
    contractQuorum: number;
}

export const ProposalVotingStats = ({
    proposals,
    totalVotingPower,
    contractQuorum,
}: ProposalVotingStatsProps) => {
    const totalProposalUpvotes = proposals
      .map((proposal: FrontendProposal) => BigInt(proposal.upvotes))
      .reduce((a: bigint, b: bigint) => a + b, BigInt(0));
    const quorumPercent = Number(getProposalQuorumPercent(totalProposalUpvotes, totalVotingPower)) || 0;

    const progress = contractQuorum > 0 ? Math.min((quorumPercent / contractQuorum) * 100, 100) : 0;


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
  const quorumPercent = Number(getPromotionQuorumPercent(
    yeaVotingPower,
    nayVotingPower,
    passVotingPower,
    totalVotingPower
  ).toNumber()) || 0;

  const supermajorityPercent = Number(getPromotionSupermajorityPercent(
    yeaVotingPower,
    nayVotingPower
  ).toNumber()) || 0;



  const quorumProgress = calculateVotingProgress(quorumPercent, contractQuorum);
  const supermajorityProgress = calculateVotingProgress(supermajorityPercent, contractSupermajority);

  // if (quorumPercent == "Infinity") {
  //   console.log({ yeaVotingPower, nayVotingPower, passVotingPower, totalVotingPower, contractQuorum, contractSupermajority, quorumPercent, supermajorityPercent });
  // }

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