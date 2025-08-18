import { Box, Typography, useTheme } from "@mui/material";
import {
  PromotionVotingStats,
  ProposalVotingStats,
} from "@/components/shared/VotingStats";
import { ComponentLoading } from "@/components/shared/ComponentLoading";
import { ContractAndConfig, Promotion, Proposal } from "@trilitech/types";
import { FrontendPeriod } from "@/types/api";

interface PeriodVotingStatsPanelProps {
  hasPromotion?: string;
  hasProposals?: boolean;
  promotions?: Promotion[];
  proposals?: Proposal[];
  contractAndConfig: ContractAndConfig;
  isLoading: boolean;
  period: FrontendPeriod;
}

interface PromotionVotingStatsPanelProps {
  promotion: Promotion;
  period: FrontendPeriod;
  contractAndConfig: ContractAndConfig;
}

export const PromotionVotingStatsPanel = ({
  promotion,
  period,
  contractAndConfig,
}: PromotionVotingStatsPanelProps) => {
  const theme = useTheme();
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <PromotionVotingStats
        yeaVotingPower={promotion.yea_voting_power || 0}
        nayVotingPower={promotion.nay_voting_power || 0}
        passVotingPower={promotion.pass_voting_power || 0}
        totalVotingPower={period.totalVotingPower || 0}
        contractQuorum={contractAndConfig?.promotion_quorum || 0}
        contractSupermajority={contractAndConfig?.promotion_supermajority || 0}
      />
      <Box sx={{ display: "flex", gap: 1, justifyContent: "space-between" }}>
        <Typography sx={{ color: `${theme.palette.success.main} !important` }}>
          Yea:{" "}
          {(
            (promotion.yea_voting_power / period.totalVotingPower) *
            100
          ).toFixed(0)}
          %
        </Typography>
        <Typography sx={{ color: `${theme.palette.error.main} !important` }}>
          Nay:{" "}
          {(
            (promotion.nay_voting_power / period.totalVotingPower) *
            100
          ).toFixed(0)}
          %
        </Typography>
        <Typography sx={{ color: `${theme.palette.warning.main} !important` }}>
          Pass:{" "}
          {(
            (promotion.pass_voting_power / period.totalVotingPower) *
            100
          ).toFixed(0)}
          %
        </Typography>
      </Box>
    </Box>
  );
};



// TODO break this into two files
// Promotion voting stats and proposal voting stats
export const PeriodVotingStatsPanel = ({
  hasPromotion,
  hasProposals,
  promotions,
  proposals,
  contractAndConfig,
  isLoading,
  period,
}: PeriodVotingStatsPanelProps) => {

  if (hasPromotion) {
    let totalVotingPower = 0;
    if (promotions && promotions[0]) {
      totalVotingPower =
        promotions[0].yea_voting_power +
          promotions[0].nay_voting_power +
          promotions[0].pass_voting_power || 0;
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
          <PromotionVotingStatsPanel
            promotion={promotions[0]}
            period={period}
            contractAndConfig={contractAndConfig}
          />
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
          <ComponentLoading width={255} sx={{ mt: 2, display: "flex" }} />
        ) : proposals && period && proposals[0] ? (
          <ProposalVotingStats
            proposals={proposals}
            totalVotingPower={period.totalVotingPower}
            contractQuorum={contractAndConfig?.proposal_quorum || 0}
          />
        ) : null}
      </Box>
    );
  }

  return null;
};
