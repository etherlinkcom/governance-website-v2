import { observer } from 'mobx-react-lite';
import { useState, useEffect } from 'react';
import { Button, Box, useTheme } from '@mui/material';
import { getWalletStore } from '@/stores/WalletStore';
import { EllipsisBox } from '@/components/shared/EllipsisBox';
import WalletDialog from './WalletDialog';

interface ConnectButtonProps {
  sx?: object;
}

export const ConnectButton = observer(({ sx }: ConnectButtonProps) => {
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
      <Button variant="contained" onClick={handleConnect} sx={sx}>
        <Box sx={{ color: theme.palette.primary.contrastText }}>
          Connect
        </Box>
      </Button>
      </>
    );
  }

  return (
    <>
      <Button
        variant="outlined"
        sx={{
          whiteSpace: 'nowrap',
          px: { xs: 1, sm: 2 },
          maxWidth: '100%',
          overflow: 'hidden',
          ...sx
        }}
        onClick={handleOpen}
      >
        <EllipsisBox sx={{ maxWidth: '100%' }}>
          {walletStore.address
            ? `${walletStore.address.slice(0, 6)}...${walletStore.address.slice(-4)}`
            : ''}
        </EllipsisBox>
      </Button>
   <WalletDialog
      open={open}
      onClose={handleClose}
      onDisconnect={handleDisconnect}
    />
    </>
  );
});

export default ConnectButton;