import { Box, Typography, Chip, SxProps } from "@mui/material";
import { EllipsisBox } from "@/components/shared/EllipsisBox";
import { Period, Proposal } from "@trilitech/types";
import { JSX } from "react";
import { formatDate } from "@/lib/formatDate";
import { formatNumber } from "@/lib/formatNumber";
import { ComponentLoading } from "../shared/ComponentLoading";

interface PeriodMetadataProps {
  period: Period;
  proposals?: Proposal[];
  hasProposals?: boolean;
  hasPromotion?: string;
  isLoading?: boolean;
  renderHash: (hash: string) => JSX.Element;
}
export const PeriodMetadata = ({
  period,
  proposals,
  hasProposals,
  hasPromotion,
  isLoading,
  renderHash,
}: PeriodMetadataProps) => (
  <Box sx={{ flex: 1 }}>
    <Typography variant="body2" sx={{ mb: 1, display: "block" }}>
      Period {period.contract_voting_index}{" "}
      {period.period_class === "current" && (
        <Chip
          component="span"
          label="Current"
          color="primary"
          variant="filled"
          size="small"
          sx={{ mt: -0.5, ml: 1 }}
        />
      )}
    </Typography>
    <Typography variant="subtitle2" sx={{ mb: 1 }}>
      Levels: {period.level_start.toLocaleString()} -{" "}
      {period.level_end.toLocaleString()}
    </Typography>
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ display: { xs: "block", sm: "none" }, mb: 2 }}
    >
      {formatDate(period.date_start, false)} -{" "}
      {formatDate(period.date_end, false)}
    </Typography>
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ display: { xs: "none", sm: "block" }, mb: 2 }}
    >
      Start {formatDate(period.date_start)} - End {formatDate(period.date_end)}
    </Typography>

    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
      {hasProposals && (
        <Chip
          label={`${period.proposal_hashes?.length} Proposal${period.proposal_hashes?.length === 1 ? '' : 's'}`}
          size="small"
          color="primary"
          variant="outlined"
        />
      )}
      {hasPromotion && (
        <Chip
          label="Promotion"
          size="small"
          color="secondary"
          variant="outlined"
        />
      )}
      {!hasProposals && !hasPromotion && (
        <Typography variant="body1" color="text.secondary">
          No Proposals or Promotions for current period
        </Typography>
      )}
    </Box>

    {hasProposals && (
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Proposals:
        </Typography>
        {period.proposal_hashes?.map((hash: string, index) => (
          <Box
            key={index}
            sx={{
              justifyContent: "space-between",
              display: "flex",
              width: '100%' ,
              alignItems: "center",
              }}>
            <EllipsisBox
              sx={{maxWidth: '65vw'}}>
                {renderHash(hash)}
              </EllipsisBox>
            <Box sx={{display: {xs: 'none', md: 'block', wordBreak: 'nobreak'}}}>
              {isLoading ? (
                <ComponentLoading width="115px"/>
              ) : (
                proposals && proposals[index] && (
                  <Typography variant="body2" sx={{ wordWrap: 'normal', whiteSpace: 'nowrap', ml: 2}}>
                  {formatNumber(proposals[index].upvotes)} Upvotes
                </Typography>
              )
            )}
          </Box>
          </Box>
        ))}
      </Box>
    )}

    {hasPromotion && (
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Promotion:
        </Typography>
        <EllipsisBox>{renderHash(period.promotion_hash || "")}</EllipsisBox>
      </Box>
    )}
  </Box>
);
