import { allLinkData } from '@/data/proposalLinks';
import { formatDate } from '@/lib/formatDate';
import { Card, CardContent, Box, Typography, Link } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Proposal } from '@trilitech/types';
import { HashDisplay } from '../shared/HashDisplay';

interface ProposalCardProps {
  proposal: Proposal;
}

export const ProposalCard = ({ proposal}: ProposalCardProps) => {
  const theme = useTheme();

  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>

            <HashDisplay hash={proposal.proposal_hash} />
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              by{' '}
              {proposal.transaction_hash ? (
                <Link
                  href={`${process.env.NEXT_PUBLIC_TZKT_API_URL}/${proposal.transaction_hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: 'primary.main',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  {proposal.alias || proposal.proposer}
                </Link>
              ) : (
                <span>{proposal.alias || proposal.proposer}</span>
              )}
            </Typography>

            {proposal.time && (
              <Typography variant="subtitle2">
                {formatDate(proposal.time)}
              </Typography>
            )}
          </Box>

          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="subtitle2">
              Upvotes:
            </Typography>
            <Typography variant="body1" sx={{ display: 'block' }}>
              TODO
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};