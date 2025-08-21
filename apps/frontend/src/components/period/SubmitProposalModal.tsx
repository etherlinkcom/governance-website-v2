import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  TextField,
  Box,
} from "@mui/material";
import { useState } from "react";
import type { GovernanceType } from "@trilitech/types";
import { getWalletStore } from "@/stores/WalletStore";

interface SubmitProposalButtonProps {
  contractAddress: string;
  governanceType?: GovernanceType;
}

export const SubmitProposalButton = ({
  contractAddress,
  governanceType,
}: SubmitProposalButtonProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [proposalText, setProposalText] = useState("");
  const [poolAddress, setPoolAddress] = useState("");
  const [sequencerPublicKey, setSequencerPublicKey] = useState("");

  const isSequencer = governanceType === "sequencer";
  const walletStore = getWalletStore();

  const handleSubmitProposal = () => {
    if (isSequencer) {
      // Validate sequencer fields
      if (poolAddress.trim() === "" || sequencerPublicKey.trim() === "") {
        console.log("Pool address and sequencer public key cannot be blank");
        return;
      }

      walletStore?.submitSequencerProposal(
        contractAddress,
        poolAddress.trim(),
        sequencerPublicKey.trim(),
      );
    } else {
      if (proposalText.trim() === "") {
        console.log("Proposal text cannot be blank");
        return;
      }

      walletStore?.submitProposal(
        contractAddress,
        proposalText.trim()
      );
    }

    handleClose();
  };

  const handleClose = () => {
    setProposalText("");
    setPoolAddress("");
    setSequencerPublicKey("");
    setModalOpen(false);
  };

  const isFormValid = isSequencer
    ? poolAddress.trim() !== "" && sequencerPublicKey.trim() !== ""
    : proposalText.trim() !== "";

  return (
    <>
      <Button
        variant="contained"
        onClick={() => setModalOpen(true)}
      >
        Submit Proposal
      </Button>

      <Dialog
        open={modalOpen}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        autoFocus
        aria-hidden="false"
      >
        <DialogTitle>
          Submit {isSequencer ? "Sequencer" : "Proposal"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            {isSequencer ? (
              <>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Enter pool address"
                  value={poolAddress}
                  onChange={(e) => setPoolAddress(e.target.value)}
                />
                <TextField
                  fullWidth
                  label="Sequencer Public Key"
                  placeholder="Enter sequencer public key"
                  value={sequencerPublicKey}
                  onChange={(e) => setSequencerPublicKey(e.target.value)}
                />
              </>
            ) : (
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Enter your proposal"
                value={proposalText}
                onChange={(e) => setProposalText(e.target.value)}
              />
            )}

            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmitProposal}
              disabled={!isFormValid}
              fullWidth
            >
              Submit
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};