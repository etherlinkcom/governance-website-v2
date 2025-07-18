import { Box, Link, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { ComponentLoading } from '@/components/shared/ComponentLoading';
import { allLinkData } from '@/data/proposalLinks';
import { HashDisplay } from '../shared/HashDisplay';
import { usePeriodData } from '@/hooks/usePeriodData';

const CandidateInfoSkeleton = () => {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2">
        Candidate:
      </Typography>
      <Box sx={{ mb: 1 }}>
        <ComponentLoading width={120} height={20} borderRadius={1} />
      </Box>
      <ComponentLoading width={180} height={24} borderRadius={1} />
      <Box sx={{ display: 'flex', gap: 4, mt: 3 }}>
        <Box>
          <Typography variant="subtitle2">
            Quorum:
          </Typography>
          <ComponentLoading width={60} height={20} borderRadius={1} />
        </Box>
        <Box>
          <Typography variant="subtitle2">
            Supermajority:
          </Typography>
          <ComponentLoading width={80} height={20} borderRadius={1} />
        </Box>
      </Box>
    </Box>
  );
};

interface CandidateInfoProps {
  contractAddress?: string;
  contractVotingIndex?: number;
  promotionHash?: string;
}

export const CandidateInfo = observer(({ contractAddress, contractVotingIndex, promotionHash }: CandidateInfoProps) => {
  const { promotions, isLoading, error, hasValidParams } = usePeriodData(contractAddress, contractVotingIndex);
  const promotion_hash = promotionHash || promotions?.[0]?.proposal_hash;
  if (!promotion_hash) {
    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          No candidate information available.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2">
        Candidate:
      </Typography>
      <HashDisplay hash={promotion_hash} variant="inline" />

      {/* Stats */}
      <Box sx={{ display: 'flex', gap: 4, mt: 3 }}>
        <Box>
          <Typography variant="subtitle2">
            Quorum:
          </Typography>
          <Typography variant="body1">
            {/* {promotion.quorum} */}
          </Typography>
        </Box>
        <Box>
          <Typography variant="subtitle2">
            Supermajority:
          </Typography>
          <Typography variant="body1">
            {/* {promotion.supermajority} */}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
});