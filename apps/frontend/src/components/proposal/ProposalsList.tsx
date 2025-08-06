import { Box, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { ComponentLoading } from '@/components/shared/ComponentLoading';
import { ProposalCard } from '@/components/proposal/ProposalCard';
import { getProposalQuorumPercent } from '@/lib/votingCalculations';
import { Proposal } from '@trilitech/types';
import { VotingProgress } from '@/components/shared/VotingProgress';
import { contractStore } from '@/stores/ContractStore';

const ProposalsListSkeleton = () => (
  <Box>
    <Box sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center', mb: 2 }}>
      <ComponentLoading width={80} height={24} />
    </Box>
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {[...Array(3)].map((_, idx) => (
        <ComponentLoading key={idx} width="100%" height={80} borderRadius={2} />
      ))}
    </Box>
  </Box>
);

interface ProposalsListProps {
  contractVotingIndex?: number;
  contractAddress?: string;
}

export const ProposalsList = observer(({ contractVotingIndex, contractAddress }: ProposalsListProps) => {
  const { proposals, proposalsPeriodData, isLoading, error, hasValidParams, contractAndConfig } = contractStore.getPeriodData(contractAddress, contractVotingIndex);

  if (!hasValidParams) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
        No proposals found
      </Typography>
    );
  }

  if (isLoading) return <ProposalsListSkeleton />;

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ color: 'error.main', mb: 1 }}>
          Error Loading Proposals
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {error}
        </Typography>
      </Box>
    );
  }

  const totalProposalUpvotes = proposals.map((e: Proposal) => e.upvotes).reduce((a: number, b: number) => a + b, 0);
  const quorumPercent = Number(getProposalQuorumPercent(totalProposalUpvotes, proposalsPeriodData?.total_voting_power));
  const contractQuorum = contractAndConfig?.proposal_quorum || 1;
  const progress = Math.min((quorumPercent / contractQuorum) * 100, 100);

  return (
    <Box>
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'center', sm: 'flex-start' },
        justifyContent: { xs: 'center', sm: 'flex-end' },
        mb: 2,
        mx: 0.5,
        mr: { xs: 0, sm: 1 },
      }}>
        <Box
        sx={{
          width: { xs: '95%', sm: 250 }
        }}
      >
        <VotingProgress
          label="Quorum"
          value={quorumPercent.toFixed(2)}
          required={contractQuorum}
          progress={progress}
          variant='body1'
        />
      </Box>
    </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {proposals.length > 0 ? (
          proposals.map((proposal, i) => (
            <ProposalCard
              key={i}
              proposal={proposal}
            />
          ))
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            {contractVotingIndex
              ? `No proposals found for period ${contractVotingIndex}`
              : 'No proposals found'
            }
          </Typography>
        )}
      </Box>
    </Box>
  );
});