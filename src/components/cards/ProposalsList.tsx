import { Box, Typography } from '@mui/material';
import ProposalCard from './ProposalCard';
import { observer } from 'mobx-react-lite';
import { contractStore } from '@/stores/ContractStore';
import ComponentLoading from '@/components/shared/ComponentLoading';

const ProposalsListSkeleton = () => (
  <Box>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
      <ComponentLoading width={120} height={32} />
      <ComponentLoading width={80} height={24} />
    </Box>
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {[...Array(3)].map((_, idx) => (
        <ComponentLoading key={idx} width="100%" height={80} borderRadius={2} />
      ))}
    </Box>
  </Box>
);

const ProposalsList = observer(() => {
  const { proposals, quorum, isLoading } = contractStore;

  if (isLoading) return <ProposalsListSkeleton />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2">
          Proposals
        </Typography>
        <Typography variant="body1">
          Quorum: {quorum}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {proposals.map((proposal) => (
          <ProposalCard
            key={proposal.id}
            proposal={proposal}
          />
        ))}
      </Box>
    </Box>
  );
});

export default ProposalsList;