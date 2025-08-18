import { Box, Typography } from "@mui/material";
import { observer } from "mobx-react-lite";
import { FrontendPeriod } from "@/types/api";
import { contractStore } from "@/stores/ContractStore";
import { VotersTable } from "@/components/promotion/VotersTable";
import { HashDisplay } from "@/components/shared/HashDisplay";
import { EllipsisBox } from "@/components/shared/EllipsisBox";
import { PeriodDateAndLevels } from "../shared/PeriodDateAndLevels";
import { PromotionVotingStatsPanel } from "../period/PeriodVotingStatsPanel";
import { LearnMoreButton } from "../shared/LearnMoreButton";

interface PromotionViewProps {
  period: FrontendPeriod;
  isCurrent?: boolean;
}

export const PromotionView = observer(
  ({ period, isCurrent = false }: PromotionViewProps) => {
    const contract = contractStore.getContract(period.contract);

    return (
      <Box
        className="modal-content"
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: isCurrent ? 2 : 5,
          height: isCurrent ? "400px" : "100%",
          overflow: isCurrent ? "hidden" : "auto",
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

          <PeriodDateAndLevels period={period} />

          <PromotionVotingStatsPanel
            promotion={period.promotion!}
            period={period}
            contractAndConfig={contract!}
          />
        </Box>

        {/* Candidate Info */}
        <Box
          sx={{
            display: "flex",
            justifyContent: { xs: "flex-start", md: "space-between" },
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 2, md: 0 },
            alignItems: { xs: "flex-start", md: "center" },
          }}
        >

          <Box>
            <Typography>Candidate:</Typography>
            <EllipsisBox sx={{ width: { xs: "100vw", md: "70vw" } }}>
              <HashDisplay hash={period.promotion?.proposal_hash || ""} />
            </EllipsisBox>
          </Box>

          <Box>
            <LearnMoreButton proposalHash={period.promotion?.proposal_hash} />
          </Box>
        </Box>

        <VotersTable
          proposalHash={period.promotion?.proposal_hash || ""}
          contractVotingIndex={period.contract_voting_index}
        />
      </Box>
    );
  }
);
