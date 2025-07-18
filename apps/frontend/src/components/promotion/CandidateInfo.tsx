import { Box, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { ComponentLoading } from '@/components/shared/ComponentLoading';
import { HashDisplay } from '../shared/HashDisplay';
import { usePeriodData } from '@/hooks/usePeriodData';
import { getPromotionQuorumPercent, getPromotionSupermajorityPercent } from '@/lib/votingCalculations';

const CandidateInfoSkeleton = () => {
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2">
            Candidate:
          </Typography>
          <ComponentLoading width={120} height={20} borderRadius={1} />
          <ComponentLoading width={180} height={24} borderRadius={1} />
        </Box>

        <Box sx={{ display: 'flex', gap: 4 }}>
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

  if (isLoading) return <CandidateInfoSkeleton />;

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
        {/* Left side - Candidate info */}
        <Box sx={{
          flex: 1,
          minWidth: 0,
          overflow: 'hidden'
        }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Candidate:
          </Typography>
          <HashDisplay
            hash={promotion_hash}
            variant="inline"
          />
        </Box>

        {/* Right side - Stats */}
        <Box sx={{
          display: 'flex',
          gap: 4,
          flexShrink: 0
        }}>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="subtitle2">
              Quorum:
            </Typography>
            <Typography variant="body1">
              {(getPromotionQuorumPercent(
                promotions[0]?.yea_voting_power,
                promotions[0]?.nay_voting_power,
                promotions[0]?.pass_voting_power,
                promotions[0]?.total_voting_power
              )).toFixed(2)}%
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="subtitle2">
              Supermajority:
            </Typography>
            <Typography variant="body1">
              {(getPromotionSupermajorityPercent(
                promotions[0]?.yea_voting_power,
                promotions[0]?.nay_voting_power
              )).toFixed(2)}%
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
});