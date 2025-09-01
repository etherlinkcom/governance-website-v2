import { Box, Typography } from "@mui/material";
import { observer } from "mobx-react-lite";
import { FrontendPeriod, FrontendProposal } from "@/types/api";
import { contractStore } from "@/stores/ContractStore";
import { ProposalCard } from "@/components/proposal/ProposalCard";
import { PeriodDateAndLevels } from "@/components/shared/PeriodDateAndLevels";
import { ProposalVotingStats } from "@/components/shared/VotingStats";
import { TimeRemaining } from "@/components/current/TimeRemaining";
import { CopyButton } from "../shared/CopyButton";

interface ProposalViewProps {
  period: FrontendPeriod;
  isCurrent?: boolean;
}

export const ProposalView = observer(
  ({ period, isCurrent = false }: ProposalViewProps) => {
    const contract = contractStore.getContract(period.contract);

    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: isCurrent ? 2 : 5,
          minHeight: 600,
          p: { xs: 2, sm: 4 },
          pt: { xs: 5, sm: 4 },
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
          <Box>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              mb: 0.5
            }}>
              <Typography variant="body2">
                Contract: {period.contract}
              </Typography>
            <CopyButton
              text={period.contract}
              message="Contract address copied"
              sx={{color: 'primary.main'}}
              />
            </Box>
            <PeriodDateAndLevels period={period} />
          </Box>
          <Box>
            {isCurrent && <TimeRemaining currentPeriod={period} />}

            <ProposalVotingStats
              proposals={period.proposals!}
              totalVotingPower={period.totalVotingPower}
              contractQuorum={contract!.proposal_quorum}
            />
          </Box>
        </Box>

        {/* Proposal List */}
        <Box
          sx={{
            gap: 2,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {period.proposals?.map((proposal: FrontendProposal, index: number) => (
            <ProposalCard
              key={proposal.proposal_hash}
              proposal={proposal}
              defaultExpanded={
                !isCurrent && index === (period.proposals?.length || 0) - 1
              }
            />
          ))}
        </Box>
      </Box>
    );
  }
);
