import { FrontendPeriod } from "@/types/api";
import { Box, Modal } from "@mui/material";
import { observer } from "mobx-react-lite";
import { PeriodDateAndLevels } from "../shared/PeriodDateAndLevels";
import { ProposalVotingStats } from "../shared/VotingStats";
import { contractStore } from "@/stores/ContractStore";
import { ContractAndConfig, Proposal } from "@trilitech/types";
import { ProposalCard } from "../proposal/ProposalCard";

interface ProposalModalProps {
  open: boolean;
  onClose: () => void;
  period: FrontendPeriod;
}

export const ProposalModal = observer(
  ({ open, onClose, period }: ProposalModalProps) => {
    const contract: ContractAndConfig | undefined = contractStore.getContract(
      period.contract
    );

    return (
      <Modal open={open} onClose={onClose} disableAutoFocus>
        <Box
          className="modal-content"
          sx={{
            p: { xs: 2, sm: 4 },
            pt: { xs: 5, sm: 4 },
            display: "flex",
            flexDirection: "column",
            gap: 5,
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              flexDirection: { xs: "column", md: "row" },
              gap: { xs: 2, md: 0 },
            }}
          >
            <PeriodDateAndLevels period={period} />

            <ProposalVotingStats
              proposals={period.proposals!}
              totalVotingPower={period.totalVotingPower}
              contractQuorum={contract!.proposal_quorum}
            />
          </Box>

          {/* Proposal List */}
          <Box sx={{gap: 2, display: "flex", flexDirection: "column"}}>
          {period.proposals?.map((proposal: Proposal, index: number) => (
            <ProposalCard
              key={proposal.proposal_hash}
              proposal={proposal}
              defaultExpanded={index === (period.proposals?.length || 0) - 1}
            />
          ))}
          </Box>
        </Box>
      </Modal>
    );
  }
);
