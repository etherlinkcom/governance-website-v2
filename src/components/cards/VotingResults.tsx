import { Box } from '@mui/material';
import VoteResultCard from './VoteResultCard';

interface VotingResultsProps {
  votes: {
    yea: { percentage: number; count: number; label: string };
    nay: { percentage: number; count: number; label: string };
    pass: { percentage: number; count: number; label: string };
  };
}

const VotingResults = ({ votes }: VotingResultsProps) => {
  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
      <VoteResultCard
        type="yea"
        percentage={votes.yea.percentage}
        count={votes.yea.count}
        label={votes.yea.label}
      />
      <VoteResultCard
        type="nay"
        percentage={votes.nay.percentage}
        count={votes.nay.count}
        label={votes.nay.label}
      />
      <VoteResultCard
        type="pass"
        percentage={votes.pass.percentage}
        count={votes.pass.count}
        label={votes.pass.label}
      />
    </Box>
  );
};

export default VotingResults;