import { Box, Typography, useTheme } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { ComponentLoading } from '@/components/shared/ComponentLoading';
import { HashDisplay } from '@/components/shared/HashDisplay';
import { getPromotionQuorumPercent, getPromotionSupermajorityPercent } from '@/lib/votingCalculations';
import { VotingProgress } from '@/components/shared/VotingProgress';
import { contractStore } from '@/stores/ContractStore';

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
  const { promotions, isLoading, contractAndConfig } = contractStore.getPeriodData(contractAddress, contractVotingIndex);
  const theme = useTheme();
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
  )).toNumber();
  const promotionSupermajority = (getPromotionSupermajorityPercent(
    promotions[0]?.yea_voting_power,
    promotions[0]?.nay_voting_power
  )).toNumber();

  const contractQuorum = contractAndConfig.promotion_quorum;
  const contractSupermajority = contractAndConfig.promotion_supermajority;
  const quorumProgess = Math.min((promotionQuorum / contractQuorum) * 100, 100);
  const supermajorityProgress = Math.min((promotionSupermajority / contractSupermajority) * 100, 100);

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
          <HashDisplay hash={promotion_hash}/>
        </Box>

        {/* Right side - Stats */}
        <Box sx={{
          display: 'flex',
          flexShrink: 0,
          flexDirection: 'column',
        }}>
          <VotingProgress
            label="Quorum"
            value={promotionQuorum.toFixed(2)}
            required={contractQuorum}
            progress={quorumProgess}
          />
          <VotingProgress
            label="Supermajority"
            value={promotionSupermajority.toString()}
            required={contractSupermajority}
            progress={supermajorityProgress}
          />
        </Box>
      </Box>
    </Box>
  );
});