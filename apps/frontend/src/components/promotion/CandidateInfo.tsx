import { Box, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { ComponentLoading } from '@/components/shared/ComponentLoading';
import { HashDisplay } from '@/components/shared/HashDisplay';
import { calculateVotingProgress, getPromotionQuorumPercent, getPromotionSupermajorityPercent } from '@/lib/votingCalculations';
import { VotingProgress } from '@/components/shared/VotingProgress';
import { contractStore } from '@/stores/ContractStore';
import { EllipsisBox } from '@/components/shared/EllipsisBox';

const CandidateInfoSkeleton = () => {
  return (
    <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
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
  const { promotions, isLoading, contractAndConfig } = contractStore.getPeriodData(contractAddress, contractVotingIndex);
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
  if (!contractAndConfig) {
    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          No contract available
        </Typography>
      </Box>
    );
  }


  const promotionQuorum = (getPromotionQuorumPercent(
    promotions[0]?.yea_voting_power,
    promotions[0]?.nay_voting_power,
    promotions[0]?.pass_voting_power,
    promotions[0]?.total_voting_power
  )).toNumber() || 0;
  const promotionSupermajority = (getPromotionSupermajorityPercent(
    promotions[0]?.yea_voting_power,
    promotions[0]?.nay_voting_power
  )).toNumber() || 0;

  const contractQuorum = contractAndConfig.promotion_quorum;
  const contractSupermajority = contractAndConfig.promotion_supermajority;
  const quorumProgress = calculateVotingProgress(promotionQuorum, contractQuorum);
  const supermajorityProgress = calculateVotingProgress(promotionSupermajority, contractSupermajority);

  return (
    <Box sx={{ mb: 2 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column-reverse', sm: 'row' },
          alignItems: 'flex-start',
          gap: 2,
          justifyContent: { xs: 'flex-end', sm: 'space-between' },
        }}
      >
        {/* Left side - Candidate info */}
        <EllipsisBox sx={{ maxWidth: '100%' }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Candidate:
          </Typography>
          <HashDisplay hash={promotion_hash}/>
        </EllipsisBox>

        {/* Right side - Stats */}
        <Box sx={{
          display: 'flex',
          flexShrink: 0,
          flexDirection: 'column',
          width: { xs: '100%', sm: 'auto' },
        }}>
          <VotingProgress
            label="Quorum"
            value={promotionQuorum.toFixed(2)}
            required={contractQuorum}
            progress={quorumProgress}
            variant='body1'
          />
          <VotingProgress
            label="Supermajority"
            value={promotionSupermajority.toString()}
            required={contractSupermajority}
            progress={supermajorityProgress}
            variant="body1"
          />
        </Box>
      </Box>
    </Box>
  );
});