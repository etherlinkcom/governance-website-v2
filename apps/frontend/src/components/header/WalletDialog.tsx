import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
  TextField,
} from "@mui/material";
import { CopyButton } from "@/components/shared/CopyButton";
import { EllipsisBox } from "@/components/shared/EllipsisBox";
import { getWalletStore } from "@/stores/WalletStore";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { validateAddress, ValidationResult } from '@taquito/utils';

interface WalletDialogProps {
  open: boolean;
  onClose: () => void;
  onDisconnect: () => void;
}

export const WalletDialog = observer(
  ({ open, onClose, onDisconnect }: WalletDialogProps) => {
    const walletStore = getWalletStore();
    if (!walletStore) return null;

    const [claimOpen, setClaimOpen] = useState(false);
    const [claimInput, setClaimInput] = useState("");

    const claimVotingRights = async (input: string) => {
      if (!walletStore) return;
      await walletStore.claimVotingRights(input);
      setClaimOpen(false);
      setClaimInput("")
      await walletStore.refreshVotingPower();
    };

    const isValidateAddress = (address: string): boolean => {
      return validateAddress(address) === ValidationResult.VALID;
    };

    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="xs"
        fullWidth
        autoFocus={false}
        disableEnforceFocus={true}
        aria-hidden="false"
      >
        <DialogTitle>Wallet Info</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Typography variant="subtitle2">Address</Typography>
              <CopyButton
                text={walletStore.address || ""}
                message="Wallet address copied!"
                size="small"
              />
            </Box>
            <EllipsisBox sx={{ mb: 2 }}>
              <Typography variant="body2">
                {walletStore.address || "Not Connected"}
              </Typography>
            </EllipsisBox>
            <Typography variant="subtitle2">Balance</Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {walletStore.formattedBalance} ꜩ
            </Typography>
            <Typography variant="subtitle2">Voting Power</Typography>
            <Typography variant="body2">
              {walletStore.formattedVotingPercent}% (
              {walletStore.formattedVotingAmount})
            </Typography>
          </Box>

          {walletStore.formattedDelegates.length > 0 && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: -1 }}>
                Voting For
              </Typography>
              <Box component="ul" sx={{ mb: 0, pl: 0 }}>
                {[...walletStore.formattedDelegates].map(
                  ([delegate, power]) => (
                    <Box
                      key={delegate}
                      component="li"
                      sx={{
                        display: "flex",
                        gap: 1,
                        mb: 0.5,
                      }}
                    >
                      <EllipsisBox sx={{ maxWidth: "60%", minWidth: 0 }}>
                        <Typography variant="body2">{delegate}:</Typography>
                      </EllipsisBox>
                      <Typography variant="body2">
                        {power.votingPercent}% ({power.votingAmount})
                      </Typography>
                    </Box>
                  )
                )}
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ display: "flex", gap: 1, p: 2, flexDirection: { xs: "column", sm: "row" } }}>
          <Button onClick={() => setClaimOpen(true)} variant="outlined" sx={{width: { xs: "100%", sm: "auto" }}}>
            Claim Voting Rights
          </Button>
          <Button onClick={onDisconnect} variant="outlined" sx={{width: { xs: "100%", sm: "auto" }}}>
            Disconnect
          </Button>
          <Button onClick={onClose} variant="contained" sx={{width: { xs: "100%", sm: "auto" }}}>
            Close
          </Button>
        </DialogActions>

        {/* Claim Voting Rights */}
        <Dialog
          disableEnforceFocus={true}
          open={claimOpen}
          onClose={() => setClaimOpen(false)}
          autoFocus={false}
          aria-hidden="false"
          >
          <DialogTitle>Claim Voting Rights</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              placeholder="Enter Bakers Address"
              value={claimInput}
              onChange={e => setClaimInput(e.target.value)}
              error={!isValidateAddress(claimInput) && claimInput !== ""}
              helperText={
                claimInput && !isValidateAddress(claimInput) ? "Invalid address" : ""
              }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setClaimOpen(false)}>Cancel</Button>
            <Button
              onClick={() =>  claimVotingRights(claimInput)}
              disabled={!claimInput.trim() || !isValidateAddress(claimInput) || walletStore?.isVoting}
              variant="contained"
            >
              {walletStore?.isVoting ? "Claiming..." : "Claim"}
            </Button>
          </DialogActions>
        </Dialog>
      </Dialog>
    );
  }
);
