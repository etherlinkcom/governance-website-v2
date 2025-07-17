import { Box, Typography } from '@mui/material';
import { contractStore2 } from '@/stores/ContractStore2';
import {CandidateInfo} from '@/components/promotion/CandidateInfo';
import {VotingResults} from '@/components/promotion/VotingResults';
import {VotersTable} from '@/components/promotion/VotersTable';


export const PromotionView = () => {
  const { error } = contractStore2;

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
      {/* Candidate Section */}
      <Box>
        <CandidateInfo/>
        <VotingResults/>
      </Box>

      {/* Voters Section */}
      <Box>
        <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
          Voters
        </Typography>
        <VotersTable />
      </Box>
    </Box>
  );
};