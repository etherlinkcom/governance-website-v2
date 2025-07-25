import { observer } from 'mobx-react-lite';
import { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  useTheme,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { getWalletStore } from '@/stores/WalletStore';
import { CopyButton } from '@/components/shared/CopyButton';
import { MetaMaskIcon } from '@/components/shared/icons/MetaMaskIcon';

export const ConnectButton = observer(() => {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [walletStore, setWalletStore] = useState<ReturnType<typeof getWalletStore> | null>(null);

  const theme = useTheme();

  useEffect(() => {
    setMounted(true);
    setWalletStore(getWalletStore());
  }, []);

  if (!mounted || !walletStore) {
    return null;
  }

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleConnect = async () => {
    await walletStore.connect();
    setOpen(true);
  };

  const handleDisconnect = async () => {
    await walletStore.disconnect();
    setOpen(false);
  };

  if (!walletStore.address) {
    return (
      <>
      <Button variant="contained" onClick={handleConnect} >
        <Box sx={{
          color: theme.palette.primary.contrastText,
          display: { xs: 'none', sm: 'inline-flex' }
        }}>
          Connect
        </Box>
        <Box sx={{
          display: { xs: 'inline-flex', sm: 'none' }
        }}>
          <MetaMaskIcon />
        </Box>
      </Button>
      </>
    );
  }

  return (
    <>
      <Button
        variant="outlined"
        sx={{ whiteSpace: 'nowrap'}}
        onClick={handleOpen}
      >
        {walletStore.balance.toFixed(2)} ꜩ
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          Wallet Info
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="subtitle2">
                Address
              </Typography>
              <CopyButton
                text={walletStore.address}
                message="Wallet address copied!"
                size="small"
              />
            </Box>
            <Typography variant="body2" sx={{ overflow:'hidden', mb: 2, fontFamily: 'monospace' }}>
              {walletStore.address}
            </Typography>
            <Typography variant="subtitle2">Balance</Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {walletStore.balance.toFixed(2)} ꜩ
            </Typography>
            <Typography variant="subtitle2">Voting Power</Typography>
            <Typography variant="body2">
              {walletStore.votingPower}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            color="error"
            variant="outlined"
            startIcon={<LogoutIcon />}
            onClick={handleDisconnect}
          >
            Disconnect
          </Button>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
});

export default ConnectButton;