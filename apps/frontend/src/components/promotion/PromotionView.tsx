import { Box, IconButton, Typography } from "@mui/material";
import { observer } from "mobx-react-lite";
import { FrontendPeriod } from "@/types/api";
import { contractStore } from "@/stores/ContractStore";
import { VotersTable } from "@/components/promotion/VotersTable";
import { HashDisplay } from "@/components/shared/HashDisplay";
import { EllipsisBox } from "@/components/shared/EllipsisBox";
import { PeriodDateAndLevels } from "@/components/shared/PeriodDateAndLevels";
import { PromotionVotingStatsPanel } from "@/components/promotion/PeriodVotingStatsPanel";
import { LearnMoreButton } from "@/components/shared/LearnMoreButton";
import { TimeRemaining } from "@/components/current/TimeRemaining";
import { CopyButton } from "@/components/shared/CopyButton";
import { VoteButton } from "@/components/promotion/VoteButton";
import CloseIcon from '@mui/icons-material/Close';

interface PromotionViewProps {
  period: FrontendPeriod;
  isCurrent?: boolean;
  onClose?: () => void;
}

export const PromotionView = observer(({ period, isCurrent = false, onClose }: PromotionViewProps) => {
    const contract = contractStore.getContract(period.contract);

    return (
      <Box
        className="modal-content"
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 5,
          height: "100%",
          overflow: "auto",
          p: { xs: 2, sm: 4 },
          pt: { xs: 5, sm: 4 },
        }}
      >
        {!isCurrent && onClose && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: -4, mt: -3, mr: -2  }}>
            <IconButton
              onClick={onClose}
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  color: 'text.primary',
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        )}
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
              <Typography variant="body2" sx={{ display: { xs: 'none', md: 'block' } }}>
                Contract: {period.contract}
              </Typography>

              <Typography variant="body2" sx={{ display: { xs: 'block', md: 'none' } }}>
                {period.contract}
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

            <PromotionVotingStatsPanel
              promotion={period.promotion!}
              period={period}
              contractAndConfig={contract!}
            />
          </Box>
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
          <Box sx={{ width: { xs: "100%", md: "80%" } }}>
            <Typography>Candidate:</Typography>
            <EllipsisBox sx={{ maxWidth: "100%" }}>
              <HashDisplay hash={period.promotion?.proposal_hash || ""} />
            </EllipsisBox>
          </Box>


          <Box sx={{ display: "flex", gap: 2}}>
            <VoteButton
              isCurrentPeriod={isCurrent}
              contractVotingIndex={period.contract_voting_index}
              promotionHash={period.promotion?.proposal_hash || ""}
            />
            <LearnMoreButton proposalHash={period.promotion?.proposal_hash} />
          </Box>
        </Box>

        <VotersTable
          contractAddress={period.contract}
          proposalHash={period.promotion?.proposal_hash || ""}
          contractVotingIndex={period.contract_voting_index}
        />
      </Box>
    );
  }
);
