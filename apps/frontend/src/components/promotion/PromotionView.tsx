import { Box, Typography } from '@mui/material';
import { CandidateInfo } from '@/components/promotion/CandidateInfo';
import { VotingResults } from '@/components/promotion/VotingResults';
import { VotersTable } from '@/components/promotion/VotersTable';

interface PromotionViewProps {
  contractVotingIndex?: number;
  contractAddress?: string;
  promotionHash?: string;
}

export const PromotionView = ({ contractVotingIndex, contractAddress, promotionHash }: PromotionViewProps) => {

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
      {/* Candidate Section */}
      <Box>
        <CandidateInfo
          contractVotingIndex={contractVotingIndex}
          contractAddress={contractAddress}
          promotionHash={promotionHash}
        />
        <VotingResults
          contractVotingIndex={contractVotingIndex}
          contractAddress={contractAddress}
          promotionHash={promotionHash}
        />
      </Box>

      {/* Voters Section */}
      <Box>
        <Typography variant="h5" component="h2" sx={{ mb: 2, ml: 2 }}>
          Voters
        </Typography>
        <VotersTable
          contractVotingIndex={contractVotingIndex}
          contractAddress={contractAddress}
        />
      </Box>
    </Box>
  );
};