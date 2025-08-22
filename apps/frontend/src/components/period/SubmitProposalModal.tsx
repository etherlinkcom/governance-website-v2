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
import { observer } from "mobx-react-lite";

interface SubmitProposalButtonProps {
  contractAddress: string;
  governanceType?: GovernanceType;
}

export const SubmitProposalButton = observer(({ contractAddress, governanceType }: SubmitProposalButtonProps) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [proposalText, setProposalText] = useState("");
    const [poolAddress, setPoolAddress] = useState("");
    const [sequencerPublicKey, setSequencerPublicKey] = useState("");

    const isSequencer = governanceType === "sequencer";
    const walletStore = getWalletStore();
    const isSubmitting = walletStore?.isVoting;

    const getBytesError = (input: string): string | null => {
      if (!input.trim()) return "Bytes input is required";
      if (input.length <= 65) return "Bytes must be longer than 65 characters";
      if (input.length % 2 !== 0) return "Bytes length must be even";
      if (!/^[0-9a-f]+$/.test(input))
        return "Must be valid hex (0-9, a-f only)";
      return null;
    };

    const handleSubmitProposal = async () => {
      if (isSequencer) {

        if (poolAddress.trim() === "" || sequencerPublicKey.trim() === "") {
          console.log("Pool address and sequencer public key cannot be blank");
          return;
        }
        if (getBytesError(poolAddress)) return;

        await walletStore?.submitSequencerProposal(
          contractAddress,
          poolAddress.trim(),
          sequencerPublicKey.trim()
        );

      } else {
        if (getBytesError(proposalText)) return;
        await walletStore?.submitProposal(contractAddress, proposalText.trim());
      }

      handleClose();
    };

    const handleClose = () => {
      setProposalText("");
      setPoolAddress("");
      setSequencerPublicKey("");
      setModalOpen(false);
    };

    const validateForm = (): boolean => {
      if (isSequencer) {
        if (poolAddress.trim() === "") return false;
        if (sequencerPublicKey.trim() === "") return false;
        return !getBytesError(poolAddress);
      } else {
        return !getBytesError(proposalText);
      }
    };

    const isFormValid = validateForm();

    const bytesError = !isSequencer ? getBytesError(proposalText) : null;
    const poolAddressBytesError = isSequencer ? getBytesError(poolAddress) : null;

    return (
      <>
        <Button variant="contained" onClick={() => setModalOpen(true)}>
          {isSubmitting ? "Submitting..." : "Submit Proposal"}
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
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
            >
              {isSequencer ? (
                <>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Enter pool address"
                    value={poolAddress}
                    onChange={(e) => setPoolAddress(e.target.value)}
                    error={!!poolAddressBytesError && poolAddress.trim() !== ""}
                    helperText={
                      poolAddressBytesError && poolAddress.trim() !== ""
                        ? poolAddressBytesError
                        : "Enter hex bytes (0-9, a-f), >65 chars, even length"
                    }
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
                  placeholder="Enter Proposal Hash"
                  value={proposalText}
                  onChange={(e) => setProposalText(e.target.value)}
                  error={!!bytesError && proposalText.trim() !== ""}
                  helperText={
                    bytesError && proposalText.trim() !== ""
                      ? bytesError
                      : "Enter hex bytes (0-9, a-f), >66 chars, even length"
                  }
                />
              )}

              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmitProposal}
                disabled={!isFormValid || isSubmitting}
                fullWidth
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </Box>
          </DialogContent>
        </Dialog>
      </>
    );
  }
);
