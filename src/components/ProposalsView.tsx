import { Box, Typography, CircularProgress } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { contractStore } from '@/stores/ContractStore';
import ProposalsList from './ProposalsList';
import UpvotersTable from './UpvotersTable';

const ProposalsView = observer(() => {
  const { proposals, upvoters, quorum, loading, error } = contractStore;

  const handleProposalClick = (proposal: any) => {
    console.log('Clicked proposal:', proposal);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ color: 'error.main' }}>
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Proposals Section */}
      <ProposalsList
        proposals={proposals}
        quorum={quorum}
        onProposalClick={handleProposalClick}
      />

      {/* Upvoters Section */}
      <Box>
        <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
          Upvoters
        </Typography>
        <UpvotersTable upvoters={upvoters} />
      </Box>
    </Box>
  );
});

export default ProposalsView;