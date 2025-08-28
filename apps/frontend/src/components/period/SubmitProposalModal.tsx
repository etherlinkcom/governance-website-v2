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
import { contractStore } from "@/stores/ContractStore";

interface SubmitProposalButtonProps {
  contractAddress: string;
  governanceType?: GovernanceType;
  contractVotingIndex: number;
}

export const SubmitProposalButton = observer(({ contractAddress, governanceType, contractVotingIndex }: SubmitProposalButtonProps) => {
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
      if (!/^[0-9a-f]+$/.test(input)) return "Must be valid hex (0-9, a-f only)";
      return null;
    };

    const getPoolAddressError = (input: string): string | null => {
      if (!input.trim()) return "Pool address is required";
      if (!/^[0-9a-fA-F]{40}$/.test(input)) return "Pool address must be 40 characters";
      return null;
    };

    const getSequencerPublicKeyError = (input: string): string | null => {
      if (!input.trim()) return "Sequencer public key is required";
      if (input.length !== 54 && input.length !== 55) {
        return "Public key must be 54 or 55 characters";
      }
      if (!input.startsWith("edpk") && !input.startsWith("sppk") && !input.startsWith("p2pk")) {
        return "Public key must start with edpk, sppk, or p2pk";
      }
      if (!/^[1-9A-HJ-NP-Za-km-z]+$/.test(input)) {
        return "Must contain only Base58 characters (no 0, O, I, l)";
      }
      return null;
    };

    const handleSubmitProposal = async () => {
      if (isSequencer) {

        if (poolAddress.trim() === "" || sequencerPublicKey.trim() === "") {
          console.log("Pool address and sequencer public key cannot be blank");
          return;
        }

        if (getPoolAddressError(poolAddress) || getSequencerPublicKeyError(sequencerPublicKey)) return;

        await walletStore?.submitSequencerProposal(
          contractAddress,
          poolAddress.trim(),
          sequencerPublicKey.trim()
        );

      } else {
        if (getBytesError(proposalText)) return;
        await walletStore?.submitProposal(contractAddress, proposalText.trim());
      }

      await new Promise(res => setTimeout(res, 2000))
      contractStore.getPeriods(contractAddress);
      contractStore.getPeriodDetails(contractAddress, contractVotingIndex, false);
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
        if (getPoolAddressError(poolAddress)) return false;
        if (getSequencerPublicKeyError(sequencerPublicKey)) return false;
        return true;
      } else {
        return !getBytesError(proposalText);
      }
    };

    const isFormValid = validateForm();

    const bytesError = !isSequencer ? getBytesError(proposalText) : null;
    const poolAddressError = isSequencer ? getPoolAddressError(poolAddress) : null;
    const sequencerPublicKeyError = isSequencer ? getSequencerPublicKeyError(sequencerPublicKey) : null;

    return (
      <>
      {
        walletStore?.hasVotingPower && (
        <Button variant="contained" onClick={() => setModalOpen(true)}>
          {isSubmitting ? "Submitting..." : "Submit Proposal"}
        </Button>
        )
      }

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
                    placeholder="Enter pool address (0x...)"
                    value={poolAddress}
                    onChange={(e) => setPoolAddress(e.target.value)}
                    error={!!poolAddressError && poolAddress.trim() !== ""}
                    helperText={
                      poolAddressError && poolAddress.trim() !== ""
                        ? poolAddressError
                        : "Pool address must be 40 characters"
                    }
                  />
                  <TextField
                    fullWidth
                    placeholder="Enter sequencer public key (edpk/sppk/p2pk...)"
                    value={sequencerPublicKey}
                    onChange={(e) => setSequencerPublicKey(e.target.value)}
                    error={!!sequencerPublicKeyError && sequencerPublicKey.trim() !== ""}
                    helperText={
                      sequencerPublicKeyError && sequencerPublicKey.trim() !== ""
                        ? sequencerPublicKeyError
                        : "Base58Check encoded, 54-55 chars, starts with edpk/sppk/p2pk"
                    }
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
