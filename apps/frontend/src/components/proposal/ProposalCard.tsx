import { formatDate } from "@/lib/formatDate";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
  Link,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Proposal } from "@trilitech/types";
import { HashDisplay } from "@/components/shared/HashDisplay";
import { formatNumber } from "@/lib/formatNumber";
import { EllipsisBox } from "@/components/shared/EllipsisBox";
import { LearnMoreButton } from "../shared/LearnMoreButton";
import { UpvotersTable } from "./UpvotersTable";
import { defaultHead } from "next/head";

interface ProposalCardProps {
  proposal: Proposal;
  defaultExpanded?: boolean;
}

export const ProposalCard = ({ proposal, defaultExpanded }: ProposalCardProps) => {
  return (
    <Accordion defaultExpanded={defaultExpanded}>
      <AccordionSummary
        component="div"
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`proposal-${proposal.proposal_hash}-content`}
        id={`proposal-${proposal.proposal_hash}-header`}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: {xs: "flex-start", md: "center"},
            width: "100%",
            gap: { xs: 2, md: 0 },
            mr: 2
          }}
        >
          {/* Left side - Main content */}
          <EllipsisBox sx={{
            maxWidth: {xs: '70vw', md: '55vw'},
          }}>
            <HashDisplay
              hash={proposal.proposal_hash}
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}/>
            <Typography
              variant="subtitle2"
              sx={{
                mb: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              by{" "}
              <Link
                href={`${process.env.NEXT_PUBLIC_TZKT_API_URL}/${proposal.transaction_hash}`}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: "primary.main",
                  textDecoration: "none",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {proposal.alias || proposal.proposer}
              </Link>
            </Typography>

            {proposal.time && (
              <Typography
                variant="subtitle2"
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {formatDate(proposal.time)}
              </Typography>
            )}
          </EllipsisBox>

          {/* Right side - Button and Upvotes */}
          <Box
            sx={{
              display: "flex",
              gap: { xs: 2, md: 3 },
              width: { xs: "100%", md: "auto" },
              justifyContent: { xs: "space-between", md: "flex-end" },
            }}
          >
            {/* Learn More Button */}
            <Box sx={{ flexShrink: 0 }}>
              <LearnMoreButton proposalHash={proposal.proposal_hash} />
            </Box>

            {/* Upvotes */}
            <Box sx={{ textAlign: "right", flexShrink: 0 }}>
              <Typography variant="subtitle2">Upvotes:</Typography>
              <Typography variant="body1" sx={{ display: "block" }}>
                {formatNumber(proposal.upvotes)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails>
        <Typography variant='body1'>
          Upvoters
        </Typography>
        <UpvotersTable proposalHash={proposal.proposal_hash} contractVotingIndex={proposal.contract_period_index} />
      </AccordionDetails>
    </Accordion>
  );
};
