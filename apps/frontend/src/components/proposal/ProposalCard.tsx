import { formatDate } from "@/lib/formatDate";
import { Card, CardContent, Box, Typography, Link, Button, Chip, CircularProgress } from "@mui/material";
import { HashDisplay } from "@/components/shared/HashDisplay";
import { formatNumber } from "@/lib/formatNumber";
import { HashLink } from "@/components/shared/HashLink";
import { EllipsisBox } from "@/components/shared/EllipsisBox";
import { getWalletStore, OperationResult } from "@/stores/WalletStore";
import { FrontendProposal } from "@/types/api";
import { contractStore } from "@/stores/ContractStore";
import { observer } from "mobx-react-lite";

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
              {formatNumber(parseInt(proposal.upvotes))}
            </Typography>

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
        </Box>
      </CardContent>
    </Card>
  );
});
