import { observer } from 'mobx-react-lite';
import { walletStore } from '@/stores/walletStore';
import { Button, Typography } from '@mui/material';
import { Box } from '@mui/system';

export default observer(function Home() {
  const handleConnect = async () => {
    try {
      await walletStore.connectWallet();
    } catch (err) {
      console.error('Wallet connection failed:', err);
    }
  };

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Governance Voting DApp
      </Typography>
      <Button variant="contained" onClick={handleConnect}>
        {walletStore.address ? `Connected: ${walletStore.address}` : 'Connect Wallet'}
      </Button>
      {walletStore.address && (
        <Typography mt={2}>Balance: {walletStore.balance} ꜩ</Typography>
      )}
    </Box>
  );
});
