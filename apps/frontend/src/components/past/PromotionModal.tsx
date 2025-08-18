import { FrontendPeriod } from "@/types/api";
import { Box, Modal, Typography } from "@mui/material";
import { observer } from "mobx-react-lite";
import { HashDisplay } from "../shared/HashDisplay";
import { EllipsisBox } from "../shared/EllipsisBox";
import { VotersTable } from "../promotion/VotersTable";
import { contractStore } from "@/stores/ContractStore";
import { PromotionVotingStatsPanel } from "../period/PeriodVotingStatsPanel";
import { PeriodDateAndLevels } from "@/components/shared/PeriodDateAndLevels";
import { LearnMoreButton } from "../shared/LearnMoreButton";

interface PromotionModalProps {
  open: boolean;
  onClose: () => void;
  period: FrontendPeriod;
}

export const PromotionModal = observer(
  ({ open, onClose, period }: PromotionModalProps) => {
    const contract = contractStore.getContract(period.contract);

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
              justifyContent: { sx: "flex-start", md: "space-between" },
              flexDirection: { xs: "column", md: "row" },
              gap: { xs: 2, md: 0 },
              alignItems: { xs: "flex-start", md: "center" },
            }}
          >
            <Box>
              <Typography>Candidate:</Typography>
              <EllipsisBox sx={{ width: { xs: "100vw", md: "70vw" } }}>
                <HashDisplay
                  hash={period.promotion?.proposal_hash || ""}
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                />
              </EllipsisBox>
            </Box>
            <Box>
              <LearnMoreButton proposalHash={period.promotion?.proposal_hash} />
            </Box>
          </Box>

          <VotersTable proposalHash={period.promotion?.proposal_hash || ""} contractVotingIndex={period.contract_voting_index} />
        </Box>
      </Modal>
    );
  }
);
