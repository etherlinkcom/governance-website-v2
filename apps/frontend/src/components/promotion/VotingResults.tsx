import React, { useState } from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, RadioGroup, FormControlLabel, Radio, Card, CardContent } from '@mui/material';
import { ComponentLoading } from '@/components/shared/ComponentLoading';
import { VoteResultCard } from '@/components/promotion/VoteResultCard';
import { observer } from 'mobx-react-lite';
import { Promotion } from '@trilitech/types';
import { contractStore } from '@/stores/ContractStore';
import { getWalletStore } from '@/stores/WalletStore';

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
  promotionHash?: string;
}

export const VotingResults = observer(({ contractVotingIndex, contractAddress, promotionHash }: VotingResultsProps) => {
  const { votes, promotions, isLoading, error, hasValidParams } = contractStore.getPeriodData(contractAddress, contractVotingIndex);
  const walletStore = getWalletStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedVote, setSelectedVote] = useState<'yea' | 'nay' | 'pass'>('yea');

  if (!hasValidParams) {
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

  if (!votes || votes.length === 0) {
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

  const promotion: Promotion = promotions[0];
  const yeaVotes = promotion.yea_voting_power || 0;
  const nayVotes = promotion.nay_voting_power || 0;
  const passVotes = promotion.pass_voting_power || 0;
  const totalVotes = (yeaVotes + nayVotes + passVotes) || 0;

  const yeaPercentage = totalVotes > 0 ? ((yeaVotes / totalVotes) * 100).toFixed(2) : "0";
  const nayPercentage = totalVotes > 0 ? ((nayVotes / totalVotes) * 100).toFixed(2) : "0";
  const passPercentage = totalVotes > 0 ? ((passVotes / totalVotes) * 100).toFixed(2) : "0";

  const handleVoteSubmit = () => {
    walletStore?.vote(contractAddress!, selectedVote);
    setDialogOpen(false);
  };

  return (
    <>
      <Box sx={{
        display: 'flex',
        gap: 2,
        my: 4,
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between'
      }}>
        <VoteResultCard type="yea" percentage={yeaPercentage} count={yeaVotes} label="Yea" />
        <VoteResultCard type="nay" percentage={nayPercentage} count={nayVotes} label="Nay" />
        <VoteResultCard type="pass" percentage={passPercentage} count={passVotes} label="Pass" />
      </Box>
      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 2, width: {xs: '100%', sm: '100px'} }}
        onClick={() => setDialogOpen(true)}
      >
        Vote
      </Button>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Cast Your Vote</DialogTitle>
        <DialogContent>
          <RadioGroup
            value={selectedVote}
            onChange={e => setSelectedVote(e.target.value as 'yea' | 'nay' | 'pass')}
          >
            <FormControlLabel value="yea" control={<Radio />} label="Yea" />
            <FormControlLabel value="nay" control={<Radio />} label="Nay" />
            <FormControlLabel value="pass" control={<Radio />} label="Pass" />
          </RadioGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleVoteSubmit}>Submit Vote</Button>
        </DialogActions>
      </Dialog>
    </>
  );
});