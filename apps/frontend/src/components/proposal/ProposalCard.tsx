import { formatDate } from "@/lib/formatDate";
import { Card, CardContent, Box, Typography, Link, Button, Chip } from "@mui/material";
import { Proposal } from "@trilitech/types";
import { HashDisplay } from "@/components/shared/HashDisplay";
import { formatNumber } from "@/lib/formatNumber";
import { HashLink } from "@/components/shared/HashLink";
import { EllipsisBox } from "@/components/shared/EllipsisBox";
import { getWalletStore } from "@/stores/WalletStore";

interface ProposalCardProps {
  proposal: Proposal;
  contractAddress?: string;
  isCurrentPeriod?: boolean;
}

export const ProposalCard = ({ proposal, contractAddress, isCurrentPeriod }: ProposalCardProps) => {
  const walletStore = getWalletStore();
  const isUpvoting = walletStore?.isVoting;

  const handleUpvote = async () => {
    if (!contractAddress || !walletStore) return;

    try {
      const opHash = await walletStore.upvoteProposal(contractAddress, proposal.proposal_hash);
      if (opHash) console.log('Proposal upvoted successfully:', opHash);
    } catch (error) {
      console.error('Error upvoting proposal:', error);
    } finally {
    }
  };

  return (
    <Card sx={{ mx: 1 }}>
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <EllipsisBox sx={{ flex: 1 }}>
            <HashDisplay hash={proposal.proposal_hash} />
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              by{" "}
              {proposal.transaction_hash ? (
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
                >
                  {proposal.alias || proposal.proposer}
                </Link>
              ) : (
                <span>{proposal.alias || proposal.proposer}</span>
              )}
            </Typography>
            <HashLink hash={proposal.proposal_hash} />

            {proposal.time && (
              <Typography variant="subtitle2">
                {formatDate(proposal.time)}
              </Typography>
            )}
          </EllipsisBox>

          <Box sx={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1 }}>
            <Typography variant="subtitle2">Upvotes:</Typography>
            <Typography variant="body1" sx={{ display: "block" }}>
              {formatNumber(proposal.upvotes)}
            </Typography>

            {isCurrentPeriod && walletStore?.hasVotingPower && (
              <Button
                variant="outlined"
                size="small"
                onClick={handleUpvote}
                disabled={isUpvoting}
                sx={{ mt: 1 }}
              >
                {isUpvoting ? 'Upvoting...' : 'Upvote'}
              </Button>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
