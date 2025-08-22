import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  Button,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Period } from "@trilitech/types";
import { useState } from "react";
import { PeriodDetailsModal } from "@/components/period/PeriodDetailsModal";
import { formatDate } from "@/lib/formatDate";
import { HashDisplay } from "@/components/shared/HashDisplay";
import { HashLink } from "@/components/shared/HashLink";
import { PayloadKey } from "@/data/proposalLinks";
import { getLinkData } from "@/lib/getLinkData";
import { contractStore } from "@/stores/ContractStore";
import { observer } from "mobx-react-lite";
import { PeriodVotingStatsPanel } from "@/components/period/PeriodVotingStatsPanel";
import { PeriodMetadata } from "@/components/period/PeriodMetadata";
import { SubmitProposalButton } from "./SubmitProposalModal";

interface PeriodCardProps {
  period: Period;
}

export const PeriodCard = observer(({ period }: PeriodCardProps) => {
  const theme = useTheme();
  const [modalOpen, setModalOpen] = useState(false);
  const isCurrentPeriod = period.period_class === "current";
  const isFuture = period.period_class === "future";

  const hasProposals =
    period.proposal_hashes && period.proposal_hashes.length > 0;
  const hasPromotion = period.promotion_hash;

  const { proposals, promotions, contractAndConfig, isLoading } =
    contractStore.getPeriodData(
      period.contract_address,
      period.contract_voting_index,
      hasProposals,
      hasPromotion ? true : false
    );

  const handleCardClick = () => {
    if (hasProposals || hasPromotion) {
      setModalOpen(true);
    }
  };

  const renderHash = (hash: PayloadKey) => {
    const linkData = getLinkData(hash);
    if (linkData) return <HashLink hash={hash} />;
    return <HashDisplay hash={hash} />;
  };

  if (isFuture) {
    return (
      <Card variant="outlined" sx={{ py: 1, px: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Period {period.contract_voting_index}
            </Typography>
            <Chip
              label="Future"
              size="small"
              variant="outlined"
              color="info"
              sx={{ display: { xs: "none", sm: "block" } }}
            />
          </Box>
          <Box sx={{ textAlign: "right", mb: 1 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, display: { xs: "none", sm: "block" } }}
            >
              Levels: {period.level_start.toLocaleString()} -{" "}
              {period.level_end.toLocaleString()}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mb: -1, display: { xs: "block", sm: "none" } }}
            >
              {formatDate(period.date_start, false)} -{" "}
              {formatDate(period.date_end, false)}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: { xs: "none", sm: "block" } }}
            >
              Start {formatDate(period.date_start)} - End{" "}
              {formatDate(period.date_end)}
            </Typography>
          </Box>
        </Box>
      </Card>
    );
  }

  return (
    <>
      <Card
        onClick={handleCardClick}
        sx={{
          ...(isCurrentPeriod && {
            border: "2px solid",
            borderColor: "primary.main",
            boxShadow: `0px 0px 15px 3px ${theme.palette.primary.main}30`,
          }),
          transition: "all 0.3s ease-in-out",
          cursor: hasProposals || hasPromotion ? "pointer" : "default",
          position: "relative",
        }}
      >
        <CardContent sx={{ p: 3, position: "relative" }}>
          <PeriodVotingStatsPanel
            hasPromotion={hasPromotion}
            hasProposals={hasProposals}
            promotions={promotions}
            proposals={proposals}
            contractAndConfig={contractAndConfig}
            isLoading={isLoading}
            period={period}
          />

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 2,
            }}
          >
            <PeriodMetadata
              period={period}
              proposals={proposals}
              hasProposals={hasProposals}
              hasPromotion={hasPromotion}
              isLoading={isLoading}
              renderHash={renderHash}
            />
          </Box>
          {isCurrentPeriod && !hasPromotion && (
            <Box onClick={(e) => e.stopPropagation()}>
              <SubmitProposalButton
                contractAddress={period.contract_address}
                governanceType={contractAndConfig?.governance_type}
              />
            </Box>
          )}
        </CardContent>
      </Card>
      <PeriodDetailsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        period={period}
      />
    </>
  );
});
