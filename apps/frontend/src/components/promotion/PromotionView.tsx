import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
} from "@mui/material";
import { CandidateInfo } from "@/components/promotion/CandidateInfo";
import { VotingResults } from "@/components/promotion/VotingResults";
import { VotersTable } from "@/components/promotion/VotersTable";
import { getWalletStore, OperationResult } from "@/stores/WalletStore";
import { useState } from "react";
import { VoteOption } from "@trilitech/types";
import { observer } from "mobx-react-lite";
import { contractStore } from "@/stores/ContractStore";

interface PromotionViewProps {
  contractVotingIndex: number;
  contractAddress?: string;
  promotionHash?: string;
  isCurrentPeriod?: boolean;
}

export const PromotionView = observer(({
  contractVotingIndex,
  contractAddress,
  promotionHash,
  isCurrentPeriod,
}: PromotionViewProps) => {
  const [voteModalOpen, setVoteModalOpen] = useState(false);
  const [selectedVote, setSelectedVote] = useState<VoteOption>("yea");
  const walletStore = getWalletStore();
  const isVoting = walletStore?.isVoting;

  const handleVote = async () => {
    if (!contractAddress || !walletStore) return;

    try {
      const operation: OperationResult | undefined = await walletStore.vote(contractAddress, selectedVote);

      if (!operation?.completed) return;

      contractStore.createVote(
        promotionHash || "",
        walletStore.address || "",
        walletStore.alias,
        walletStore.votingPowerAmount,
        selectedVote,
        operation?.level || 0,
        operation?.opHash || '',
        contractAddress,
        contractVotingIndex
      )

      setVoteModalOpen(false);
    } catch (error) {
      console.error("Error submitting vote:", error);
    }
  };

  return (
    <Box sx={{ p: 2, display: "flex", flexDirection: "column" }}>
      {/* Candidate Section */}
      <Box>
        <CandidateInfo
          contractVotingIndex={contractVotingIndex}
          contractAddress={contractAddress}
          promotionHash={promotionHash}
        />
        <VotingResults
          contractVotingIndex={contractVotingIndex}
          contractAddress={contractAddress}
        />
      </Box>

      {isCurrentPeriod && walletStore?.hasVotingPower && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <Button variant="contained" onClick={() => setVoteModalOpen(true)}>
            Vote
          </Button>
        </Box>
      )}

      {/* Voters Section */}
      <Box>
        <Typography variant="h5" component="h2" sx={{ mb: 2, ml: 2 }}>
          Voters
        </Typography>
        <VotersTable
          contractVotingIndex={contractVotingIndex}
          contractAddress={contractAddress}
        />
      </Box>

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
          <Button onClick={handleVote} variant="contained" disabled={isVoting} sx={{ minWidth: 128 }}>
            {isVoting ? <CircularProgress size="20px" sx={{color: theme => theme.palette.custom.tableBg.even}} /> : "Submit Vote"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
});
