import { Box, Card, CardContent } from '@mui/material';
import {ComponentLoading} from '@/components/shared/ComponentLoading';
import {VoteResultCard} from './VoteResultCard';
import { contractStore } from '@/stores/ContractStore';
import { observer } from 'mobx-react-lite';

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

export const VotingResults = observer(() => {
  const { promotion, isLoading } = contractStore;

  if (isLoading) return <VotingResultsSkeleton />;

  if (!promotion) {
    return (
      <Box sx={{ mb: 2 }}>
        <Card>
          <CardContent>
            <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
              No voting results available.
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
      <VoteResultCard
        type="yea"
        percentage={promotion.votes.yea.percentage}
        count={promotion.votes.yea.count}
        label={promotion.votes.yea.label}
      />
      <VoteResultCard
        type="nay"
        percentage={promotion.votes.nay.percentage}
        count={promotion.votes.nay.count}
        label={promotion.votes.nay.label}
      />
      <VoteResultCard
        type="pass"
        percentage={promotion.votes.pass.percentage}
        count={promotion.votes.pass.count}
        label={promotion.votes.pass.label}
      />
    </Box>
  );
});