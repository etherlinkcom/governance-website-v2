import { Box, Typography } from "@mui/material";
import { LearnMoreButton } from "../shared/LearnMoreButton";
import { formatNumber } from "@/lib/formatNumber";
import { FrontendProposal } from "@/types/api";

interface LearnMoreAndUpvotesProps {
  proposal: FrontendProposal;
  sx?: any;
}

export const LearnMoreAndUpvotes = ({ sx, proposal }: LearnMoreAndUpvotesProps) => (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        gap: { xs: 2, md: 3 },
        width: { xs: "100%", md: "auto" },
        justifyContent: { xs: "space-between", md: "flex-end" },
        alignItems: "center",
        ...sx
      }}
    >
      <LearnMoreButton proposalHash={proposal.proposal_hash}/>

      <Box sx={{ textAlign: "right", flexShrink: 0 }}>
        <Typography variant="subtitle2">Upvotes:</Typography>
        <Typography variant="body1" sx={{ display: "block" }}>
          {formatNumber(parseInt(proposal.upvotes))}
        </Typography>
      </Box>
    </Box>
  );