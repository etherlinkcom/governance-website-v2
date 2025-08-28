import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import { ComponentLoading } from "@/components/shared/ComponentLoading";
import { ProposalCard } from "@/components/proposal/ProposalCard";
import { getProposalQuorumPercent } from "@/lib/votingCalculations";
import { VotingProgress } from "@/components/shared/VotingProgress";
import { contractStore } from "@/stores/ContractStore";
import { getWalletStore } from "@/stores/WalletStore";
import { useState } from "react";
import { FrontendProposal } from "@/types/api";

const ProposalsListSkeleton = () => (
  <Box>
    <Box
      sx={{
        display: "flex",
        justifyContent: "end",
        alignItems: "center",
        mb: 2,
      }}
    >
      <ComponentLoading width={80} height={24} />
    </Box>
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {[...Array(3)].map((_, idx) => (
        <ComponentLoading key={idx} width="100%" height={80} borderRadius={2} />
      ))}
    </Box>
  </Box>
);

interface ProposalsListProps {
  contractVotingIndex: number;
  contractAddress?: string;
  isCurrentPeriod?: boolean;
}

export const ProposalsList = observer(
  ({ contractVotingIndex, contractAddress }: ProposalsListProps) => {
    const [submitModalOpen, setSubmitModalOpen] = useState(false);
    const [proposalText, setProposalText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const walletStore = getWalletStore();

    const {
      proposals,
      proposalsPeriodData,
      isLoading,
      error,
      hasValidParams,
      contractAndConfig,
    } = contractStore.getPeriodData(contractAddress, contractVotingIndex);

    const isCurrentPeriod = proposalsPeriodData?.period_class === "current";

    const handleSubmitProposal = async () => {
      if (!contractAddress || !proposalText.trim() || !walletStore) return;

      setIsSubmitting(true);
      try {
        const opHash = await walletStore.submitProposal(
          contractAddress,
          proposalText
        );
        if (opHash) {
          setSubmitModalOpen(false);
          setProposalText("");
        }
        await new Promise(res => setTimeout(res, 3000))
        await contractStore.getPeriodDetails(contractAddress, contractVotingIndex, true);
      } catch (error) {
        console.error("Error submitting proposal:", error);
      } finally {
        setIsSubmitting(false);
      }
    };

    if (!hasValidParams) {
      return (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center", py: 3 }}
        >
          No proposals found
        </Typography>
      );
    }

    if (isLoading) return <ProposalsListSkeleton />;

    if (error) {
      return (
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="h6" sx={{ color: "error.main", mb: 1 }}>
            Error Loading Proposals
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {error}
          </Typography>
        </Box>
      );
    }

    const totalProposalUpvotes = proposals
      .map((e: FrontendProposal) => BigInt(e.upvotes))
      .reduce((a: bigint, b: bigint) => a + b, BigInt(0));
    const quorumPercent = Number(
      getProposalQuorumPercent(
        totalProposalUpvotes,
        proposalsPeriodData?.total_voting_power
      )
    );
    const contractQuorum = contractAndConfig?.proposal_quorum || 1;
    const progress = Math.min((quorumPercent / contractQuorum) * 100, 100);

    return (
      <Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "flex-start",
            justifyContent: { xs: "center", sm: "space-between" },
            mb: 2,
            mx: 0.5,
            mr: { xs: 0, sm: 1 },
          }}
        >
          <Box>
            {isCurrentPeriod && walletStore?.hasVotingPower && (
              <Button
                variant="contained"
                onClick={() => setSubmitModalOpen(true)}
                sx={{ mb: { xs: 2, sm: 0 } }}
              >
                Submit Proposal
              </Button>
            )}
          </Box>
          <Box
            sx={{
              width: { xs: "95%", sm: 250 },
            }}
          >
            <VotingProgress
              label="Quorum"
              value={quorumPercent.toFixed(2)}
              required={contractQuorum}
              progress={progress}
              variant="body1"
            />
          </Box>
        </Box>

        <Dialog
          open={submitModalOpen}
          onClose={() => setSubmitModalOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Submit New Proposal</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Proposal"
              type="text"
              fullWidth
              multiline
              rows={4}
              value={proposalText}
              onChange={(e) => setProposalText(e.target.value)}
              placeholder="Enter your proposal details..."
              variant="outlined"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSubmitModalOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSubmitProposal}
              variant="contained"
              disabled={!proposalText.trim() || isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </DialogActions>
        </Dialog>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {proposals.length > 0 ? (
            proposals.map((proposal, i) => (
              <ProposalCard
                key={i}
                proposal={proposal}
                contractAddress={contractAddress}
                isCurrentPeriod={isCurrentPeriod}
                contractVotingIndex={contractVotingIndex}
              />
            ))
          ) : (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center", py: 3 }}
            >
              {contractVotingIndex
                ? `No proposals found for period ${contractVotingIndex}`
                : "No proposals found"}
            </Typography>
          )}
        </Box>
      </Box>
    );
  }
);
