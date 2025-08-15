import { Box, Typography, Chip } from "@mui/material";
import { EllipsisBox } from "@/components/shared/EllipsisBox";
import { Period } from "@trilitech/types";
import { JSX } from "react";
import { formatDate } from "@/lib/formatDate";
import { formatNumber } from "@/lib/formatNumber";
import { ComponentLoading } from "@/components/shared/ComponentLoading";
import { FrontendPeriod } from "@/types/api";

interface PeriodMetadataProps {
  period: FrontendPeriod;
  proposals?: Proposal[];
  hasProposals?: boolean;
  hasPromotion?: string;
  isLoading?: boolean;
  renderHash: (hash: string) => JSX.Element;
}
export const PeriodMetadata = observer(({
  period,
  proposals,
  hasProposals,
  hasPromotion,
  isLoading,
  renderHash,
}: PeriodMetadataProps) => (
  <Box sx={{ flex: 1 }}>
    <Typography
      variant="subtitle2"
      sx={{ display: { xs: "block", sm: "none" }, mb: 0 }}
    >
      {formatDate(period.startDateTime, false)} -{" "}
      {formatDate(period.endDateTime, false)}
    </Typography>
    <Typography
      variant="subtitle2"
      sx={{ display: { xs: "none", sm: "block" }, mb: 0 }}
    >
      Start {formatDate(period.startDateTime)} - End{" "}
      {formatDate(period.endDateTime)}
    </Typography>
    <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
      Levels: {period.startLevel.toLocaleString()} -{" "}
      {period.endLevel.toLocaleString()}
    </Typography>

    {hasProposals && (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2">Proposals:</Typography>
        {period.proposals?.map((proposal: Proposal, index) => (
          <Box
            key={index}
            sx={{
              justifyContent: "space-between",
              display: "flex",
              width: "100%",
              alignItems: "center",
            }}
          >
            <EllipsisBox
              sx={{
                width: {
                  xs: "100%",
                  md: "50vw",
                },
              }}
            >
              {renderHash(proposal.proposal_hash)}
            </EllipsisBox>
            <Box
              sx={{
                display: { xs: "none", md: "block", wordBreak: "nobreak" },
              }}
            >
              {isLoading ? (
                <ComponentLoading width={115} sx={{ display: "flex" }} />
              ) : (
                proposals && proposals[index] && (
                  <Typography variant="body2" sx={{ wordWrap: 'normal', whiteSpace: 'nowrap', ml: 2}}>
                  {formatNumber(parseInt(proposals[index].upvotes))} Upvotes
                </Typography>
              )
            )}
          </Box>
          </Box>
        ))}
      </Box>
    )}

    {hasPromotion && (
      <Box sx={{ width: "100%" }}>
        <Typography variant="subtitle2" sx={{ mt: 2 }}>
          Promotion:
        </Typography>
        <EllipsisBox
          sx={{
            width: {
              xs: "100%",
              md: "50vw",
            },
          }}
        >
          {renderHash(period.promotion?.proposal_hash || "")}
        </EllipsisBox>
      </Box>
    )}
  </Box>
));
