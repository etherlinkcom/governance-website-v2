import { Box, Typography, useTheme } from "@mui/material";
import {
  PromotionVotingStats,
  ProposalVotingStats,
} from "@/components/shared/VotingStats";
import { ComponentLoading } from "@/components/shared/ComponentLoading";
import {
  ContractAndConfig,
  Period,
  Promotion,
} from "@trilitech/types";
import { FrontendProposal } from "@/types/api";

interface PeriodVotingStatsPanelProps {
  hasPromotion?: string;
  hasProposals?: boolean;
  promotions?: Promotion[];
  proposals?: FrontendProposal[];
  contractAndConfig?: ContractAndConfig;
  isLoading: boolean;
  period?: Period;
}

export const PeriodVotingStatsPanel = ({
  hasPromotion,
  hasProposals,
  promotions,
  proposals,
  contractAndConfig,
  isLoading,
  period,
}: PeriodVotingStatsPanelProps) => {
  const theme = useTheme();

  if (hasPromotion) {
    let totalVotingPower = 0;
    if (promotions && promotions[0]) {
      totalVotingPower = promotions[0].yea_voting_power +
        promotions[0].nay_voting_power +
        promotions[0].pass_voting_power ||
        0;
    }

    return (
      <Box
        sx={{
          position: "absolute",
          right: 24,
          display: { xs: "none", md: "block" },
          width: "255px",
        }}
      >
        {isLoading ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <ComponentLoading width="255px" borderRadius={2} sx={{ mt: 1 }} />
            <ComponentLoading width="255px" borderRadius={2} />
            <ComponentLoading width="255px" borderRadius={2} />
          </Box>
        ) : promotions && promotions[0] ? (
          <>
            <PromotionVotingStats
              yeaVotingPower={promotions[0].yea_voting_power || 0}
              nayVotingPower={promotions[0].nay_voting_power || 0}
              passVotingPower={promotions[0].pass_voting_power || 0}
              totalVotingPower={promotions[0].total_voting_power || 0}
              contractQuorum={contractAndConfig?.promotion_quorum || 0}
              contractSupermajority={
                contractAndConfig?.promotion_supermajority || 0
              }
            />
            <Box sx={{ display: "flex", gap: 1, justifyContent: "space-between" }}>
                <Typography sx={{ color: `${theme.palette.success.main} !important` }}>
                  Yea: {(((promotions[0].yea_voting_power / totalVotingPower) || 0) * 100).toFixed(0)}%
                </Typography>
                <Typography sx={{ color: `${theme.palette.error.main} !important` }}>
                  Nay: {(((promotions[0].nay_voting_power / totalVotingPower) || 0) * 100).toFixed(0)}%
                </Typography>
                <Typography sx={{ color: `${theme.palette.warning.main} !important` }}>
                  Pass: {(((promotions[0].pass_voting_power / totalVotingPower) || 0) * 100).toFixed(0)}%
                </Typography>
            </Box>
          </>
        ) : null}
      </Box>
    );
  }

  if (hasProposals) {
    return (
      <Box
        sx={{
          position: "absolute",
          right: 24,
          display: { xs: "none", md: "block" },
          width: "255px",
        }}
      >
        {isLoading ? (
          <ComponentLoading width={255} sx={{ mt: 2, display: 'flex' }} />
        ) : proposals && period && proposals[0] ? (
          <ProposalVotingStats
            proposals={proposals}
            totalVotingPower={period.total_voting_power}
            contractQuorum={contractAndConfig?.proposal_quorum || 0}
          />
        ) : null}
      </Box>
    );
  }

  return null;
};