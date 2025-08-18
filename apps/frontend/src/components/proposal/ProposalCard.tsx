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

interface ProposalCardProps {
  proposal: FrontendProposal;
  contractAddress: string;
  isCurrentPeriod?: boolean;
  contractVotingIndex: number;
}

export const ProposalCard = observer(({ proposal, contractAddress, isCurrentPeriod, contractVotingIndex }: ProposalCardProps) => {
  const walletStore = getWalletStore();
  const isUpvoting = walletStore?.isVoting;

  const handleUpvote = async () => {
    if (!contractAddress || !walletStore) return;

    try {
      const operation: OperationResult | undefined = await walletStore.upvoteProposal(contractAddress, proposal.proposal_hash);

      if (!operation?.completed) return;
      contractStore.createUpvote(
        operation?.level || 0,
        proposal.proposal_hash,
        walletStore.address || '',
        walletStore.alias,
        walletStore.votingPowerAmount,
        operation?.opHash || '',
        contractAddress,
        contractVotingIndex
      );
    } catch (error) {
      console.error('Error upvoting proposal:', error);
    }
  };

  return (
    <Accordion sx={{ mx: 1 }}>
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
            <HashDisplay hash={proposal.proposal_hash} sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} />
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
        <Typography>
          Voters table TODO
        </Typography>
      </AccordionDetails>
    </Accordion>
  );
};
