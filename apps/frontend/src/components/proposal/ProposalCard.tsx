"use client";

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
import { HashDisplay } from "@/components/shared/HashDisplay";
import { EllipsisBox } from "@/components/shared/EllipsisBox";
import { CopyButton } from "@/components/shared/CopyButton";
import { CopyCommandButton } from "@/components/shared/CopyCommandButton";
import { UpvotersTable } from "./UpvotersTable";
import { FrontendProposal } from "@/types/api";
import { UpvoteButton } from "./UpvoteButton";
import { observer } from "mobx-react-lite";
import { LearnMoreAndUpvotes } from "./LearnMoreAndUpvotes";

interface ProposalCardProps {
  proposal: FrontendProposal;
  contractAddress: string;
  isCurrentPeriod: boolean;
  contractVotingIndex: number;
  expanded: boolean;
  onChange: () => void;
}

export const ProposalCard = observer(({
  proposal,
  contractAddress,
  isCurrentPeriod,
  contractVotingIndex,
  expanded,
  onChange,
}: ProposalCardProps) => {

  const hashArg = proposal.proposal_hash.startsWith("0x")
    ? proposal.proposal_hash
    : `0x${proposal.proposal_hash}`;
  // octez-client upvote command; <voting_key> is a placeholder for the voter to edit
  const upvoteCommand = `octez-client call ${contractAddress} from <baking_key or voting_key> \\\n  --entrypoint "upvote_proposal" --arg "${hashArg}" \\\n  --burn-cap 0.11`;

  return (
    <Accordion expanded={expanded} onChange={onChange}>
      <AccordionSummary
        component="div"
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`proposal-${proposal.proposal_hash}-content`}
        id={`proposal-${proposal.proposal_hash}-header`}
        sx={{
          marginX: 1,
          '& .MuiAccordionSummary-content': {
            maxWidth: 'calc(100% - 48px)',
            overflow: 'hidden',
            margin: 0,
          }
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: {xs: "flex-start", md: "center"},
            width: "100%",
            minWidth: 0,
            gap: { xs: 2, md: 0 },
            mr: 1,
            mt:1,
            overflow: 'hidden',
          }}
        >
          {/* Left side - Main content */}
          <EllipsisBox sx={{
            maxWidth: {xs: '100%', md: '70%'},
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
              <HashDisplay
                hash={proposal.proposal_hash}
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}/>
              <CopyButton
                text={proposal.proposal_hash}
                message="Proposal hash copied"
                sx={{ color: "primary.main" }}
              />
            </Box>
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
                href={`${process.env.NEXT_PUBLIC_TZKT_URL}/${proposal.transaction_hash}`}
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
              {isCurrentPeriod && (
                <CopyCommandButton
                  command={upvoteCommand}
                  label="Copy upvote command"
                  message="Upvote command copied"
                  sx={{ fontSize: "inherit", ml: 2 }}
                />
              )}
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

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: { xs: 2, md: 3 },
              width: { xs: "100%", md: "auto" },
              justifyContent: { xs: "flex-start", md: "flex-end" },
              alignItems: "center",
            }}
          >
            <UpvoteButton
              proposalHash={proposal.proposal_hash}
              contractVotingIndex={contractVotingIndex}
              sx={{ width: {xs: "100%", sm: "auto"}}}
            />

            <LearnMoreAndUpvotes proposal={proposal} sx={{ display: { xs: 'none', md: 'flex' } }} />
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails>

        <LearnMoreAndUpvotes proposal={proposal}
          sx={{
            display: { xs: 'flex', md: 'none' },
            mb: 2,
            px: 2
          }}
        />

        <Typography variant='body1' sx={{margin: '8px 16px'}}>
          Upvoters
        </Typography>
        <UpvotersTable proposalHash={proposal.proposal_hash} contractVotingIndex={proposal.contract_period_index} />
      </AccordionDetails>
    </Accordion>
  );
});

