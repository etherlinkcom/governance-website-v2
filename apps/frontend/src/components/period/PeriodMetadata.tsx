import { Box, Typography, Chip } from "@mui/material";
import { EllipsisBox } from "@/components/shared/EllipsisBox";
import { Period } from "@trilitech/types";
import { JSX } from "react";
import { formatDate } from "@/lib/formatDate";

interface PeriodMetadataProps {
  period: Period;
  hasProposals?: boolean;
  hasPromotion?: string;
  renderHash: (hash: string) => JSX.Element;
}
export const PeriodMetadata = ({
  period,
  hasProposals,
  hasPromotion,
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
          label={`${period.proposal_hashes?.length} Proposal`}
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
        {period.proposal_hashes?.map((hash, index) => (
          <EllipsisBox key={index}>{renderHash(hash)}</EllipsisBox>
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
