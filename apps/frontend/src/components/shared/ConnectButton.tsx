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
  IconButton,
  useTheme,
  Paper
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LogoutIcon from '@mui/icons-material/Logout';
import { getWalletStore } from '@/stores/WalletStore';


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

  const handleCopy = () => {
    if (walletStore.address) {
      navigator.clipboard.writeText(walletStore.address);
    }
  };

  if (!walletStore.address) {
    return (
      <Button variant="contained" onClick={handleConnect}>
        Connect Wallet
      </Button>
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
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              Address
              <IconButton size="small" onClick={handleCopy} sx={{ ml: 1 }}>
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Typography>
            <Typography variant="body2" sx={{ overflow:'hidden', mb: 2 }}>
              {walletStore.address }
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