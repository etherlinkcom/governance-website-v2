import { formatDate } from "@/lib/formatDate";
import { Card, CardContent, Box, Typography, Link, Button } from "@mui/material";
import { Proposal } from "@trilitech/types";
import { HashDisplay } from "@/components/shared/HashDisplay";
import { formatNumber } from "@/lib/formatNumber";
import { HashLink } from "@/components/shared/HashLink";
import { EllipsisBox } from "../shared/EllipsisBox";
import { getWalletStore } from "@/stores/WalletStore";

interface ProposalCardProps {
  proposal: Proposal;
  isCurrent?: boolean;
}

export const ProposalCard = ({ proposal, isCurrent }: ProposalCardProps) => {

  const walletStore = getWalletStore()

  return (
    <>
    <Card
      sx={(theme) => ({mx: 1})}
    >
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

          <Box sx={{ textAlign: "right" }}>
            <Typography variant="subtitle2">Upvotes:</Typography>
            <Typography variant="body1" sx={{ display: "block" }}>
              {formatNumber(proposal.upvotes)}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
    {
      isCurrent &&
      <Button
        variant="contained"
        color="primary"
        sx={{ mx: 2, mb: 2, justifySelf: "flex-end", width: { xs: 'auto', sm: '100px' } }}
        onClick={() => walletStore?.upvoteProposal(proposal.contract_address, proposal.proposal_hash)}
      >
        Upvote
      </Button>
    }
      </>
  );
};
