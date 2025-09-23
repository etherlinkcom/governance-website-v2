"use client";

import { formatDate } from "@/lib/formatDate";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
  Link,
  Button,
  CircularProgress,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { HashDisplay } from "@/components/shared/HashDisplay";
import { formatNumber } from "@/lib/formatNumber";
import { EllipsisBox } from "@/components/shared/EllipsisBox";
import { LearnMoreButton } from "../shared/LearnMoreButton";
import { UpvotersTable } from "./UpvotersTable";
import { FrontendProposal } from "@/types/api";
import { getWalletStore, OperationResult } from "@/stores/WalletStore";
import { contractStore } from "@/stores/ContractStore";
import { ContractAndConfig } from "@trilitech/types";

interface ProposalCardProps {
  proposal: FrontendProposal;
  contractVotingIndex: number;
  defaultExpanded?: boolean;
  isCurrentPeriod?: boolean
}

export const ProposalCard = ({ proposal, contractVotingIndex, defaultExpanded, isCurrentPeriod}: ProposalCardProps) => {

  const walletStore = getWalletStore();
  const contract: ContractAndConfig | undefined = contractStore.currentContract
  const isUpvoting = walletStore?.isVoting;

  const handleUpvote = async () => {
    if (!contract || !walletStore) return;

    try {
      const operation: OperationResult | undefined = await walletStore.upvoteProposal(contract.contract_address, proposal.proposal_hash);

      if (!operation?.completed) return;
      contractStore.createUpvote(
        operation?.level || 0,
        proposal.proposal_hash,
        walletStore.address || '',
        walletStore.alias,
        walletStore.votingPowerAmount,
        operation?.opHash || '',
        contract.contract_address,
        contractVotingIndex,
      );
    } catch (error) {
      console.error('Error upvoting proposal:', error);
    }
  };

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

            {/* Upvote Button */}
            <Box sx={{ flexShrink: 0 }}>
              {isCurrentPeriod && walletStore?.hasVotingPower && (
              <Button
                variant="outlined"
                size="small"
                onClick={handleUpvote}
                disabled={isUpvoting}
                sx={{ mt: 1, minWidth: 97 }}
              >
                {isUpvoting ? <CircularProgress size="20px" sx={{color: theme => theme.palette.primary.main}} /> : 'Upvote'}
              </Button>
            )}
            </Box>

            {/* Learn More Button */}
            <Box sx={{ flexShrink: 0 }}>
              <LearnMoreButton proposalHash={proposal.proposal_hash} />
            </Box>

            {/* Upvotes */}
            <Box sx={{ textAlign: "right", flexShrink: 0 }}>
              <Typography variant="subtitle2">Upvotes:</Typography>
              <Typography variant="body1" sx={{ display: "block" }}>
                {formatNumber(parseInt(proposal.upvotes))}
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
