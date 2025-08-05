import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { CopyButton } from "@/components/shared/CopyButton";
import { EllipsisBox } from "@/components/shared/EllipsisBox";
import { getWalletStore } from "@/stores/WalletStore";
import { observer } from "mobx-react-lite";

interface WalletDialogProps {
  open: boolean;
  onClose: () => void;
  onDisconnect: () => void;
}

export const WalletDialog = observer(({
  open,
  onClose,
  onDisconnect,
}: WalletDialogProps) => {
  const walletStore = getWalletStore();
  if (!walletStore) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      autoFocus
      aria-hidden="false"
    >
      <DialogTitle>Wallet Info</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Typography variant="subtitle2">Address</Typography>
            <CopyButton
              text={walletStore.address || ''}
              message="Wallet address copied!"
              size="small"
            />
          </Box>
          <EllipsisBox sx={{ mb: 2 }}>
            <Typography variant="body2">{walletStore.address || 'Not Connected'}</Typography>
          </EllipsisBox>
          <Typography variant="subtitle2">Balance</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {walletStore.formattedBalance} ꜩ
          </Typography>
          <Typography variant="subtitle2">Voting Power</Typography>
          <Typography variant="body2">{walletStore.formattedVotingPercent}% ({walletStore.formattedVotingAmount})</Typography>
        </Box>

        {walletStore.formattedDelegates.length > 0 && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: -1}}>
              Voting For
            </Typography>
            <Box component="ul" sx={{ mb: 0, pl: 0 }}>
              {[...walletStore.formattedDelegates].map(([delegate, power]) => (
                <Box
                  key={delegate}
                  component="li"
                  sx={{
                    display: "flex",
                    gap: 1,
                    mb: 0.5,
                  }}
                >
                  <EllipsisBox sx={{ maxWidth: '60%', minWidth: 0 }}>
                    <Typography variant="body2">{delegate}:</Typography>
                  </EllipsisBox>
                  <Typography variant="body2">
                     {power.votingPercent}% ({power.votingAmount})
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          color="error"
          variant="outlined"
          startIcon={<LogoutIcon />}
          onClick={onDisconnect}
        >
          Disconnect
        </Button>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
});