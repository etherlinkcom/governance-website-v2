import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { useState } from "react";
import { observer } from "mobx-react-lite";
import { getWalletStore } from "@/stores/WalletStore";
import { validateAddress, ValidationResult } from "@taquito/utils";

export const ClaimVotingRightsButton = observer(() => {
  const walletStore = getWalletStore();
  const [open, setOpen] = useState(false);
  const [claimInput, setClaimInput] = useState("");

  const claimVotingRights = async (input: string) => {
    if (!walletStore) return;
    await walletStore.claimVotingRights(input);
    setOpen(false);
    setClaimInput("");
    await walletStore.refreshVotingPower();
  };

  const isDelegate: boolean | undefined = walletStore?.isDelegate(claimInput) && !(walletStore?.address === claimInput);
  const isUserAddress: boolean = walletStore?.address === claimInput;

  const errorText = (): string => {
    if (validateAddress(claimInput) !== ValidationResult.VALID && claimInput !== "") return "Invalid address";
    if (isUserAddress) return "You cannot claim voting rights for your own address.";
    if (isDelegate) return "You are already a delegate for this address. Claiming again will revoke your voting rights for this address.";
    return "";
  }

  const buttonText: string = walletStore?.isVoting
    ? isDelegate
      ? "Revoking..."
      : "Claiming..."
    : isDelegate
    ? "Revoke"
    : "Claim";

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="outlined"
        sx={{ width: { xs: "100%", sm: "auto" } }}
      >
        Claim Voting Rights
      </Button>
      <Dialog
        disableEnforceFocus={true}
        open={open}
        onClose={() => setOpen(false)}
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
            error={errorText() !== ""}
            helperText={errorText()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={() => claimVotingRights(claimInput)}
            variant="contained"
            disabled={
              errorText() !== "" && !isDelegate ||
              walletStore?.isVoting
            }
          >
            {buttonText}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
});