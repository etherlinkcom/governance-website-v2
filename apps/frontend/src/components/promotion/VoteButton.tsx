import { contractStore } from "@/stores/ContractStore";
import { getWalletStore, OperationResult } from "@/stores/WalletStore";
import {
    Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
} from "@mui/material";
import { ContractAndConfig, VoteOption } from "@trilitech/types";
import { observer } from "mobx-react-lite";
import { useState } from "react";

interface VoteButtonProps {
  isCurrentPeriod?: boolean;
  contractVotingIndex: number;
  promotionHash: string
}

export const VoteButton = observer(({isCurrentPeriod= false, contractVotingIndex, promotionHash} : VoteButtonProps) => {
  const [voteModalOpen, setVoteModalOpen] = useState<boolean>(false);
  const [selectedVote, setSelectedVote] = useState<VoteOption>("yea");
  const walletStore = getWalletStore();
  const isVoting = walletStore?.isVoting;

  const contract: ContractAndConfig | undefined = contractStore.currentContract;
  const handleVote = async () => {
    if (!contract || !walletStore) return;

    try {
      const operation: OperationResult | undefined = await walletStore.vote(
        contract.contract_address,
        selectedVote
      );

      if (!operation?.completed) return;

      contractStore.createVote(
        promotionHash || "",
        walletStore.address || "",
        walletStore.alias,
        walletStore.votingPowerAmount,
        selectedVote,
        operation?.level || 0,
        operation?.opHash || '',
        contract.contract_address,
        contractVotingIndex
      )

      setVoteModalOpen(false);
    } catch (error) {
      console.error("Error submitting vote:", error);
    }
  };

  return (
    <>
        {isCurrentPeriod && walletStore?.hasVotingPower && (
            <Button
              variant="contained"
              onClick={() => setVoteModalOpen(true)}
              sx={{ width: { xs: "100%", md: "auto" } }}
              >
                Vote
            </Button>
        )}
      <Dialog
        open={voteModalOpen}
        onClose={() => setVoteModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Vote on Promotion</DialogTitle>
        <DialogContent>
          <FormControl component="fieldset" sx={{ mt: 2 }}>
            <RadioGroup
              value={selectedVote}
              onChange={(e) => setSelectedVote(e.target.value as VoteOption)}
            >
              <FormControlLabel
                value="yea"
                control={<Radio />}
                label="Yea (Approve)"
              />
              <FormControlLabel
                value="nay"
                control={<Radio />}
                label="Nay (Reject)"
              />
              <FormControlLabel
                value="pass"
                control={<Radio />}
                label="Pass (Abstain)"
              />
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVoteModalOpen(false)}>Cancel</Button>
          <Button
            onClick={handleVote}
            variant="contained"
            disabled={isVoting}
            sx={{ minWidth: 128 }}
          >
            {isVoting ? (
              <CircularProgress
                size="20px"
                sx={{ color: (theme) => theme.palette.custom.tableBg.even }}
              />
            ) : (
              "Submit Vote"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
});
