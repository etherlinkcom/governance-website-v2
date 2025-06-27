import { Box, Typography, CircularProgress } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { contractStore } from '@/stores/ContractStore';
import CandidateInfo from '../cards/CandidateInfo';
import VotingResults from '../cards/VotingResults';
import VotersTable from '../tables/VotersTable';

const PromotionView = observer(() => {
  const { promotion, loading, error } = contractStore;

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

  if (!promotion) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">
          No promotion data available
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Candidate Section */}
      <Box>
        <CandidateInfo
          candidate={promotion.candidate}
          title={promotion.title}
          quorum={promotion.quorum}
          supermajority={promotion.supermajority}
        />

        <VotingResults votes={promotion.votes} />
      </Box>

      {/* Voters Section */}
      <Box>
        <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
          Voters
        </Typography>
        <VotersTable voters={promotion.voters} />
      </Box>
    </Box>
  );
});

export default PromotionView;