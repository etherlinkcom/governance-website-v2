import { Box, Card, CardContent } from '@mui/material';
import { ComponentLoading } from '@/components/shared/ComponentLoading';
import { VoteResultCard } from '@/components/promotion/VoteResultCard';
import { observer } from 'mobx-react-lite';
import { Promotion } from '@trilitech/types';
import { contractStore } from '@/stores/ContractStore';

export const VotingResultsSkeleton = () => {
  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
      {[1, 2, 3].map(i => (
        <Box key={i} sx={{ flex: 1 }}>
          <ComponentLoading width="100%" height={100} borderRadius={2} />
        </Box>
      ))}
    </Box>
  );
};

interface VotingResultsProps {
  contractVotingIndex?: number;
  contractAddress?: string;
}

export const VotingResults = observer(({ contractVotingIndex, contractAddress }: VotingResultsProps) => {
  const { votes, promotions, isLoading, error, hasValidParams } = contractStore.getPeriodData(contractAddress, contractVotingIndex);

  if (!hasValidParams) {
   return (
      <Box sx={{ mb: 2 }}>
        <Card>
          <CardContent>
            <Box sx={{ textAlign: 'center', color: 'text.secondary', mt:1 }}>
              No voting results available.
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (isLoading) return <VotingResultsSkeleton />;

  if (error) {
    return (
      <Box sx={{ mb: 2 }}>
        <Card>
          <CardContent>
            <Box sx={{ textAlign: 'center', color: 'error.main' }}>
              Error loading voting results: {error}
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }


  const promotion: Promotion = promotions[0];
  const yeaVotes = promotion.yea_voting_power || 0;
  const nayVotes = promotion.nay_voting_power || 0;
  const passVotes = promotion.pass_voting_power || 0;
  const totalVotes = (yeaVotes + nayVotes + passVotes) || 0;

  const yeaPercentage = totalVotes > 0 ? ((yeaVotes / totalVotes) * 100).toFixed(2) : "0";
  const nayPercentage = totalVotes > 0 ? ((nayVotes / totalVotes) * 100).toFixed(2) : "0";
  const passPercentage = totalVotes > 0 ? ((passVotes / totalVotes) * 100).toFixed(2) : "0";

  return (
    <Box sx={{
        display: 'flex',
        gap: 2,
        my: 4,
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between'
        }}>
      <VoteResultCard
        type="yea"
        percentage={yeaPercentage}
        count={yeaVotes}
        label="Yea"
      />
      <VoteResultCard
        type="nay"
        percentage={nayPercentage}
        count={nayVotes}
        label="Nay"
      />
      <VoteResultCard
        type="pass"
        percentage={passPercentage}
        count={passVotes}
        label="Pass"
      />
    </Box>
  );
});