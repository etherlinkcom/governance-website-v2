import React, { useState, useEffect } from 'react';
import { Button, Card, CardContent, Typography, Box, Alert, TextField } from '@mui/material';
import { getWalletStore } from '../stores/WalletStore';
import { observer } from 'mobx-react-lite';

const TestGovernance = observer(() => {
  const [walletStore, setWalletStore] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);
  const [proposalHashes, setProposalHashes] = useState<Record<string, string>>({
    slow: '',
    sequencer: '',
    fast: ''
  });

  useEffect(() => {
    setIsClient(true);
    const store = getWalletStore();
    setWalletStore(store);
  }, []);

  // Ne rend rien côté serveur pour éviter l'erreur d'hydratation
  if (!isClient) {
    return null;
  }

  if (!walletStore) {
    return <Alert severity="warning">Wallet store not available</Alert>;
  }

  const handleVote = async (label: 'slow' | 'sequencer' | 'fast', voteType: 'yea' | 'nay' | 'pass') => {
    try {
      const opHash = await walletStore.vote(label, voteType);
      console.log(`Vote successful: ${opHash}`);
    } catch (error) {
      console.error('Vote failed:', error);
    }
  };

  const handleUpvote = async (label: 'slow' | 'sequencer' | 'fast') => {
    const proposalHash = proposalHashes[label];
    if (!proposalHash.trim()) {
      console.error('Proposal hash is required');
      return;
    }

    try {
      const opHash = await walletStore.upvoteProposal(label, proposalHash);
      console.log(`Upvote successful: ${opHash}`);
    } catch (error) {
      console.error('Upvote failed:', error);
    }
  };

  const handleProposalHashChange = (label: string, value: string) => {
    setProposalHashes(prev => ({
      ...prev,
      [label]: value
    }));
  };

  const governanceTypes: Array<'slow' | 'sequencer' | 'fast'> = ['slow', 'sequencer', 'fast'];
  const voteTypes: Array<'yea' | 'nay' | 'pass'> = ['yea', 'nay', 'pass'];

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Governance Functions Test
      </Typography>
      
      {!walletStore.address && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Please connect your wallet first using the connection panel above
        </Alert>
      )}

      {governanceTypes.map((label) => (
        <Card key={label} sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {label.toUpperCase()} Governance
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Vote Functions:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {voteTypes.map((voteType) => (
                  <Button
                    key={voteType}
                    variant="outlined"
                    size="small"
                    disabled={!walletStore.address || walletStore.loading[`vote_${label}`]}
                    onClick={() => handleVote(label, voteType)}
                  >
                    {voteType.toUpperCase()}
                  </Button>
                ))}
              </Box>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Upvote Function:
              </Typography>
              <TextField
                fullWidth
                label="Proposal Hash"
                variant="outlined"
                size="small"
                value={proposalHashes[label]}
                onChange={(e) => handleProposalHashChange(label, e.target.value)}
                placeholder="Enter proposal hash..."
                sx={{ mb: 1 }}
              />
              <Button
                variant="contained"
                color="primary"
                disabled={!walletStore.address || walletStore.loading[`upvote_${label}`] || !proposalHashes[label].trim()}
                onClick={() => handleUpvote(label)}
              >
                Upvote Proposal
              </Button>
            </Box>

            {walletStore.loading[`vote_${label}`] && (
              <Alert severity="info" sx={{ mt: 1 }}>
                Voting in progress...
              </Alert>
            )}

            {walletStore.loading[`upvote_${label}`] && (
              <Alert severity="info" sx={{ mt: 1 }}>
                Upvoting in progress...
              </Alert>
            )}

            {walletStore.error[`vote_${label}`] && (
              <Alert severity="error" sx={{ mt: 1 }}>
                {walletStore.error[`vote_${label}`]}
              </Alert>
            )}

            {walletStore.error[`upvote_${label}`] && (
              <Alert severity="error" sx={{ mt: 1 }}>
                {walletStore.error[`upvote_${label}`]}
              </Alert>
            )}

            {walletStore.lastUpdated[`vote_${label}`] && (
              <Typography variant="caption" color="success.main">
                Last vote: {new Date(walletStore.lastUpdated[`vote_${label}`]).toLocaleString()}
              </Typography>
            )}

            {walletStore.lastUpdated[`upvote_${label}`] && (
              <Typography variant="caption" color="success.main">
                Last upvote: {new Date(walletStore.lastUpdated[`upvote_${label}`]).toLocaleString()}
              </Typography>
            )}
          </CardContent>
        </Card>
      ))}
    </Box>
  );
});

export default TestGovernance; 