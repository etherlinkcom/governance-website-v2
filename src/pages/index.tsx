// pages/index.tsx
import { observer } from 'mobx-react-lite';
import { useAccount, useTezos } from '@nlfr/use-tezos';
import { walletStore } from '@/stores/walletStore';
import { Button, Typography, Box } from '@mui/material';
import { useEffect } from 'react';

const contractAddress = 'to do';

export default observer(function WalletInfo() {
  const { address, connect } = useAccount();
  const { toolkit } = useTezos();

  useEffect(() => {
    if (address && toolkit) {
      walletStore.fetchVotingPower(toolkit, address, contractAddress, 'kernel');
    }
  }, [address]);

  return (
    <Box p={4}>
      <Typography variant="h4">Governance DApp</Typography>
      <Button variant="contained" onClick={connect}>
        {address ? `Connected: ${address}` : 'Connect Wallet'}
      </Button>
      {address && (
        <>
          <Typography mt={2}>
            Kernel Voting Power: {walletStore.votingPower.kernel}
          </Typography>
        </>
      )}
    </Box>
  );
});
