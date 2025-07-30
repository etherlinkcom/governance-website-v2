import { formatDate } from "@/lib/formatDate";
import { Card, CardContent, Box, Typography, Link, Button } from "@mui/material";
import { Proposal } from "@trilitech/types";
import { HashDisplay } from "@/components/shared/HashDisplay";
import { formatNumber } from "@/lib/formatNumber";
import { HashLink } from "@/components/shared/HashLink";
import { EllipsisBox } from "../shared/EllipsisBox";

interface ProposalCardProps {
  proposal: Proposal;
}

export const ProposalCard = ({ proposal }: ProposalCardProps) => {
  return (
    <>
    <Card
      sx={(theme) => ({
        mx: 1,
        position: "relative",
        transition: "background 0.2s",
        cursor: "pointer",
        "&:hover .upvote-overlay": {
          opacity: 0.9,
          transform: "translateX(0)"
        },
      })}
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
        <Box
          className="upvote-overlay"
          sx={(theme) => ({
        width: "50%",
        height: "100%",
        position: "absolute",
        top: 0,
        right: 0,
        zIndex: 2,
        background: theme.palette.background.paper,
        color: theme.palette.primary.main,
        borderRadius: '25px',
        boxShadow: 2,
        fontWeight: 600,
        opacity: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "opacity 0.2s, transform 0.3s cubic-bezier(.4,0,.2,1)",
        transform: "translateX(100%)",
        pointerEvents: "none",
          })}
        >
          Upvote
        </Box>
        <Typography
          variant="caption"
          sx={{
            display: { xs: "block", sm: "none" },
            textAlign: "center",
            color: "primary.main",
            mt: 1,
          }}
        >
          Tap to upvote
        </Typography>
      </CardContent>
    </Card>
      <Button
        variant="contained"
        color="primary"
        sx={{ mx: 2, mb: 2, justifySelf: "flex-end", width: { xs: 'auto', sm: '100px' } }}
        onClick={() => console.log("Upvote clicked")}
      >
        Upvote
      </Button>
      </>
  );
};
